import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/api";

export function Login() {
    const [mode, setMode] = useState("login"); // login | register | forgot | reset
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        role: "retailer",
        distributor_id: "",
        date_of_birth: "",
    });
    const [forgotData, setForgotData] = useState({ email: "" });
    const [resetData, setResetData] = useState({
        email: "",
        token: "",
        password: "",
        password_confirmation: "",
    });
    const [resetTokenHint, setResetTokenHint] = useState("");
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (mode === "register" && formData.role === "retailer") {
            loadDistributors();
        }
    }, [mode, formData.role]);

    const loadDistributors = async () => {
        try {
            const res = await api.get("/public/distributors");
            setDistributors(res.data || []);
        } catch {
            setDistributors([]);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getValidationMessage = (error) => {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
            return Object.values(validationErrors)?.[0]?.[0] || "Validation failed";
        }
        return error.response?.data?.message || "Something went wrong";
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === "register") {
                if (formData.password !== formData.password_confirmation) {
                    toast.error("Password and confirm password must match");
                    setLoading(false);
                    return;
                }
                if (formData.role === "retailer" && !distributors.length) {
                    toast.error("No distributor available for retailer registration");
                    setLoading(false);
                    return;
                }
                if (!acceptedTerms) {
                    toast.error("Please accept Terms & Conditions to continue");
                    setLoading(false);
                    return;
                }
            }

            const endpoint = mode === "login" ? "/login" : "/register";
            const payload = mode === "register"
                ? {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation,
                    phone: formData.phone || null,
                    role: formData.role,
                    date_of_birth: formData.date_of_birth || null,
                    distributor_id:
                        formData.role === "retailer"
                            ? Number(formData.distributor_id || distributors[0]?.id) || null
                            : null,
                }
                : {
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                };

            const response = await api.post(endpoint, payload);

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                toast.success(mode === "login" ? "Login successful!" : "Registration successful!");

                const role = response.data.user?.role;
                if (role === "admin") {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    toast.info("Admin is backend-only. Login with Distributor or Retailer in frontend.");
                    navigate("/login", { replace: true });
                    return;
                }

                const nextPath =
                    role === "master_distributor"
                        ? "/master-distributor"
                        : role === "super_distributor"
                            ? "/super-distributor"
                        : role === "distributor"
                            ? "/distributor"
                            : "/retailer";
                navigate(nextPath, { replace: true });

                // Hard fallback for edge cases where router state is stale.
                setTimeout(() => {
                    if (window.location.pathname !== nextPath) {
                        window.location.assign(nextPath);
                    }
                }, 120);
            } else {
                toast.error("Authentication failed: no token received");
            }
        } catch (error) {
            toast.error(getValidationMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/forgot-password", forgotData);
            toast.success(res.data?.message || "Reset token generated.");
            if (res.data?.reset_token) {
                setResetTokenHint(res.data.reset_token);
                setResetData((prev) => ({
                    ...prev,
                    email: res.data.email || forgotData.email,
                    token: res.data.reset_token,
                }));
            } else {
                setResetData((prev) => ({ ...prev, email: forgotData.email }));
            }
            setMode("reset");
        } catch (error) {
            toast.error(getValidationMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/reset-password", resetData);
            toast.success(res.data?.message || "Password reset successful.");
            setMode("login");
        } catch (error) {
            toast.error(getValidationMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page min-vh-100 d-flex align-items-center justify-content-center">
            <div className="auth-card card">
                <div className="auth-top-visual" aria-hidden="true">
                    <div className="auth-top-icon">
                        <i className={`bi ${mode === "login"
                            ? "bi-wallet2"
                            : mode === "register"
                                ? "bi-person-plus-fill"
                                : mode === "forgot"
                                    ? "bi-envelope-paper-heart-fill"
                                    : "bi-shield-lock-fill"}`} />
                    </div>
                </div>

                <div className="auth-card-body card-body">
                    <h2 className="auth-title text-center mb-1">
                        {mode === "login" && <>Wallet System <span>Login</span></>}
                        {mode === "register" && <>Create <span>Account</span></>}
                        {mode === "forgot" && <>Forgot <span>Password</span></>}
                        {mode === "reset" && <>Reset <span>Password</span></>}
                    </h2>

                    {(mode === "login" || mode === "register" || mode === "forgot" || mode === "reset") && (
                        <p className="auth-subtitle text-center mb-3">
                            {mode === "login" && "Welcome Back! Please sign in to continue"}
                            {mode === "register" && "Join us today! Fill in the details below"}
                            {mode === "forgot" && "Enter your email to generate reset token"}
                            {mode === "reset" && "Set a strong password for your account"}
                        </p>
                    )}

                    {(mode === "login" || mode === "register") && (
                        <form onSubmit={handleAuthSubmit}>
                            {mode === "register" && (
                                <div className="auth-input-wrap mb-2">
                                    <i className="bi bi-person-fill" />
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                            )}

                            <div className="auth-input-wrap mb-2">
                                <i className="bi bi-envelope-fill" />
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address"
                                    required
                                />
                            </div>

                            <div className="auth-input-wrap mb-2 auth-select-wrap">
                                <i className="bi bi-person-badge-fill" />
                                <select
                                    className="form-select"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="retailer">Retailer</option>
                                    <option value="distributor">Distributor</option>
                                    <option value="super_distributor">Super Distributor</option>
                                    <option value="master_distributor">Master Distributor</option>
                                </select>
                            </div>

                            <div className="auth-input-wrap mb-2 auth-password-wrap">
                                <i className="bi bi-lock-fill" />
                                <input
                                    type={mode === "login" ? (showLoginPassword ? "text" : "password") : (showRegisterPassword ? "text" : "password")}
                                    className="form-control"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => mode === "login" ? setShowLoginPassword((prev) => !prev) : setShowRegisterPassword((prev) => !prev)}
                                >
                                    <i className={`bi ${mode === "login" ? (showLoginPassword ? "bi-eye" : "bi-eye-slash") : (showRegisterPassword ? "bi-eye" : "bi-eye-slash")}`} />
                                </button>
                            </div>

                            {mode === "register" && (
                                <>
                                    <div className="auth-input-wrap mb-2 auth-password-wrap">
                                        <i className="bi bi-lock-fill" />
                                        <input
                                            type={showRegisterConfirmPassword ? "text" : "password"}
                                            className="form-control"
                                            name="password_confirmation"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            placeholder="Confirm Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-eye-btn"
                                            onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                                        >
                                            <i className={`bi ${showRegisterConfirmPassword ? "bi-eye" : "bi-eye-slash"}`} />
                                        </button>
                                    </div>

                                    <div className="auth-input-wrap mb-2">
                                        <i className="bi bi-telephone-fill" />
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Phone Number (Optional)"
                                        />
                                    </div>

                                    <div className="auth-input-wrap mb-2">
                                        <i className="bi bi-calendar-date-fill" />
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <label className="auth-terms-check mb-2">
                                        <input
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        />
                                        <span>I agree to the Terms & Conditions and Privacy Policy</span>
                                    </label>
                                </>
                            )}

                            {mode === "login" && (
                                <div className="d-flex justify-content-end mb-2">
                                    <button type="button" className="auth-text-btn" onClick={() => setMode("forgot")}>
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-primary-btn btn btn-primary w-100 mb-2"
                                disabled={loading}
                            >
                                {loading ? "Please wait..." : (mode === "login" ? "Login" : "Register")}
                            </button>
                        </form>
                    )}

                    {mode === "forgot" && (
                        <form onSubmit={handleForgotSubmit}>
                            <div className="auth-input-wrap mb-2">
                                <i className="bi bi-envelope-fill" />
                                <input
                                    type="email"
                                    className="form-control"
                                    value={forgotData.email}
                                    onChange={(e) => setForgotData({ email: e.target.value })}
                                    placeholder="Email Address"
                                    required
                                />
                            </div>
                            <p className="auth-inline-note">We will generate a reset token for this email.</p>
                            <button type="submit" className="auth-primary-btn btn btn-primary w-100 mb-2" disabled={loading}>
                                {loading ? "Please wait..." : "Generate Reset Token"}
                            </button>
                        </form>
                    )}

                    {mode === "reset" && (
                        <form onSubmit={handleResetSubmit}>
                            <div className="auth-input-wrap mb-2">
                                <i className="bi bi-envelope-fill" />
                                <input
                                    type="email"
                                    className="form-control"
                                    value={resetData.email}
                                    onChange={(e) => setResetData((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="Email Address"
                                    required
                                />
                            </div>
                            <div className="auth-input-wrap mb-2">
                                <i className="bi bi-key-fill" />
                                <input
                                    className="form-control"
                                    value={resetData.token}
                                    onChange={(e) => setResetData((p) => ({ ...p, token: e.target.value }))}
                                    placeholder="Reset Token"
                                    required
                                />
                            </div>
                            {resetTokenHint && <small className="auth-inline-note d-block mb-2">Generated token: {resetTokenHint}</small>}
                            <div className="auth-input-wrap mb-2 auth-password-wrap">
                                <i className="bi bi-lock-fill" />
                                <input
                                    type={showResetPassword ? "text" : "password"}
                                    className="form-control"
                                    value={resetData.password}
                                    onChange={(e) => setResetData((p) => ({ ...p, password: e.target.value }))}
                                    placeholder="New Password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => setShowResetPassword((prev) => !prev)}
                                >
                                    <i className={`bi ${showResetPassword ? "bi-eye" : "bi-eye-slash"}`} />
                                </button>
                            </div>
                            <div className="auth-input-wrap mb-2 auth-password-wrap">
                                <i className="bi bi-lock-fill" />
                                <input
                                    type={showResetConfirmPassword ? "text" : "password"}
                                    className="form-control"
                                    value={resetData.password_confirmation}
                                    onChange={(e) => setResetData((p) => ({ ...p, password_confirmation: e.target.value }))}
                                    placeholder="Confirm Password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                                >
                                    <i className={`bi ${showResetConfirmPassword ? "bi-eye" : "bi-eye-slash"}`} />
                                </button>
                            </div>
                            <button type="submit" className="auth-primary-btn btn btn-primary w-100 mb-2" disabled={loading}>
                                {loading ? "Please wait..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {(mode === "login" || mode === "register") && (
                        <>
                            <div className="auth-divider"><span>OR SIGN WITH</span></div>
                            <div className="auth-social-row">
                                <button type="button" className="auth-social-btn"><i className="bi bi-google" /> Google</button>
                                <button type="button" className="auth-social-btn"><i className="bi bi-facebook" /> Facebook</button>
                                <button type="button" className="auth-social-btn"><i className="bi bi-twitter-x" /> Twitter</button>
                            </div>
                        </>
                    )}

                    {mode === "login" && (
                        <p className="auth-bottom-switch">
                            Don&apos;t have an account? <button type="button" className="auth-link-btn" onClick={() => setMode("register")}>Create Account</button>
                        </p>
                    )}

                    {mode === "register" && (
                        <p className="auth-bottom-switch">
                            Already have an account? <button type="button" className="auth-link-btn" onClick={() => setMode("login")}>Login</button>
                        </p>
                    )}

                    {(mode === "forgot" || mode === "reset") && (
                        <div className="text-center mt-2">
                            <button className="auth-link-btn" type="button" onClick={() => setMode("login")}>Back to Login</button>
                        </div>
                    )}

                    {mode === "login" && (
                        <div className="auth-quick-box mt-2 border-top pt-2">
                            <small className="text-muted d-block mb-2">Quick test logins</small>
                            <div className="d-grid gap-2">
                                <button
                                    type="button"
                                    className="auth-quick-btn btn btn-sm btn-outline-primary"
                                    onClick={() => setFormData((prev) => ({ ...prev, role: "master_distributor", email: "master@example.com", password: "password" }))}
                                >
                                    Use Master Distributor Account
                                </button>
                                <button
                                    type="button"
                                    className="auth-quick-btn btn btn-sm btn-outline-primary"
                                    onClick={() => setFormData((prev) => ({ ...prev, role: "super_distributor", email: "super@example.com", password: "password" }))}
                                >
                                    Use Super Distributor Account
                                </button>
                                <button
                                    type="button"
                                    className="auth-quick-btn btn btn-sm btn-outline-primary"
                                    onClick={() => setFormData((prev) => ({ ...prev, role: "distributor", email: "distributor@example.com", password: "password" }))}
                                >
                                    Use Distributor Account
                                </button>
                                <button
                                    type="button"
                                    className="auth-quick-btn btn btn-sm btn-outline-primary"
                                    onClick={() => setFormData((prev) => ({ ...prev, role: "retailer", email: "retailer@example.com", password: "password" }))}
                                >
                                    Use Retailer Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
