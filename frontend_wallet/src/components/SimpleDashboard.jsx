import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

const SimpleDashboard = () => {
    const [user, setUser] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        console.log("SimpleDashboard - Token exists:", !!token);
        console.log("SimpleDashboard - User data exists:", !!userData);
        
        if (!token || !userData) {
            console.log("SimpleDashboard - Redirecting to login");
            navigate("/login");
            return;
        }

        const parsedUser = JSON.parse(userData);
        console.log("SimpleDashboard - User:", parsedUser);
        setUser(parsedUser);

        // Fetch initial data
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            console.log("SimpleDashboard - Fetching data...");
            const [walletsResponse] = await Promise.all([
                api.get("/wallets")
            ]);
            
            console.log("SimpleDashboard - Wallets:", walletsResponse.data);
            setWallets(walletsResponse.data);
            setLoading(false);
        } catch (error) {
            console.error("SimpleDashboard - Failed to fetch data:", error);
            toast.error("Failed to fetch data");
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light">
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
                <div className="container">
                    <a className="navbar-brand" href="#">
                        <i className="bi bi-wallet2 me-2"></i>
                        Wallet System
                    </a>
                    <div className="navbar-nav ms-auto">
                        <span className="navbar-text me-3">
                            Welcome, {user?.name}
                        </span>
                        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mt-4">
                <div className="row">
                    <div className="col-12">
                        <h2 className="mb-4">
                            <i className="bi bi-speedometer2 me-2"></i>
                            Dashboard
                        </h2>
                    </div>
                </div>

                {/* User Info */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="bi bi-person me-2"></i>
                                    User Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <p><strong>Name:</strong> {user?.name}</p>
                                <p><strong>Email:</strong> {user?.email}</p>
                                <p><strong>Role:</strong> <span className="badge bg-primary">{user?.role}</span></p>
                                <p><strong>Status:</strong> <span className="badge bg-success">Active</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallets */}
                <div className="row">
                    <div className="col-12">
                        <h4 className="mb-3">
                            <i className="bi bi-wallet2 me-2"></i>
                            Your Wallets
                        </h4>
                    </div>
                </div>

                <div className="row">
                    {wallets.map(wallet => (
                        <div className="col-md-4 mb-3" key={wallet.id}>
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="card-title">
                                        {wallet.name}
                                        {wallet.type === 'main' && (
                                            <span className="badge bg-primary ms-2">Main</span>
                                        )}
                                        {wallet.type === 'sub' && (
                                            <span className="badge bg-info ms-2">Sub</span>
                                        )}
                                    </h6>
                                    <p className="card-text">
                                        <strong>Balance:</strong> ₹{parseFloat(wallet.balance || 0).toFixed(2)}
                                    </p>
                                    {wallet.is_frozen && (
                                        <div className="alert alert-warning py-2">
                                            <small>
                                                <i className="bi bi-snow me-1"></i>
                                                Frozen: {wallet.freeze_reason || 'No reason'}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {wallets.length === 0 && (
                    <div className="row">
                        <div className="col-12">
                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                No wallets found. Your wallets will appear here once they are created.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleDashboard;
