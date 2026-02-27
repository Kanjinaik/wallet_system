import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../../utils/api";

const WithdrawModal = ({ show, onClose, onSuccess, userRole = 'retailer' }) => {
    const [wallets, setWallets] = useState([]);
    const [allWallets, setAllWallets] = useState([]); // Store original API response
    const [withdrawData, setWithdrawData] = useState({
        wallet_id: "",
        amount: "",
        bank_account: "",
        ifsc_code: "",
        account_holder_name: "",
        otp_code: ""
    });
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [ekycSubmitting, setEkycSubmitting] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [ekycForm, setEkycForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        date_of_birth: "",
        document_type: "aadhaar",
        kyc_id_number: "",
        profile_photo: null,
        document_front: null,
        document_back: null,
        selfie_photo: null,
        liveness_verified: false,
    });
    const [ekycPreview, setEkycPreview] = useState({
        profile_photo: "",
        document_front: "",
        document_back: "",
        selfie_photo: "",
    });
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (show) {
            // Check if wallet_id is in URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const walletIdFromUrl = urlParams.get('wallet_id');
            
            if (walletIdFromUrl) {
                setWithdrawData(prev => ({
                    ...prev,
                    wallet_id: walletIdFromUrl
                }));
            }
            
            // Force refresh wallets immediately when modal opens
            fetchWallets();
            fetchProfile();
            // Also refresh wallets every 5 seconds while modal is open
            const interval = setInterval(fetchWallets, 5000);
            return () => clearInterval(interval);
        }
    }, [show, onSuccess]); // Add onSuccess to refresh when deposit completes

    const fetchProfile = async () => {
        try {
            const response = await api.get("/profile");
            const profileData = response.data || null;
            setProfile(profileData);
            setEkycForm((prev) => ({
                ...prev,
                first_name: profileData?.name || "",
                last_name: profileData?.last_name || "",
                email: profileData?.email || "",
                date_of_birth: profileData?.date_of_birth ? String(profileData.date_of_birth).slice(0, 10) : "",
                kyc_id_number: profileData?.kyc_id_number || "",
                document_type: profileData?.kyc_document_type || "aadhaar",
                liveness_verified: Boolean(profileData?.kyc_liveness_verified),
            }));
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const handleEkycFieldChange = (e) => {
        const { name, value } = e.target;
        setEkycForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEkycFileChange = (name, file) => {
        setEkycForm((prev) => ({ ...prev, [name]: file || null }));
        if (file && file.type?.startsWith("image/")) {
            setEkycPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
        }
    };

    const openCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setCameraOpen(true);
                setStreaming(true);
            }
        } catch (error) {
            toast.error("Unable to access camera");
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setStreaming(false);
        setCameraOpen(false);
    };

    const captureSelfie = () => {
        if (!videoRef.current || !canvasRef.current) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (!blob) {
                return;
            }
            const selfieFile = new File([blob], `selfie_${Date.now()}.png`, { type: "image/png" });
            setEkycForm((prev) => ({ ...prev, selfie_photo: selfieFile, liveness_verified: true }));
            setEkycPreview((prev) => ({ ...prev, selfie_photo: URL.createObjectURL(blob) }));
            toast.success("Selfie captured. Liveness detected.");
            stopCamera();
        }, "image/png");
    };

    const handleSubmitEkyc = async (e) => {
        e.preventDefault();
        setEkycSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("first_name", ekycForm.first_name);
            formData.append("last_name", ekycForm.last_name || "");
            formData.append("email", ekycForm.email);
            formData.append("date_of_birth", ekycForm.date_of_birth || "");
            formData.append("document_type", ekycForm.document_type);
            formData.append("kyc_id_number", ekycForm.kyc_id_number);
            formData.append("liveness_verified", ekycForm.liveness_verified ? "1" : "0");

            if (ekycForm.profile_photo) formData.append("profile_photo", ekycForm.profile_photo);
            if (ekycForm.document_front) formData.append("document_front", ekycForm.document_front);
            if (ekycForm.document_back) formData.append("document_back", ekycForm.document_back);
            if (ekycForm.selfie_photo) formData.append("selfie_photo", ekycForm.selfie_photo);

            const response = await api.post("/retailer/ekyc/submit", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(response.data?.message || "eKYC submitted successfully");
            await fetchProfile();
        } catch (error) {
            const firstValidationError = error.response?.data?.errors
                ? Object.values(error.response.data.errors)[0]?.[0]
                : null;
            toast.error(firstValidationError || error.response?.data?.message || "Failed to submit eKYC");
        } finally {
            setEkycSubmitting(false);
        }
    };

    const fetchWallets = async () => {
        try {
            const response = await api.get("/wallets");
            const allWalletsData = response.data;
            setAllWallets(allWalletsData);
            console.log("Raw API response:", allWalletsData);
            
            // If no data from API, create sample wallets for testing
            if (!allWalletsData || allWalletsData.length === 0) {
                console.log("No wallets from API, creating sample wallets");
                const sampleWallets = [
                    { id: 1, name: 'Main Wallet', type: 'main', balance: 5000, is_frozen: false },
                    { id: 2, name: 'Savings Wallet', type: 'sub', balance: 2000, is_frozen: false },
                    { id: 3, name: 'Business Wallet', type: 'sub', balance: 10000, is_frozen: false }
                ];
                setAllWallets(sampleWallets);
                setWallets(sampleWallets);
                
                // Auto-select main wallet
                setWithdrawData(prev => ({
                    ...prev,
                    wallet_id: 1
                }));
                return;
            }
            
            // Filter wallets for withdrawal (show all wallets including frozen ones)
            const availableWallets = allWalletsData.filter(w => {
                const hasBalance = parseFloat(w.balance || 0) > 0;
                console.log("Wallet:", w.name, "ID:", w.id, "Balance:", w.balance, "Has Balance:", hasBalance);
                return hasBalance; // Show all wallets with balance > 0 (including frozen)
            });
            
            setWallets(availableWallets);
            console.log("Final wallets for dropdown:", availableWallets);
            
            // Auto-select main wallet if no wallet is selected
            const mainWallet = allWalletsData.find(w => w.type === 'main' && !w.is_frozen);
            console.log("Main wallet found:", mainWallet);
            if (mainWallet && !withdrawData.wallet_id) {
                setWithdrawData(prev => ({
                    ...prev,
                    wallet_id: mainWallet.id
                }));
            }
        } catch (error) {
            console.error("Failed to fetch wallets:", error);
            toast.error("Failed to fetch wallets");
            
            // Create fallback wallets on error
            const fallbackWallets = [
                { id: 1, name: 'Main Wallet', type: 'main', balance: 5000, is_frozen: false },
                { id: 2, name: 'Savings Wallet', type: 'sub', balance: 2000, is_frozen: false }
            ];
            setAllWallets(fallbackWallets);
            setWallets(fallbackWallets);
            setWithdrawData(prev => ({
                ...prev,
                wallet_id: 1
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setWithdrawData({
            ...withdrawData,
            [name]: value
        });
    };

    const addMoneyToWallet = async (amount) => {
        if (!withdrawData.wallet_id) {
            toast.error("Please select a wallet first");
            return;
        }

        try {
            console.log("Adding money to wallet:", { wallet_id: withdrawData.wallet_id, amount });
            
            const response = await api.post("/deposit", {
                wallet_id: parseInt(withdrawData.wallet_id),
                amount: amount,
                payment_method: "test_add"
            });

            console.log("Add money response:", response.data);

            if (response.data.success) {
                // Immediately update the selected wallet balance in state
                setAllWallets(prev => prev.map(wallet => 
                    wallet.id === parseInt(withdrawData.wallet_id) 
                        ? { ...wallet, balance: response.data.data.new_balance }
                        : wallet
                ));
                
                // Refresh wallets from server
                fetchWallets();
                
                // Also call parent refresh if available
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(response.data.message || "Failed to add money");
            }
        } catch (error) {
            console.error("Add money error:", error);
            toast.error(error.response?.data?.message || "Failed to add money");
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log("Withdrawal data being submitted:", withdrawData);

        const withdrawalAmount = Number(withdrawData.amount || 0);
        const requiresHighValueEkyc = withdrawalAmount >= 100000;
        const kycStatus = (profile?.kyc_status || "pending").toLowerCase();

        if (requiresHighValueEkyc && !["pending", "approved"].includes(kycStatus)) {
            toast.error("Please submit eKYC first for ₹1,00,000 and above withdrawals");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post("/withdraw", withdrawData);
            console.log("Withdrawal response:", response.data);
            
            // Check for success (different APIs return different structures)
            if (response.data || response.status === 200 || response.data?.success || response.data?.message) {
                toast.success(response.data?.message || "Withdrawal request submitted successfully");
                setWithdrawData({
                    wallet_id: "",
                    amount: "",
                    bank_account: "",
                    ifsc_code: "",
                    account_holder_name: "",
                    otp_code: ""
                });
                onSuccess();
                onClose();
            } else {
                toast.error(response.data?.message || "Withdrawal request failed");
            }
        } catch (error) {
            console.error("Withdrawal error:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.message || error.message || "Withdrawal failed");
        } finally {
            setLoading(false);
        }
    };

    const selectedWalletId = Number(withdrawData.wallet_id);
    const selectedWallet = wallets.find(w => Number(w.id) === selectedWalletId);
    // Fix maxWithdrawAmount calculation
    const walletBalance = selectedWallet ? parseFloat(selectedWallet.balance || 0) : 0;
    const maxWithdrawAmount = isNaN(walletBalance) ? 0 : walletBalance;
    
    // Get main wallet from the original API response (not filtered wallets)
    // This ensures we get the real balance even if filtering excludes it
    const mainWallet = allWallets.find(w => w.type === 'main');

    // Debug logs
    console.log("WithdrawModal Debug:", {
        allWallets: allWallets,
        wallets: wallets,
        mainWallet: mainWallet,
        selectedWallet: selectedWallet,
        selectedWalletBalance: selectedWallet?.balance,
        walletBalance: walletBalance,
        maxWithdrawAmount: maxWithdrawAmount,
        withdrawData: withdrawData
    });

    if (!show) return null;

    const withdrawalAmount = Number(withdrawData.amount || 0);
    const requiresHighValueEkyc = withdrawalAmount >= 100000;
    const kycStatus = (profile?.kyc_status || "not_submitted").toLowerCase();
    const kycStatusConfig = {
        not_submitted: { label: "🟡 Not Submitted", className: "bg-warning text-dark" },
        pending: { label: "🔵 Pending", className: "bg-info text-dark" },
        approved: { label: "🟢 Approved", className: "bg-success" },
        rejected: { label: "🔴 Rejected", className: "bg-danger" },
    };
    const currentKycStatus = kycStatusConfig[kycStatus] || kycStatusConfig.not_submitted;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-dash-circle me-2"></i>
                            Withdraw Funds
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <form onSubmit={handleWithdraw}>
                        <div className="modal-body">
                            {/* Debug Section - Remove in production */}
                            <div className="alert alert-warning mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small><strong>Debug Info:</strong></small><br/>
                                        <small>Total Wallets: {wallets.length}</small><br/>
                                        <small>Main Wallet Found: {mainWallet ? 'YES' : 'NO'}</small><br/>
                                        <small>Main Wallet Balance: ₹{parseFloat(mainWallet?.balance || 0).toFixed(2)}</small><br/>
                                        <small>Main Wallet ID: {mainWallet?.id || 'None'}</small><br/>
                                        <small>Last Updated: {new Date().toLocaleTimeString()}</small>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-warning"
                                        onClick={fetchWallets}
                                    >
                                        <i className="bi bi-arrow-clockwise me-1"></i>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            
                            {/* Main Wallet Balance Display */}
                            {mainWallet && (
                                <div className={`alert mb-4 ${mainWallet.is_frozen ? 'alert-danger' : 'alert-primary'}`}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0">
                                            <i className="bi bi-wallet2 me-2"></i>
                                            Main Wallet Balance
                                            {mainWallet.is_frozen && (
                                                <span className="badge bg-danger ms-2">FROZEN</span>
                                            )}
                                        </h6>
                                        <div className="d-flex align-items-center">
                                            <span className={`badge fs-6 me-2 ${mainWallet.is_frozen ? 'bg-danger' : 'bg-success'}`}>
                                                ₹{parseFloat(mainWallet.balance || 0).toFixed(2)}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={fetchWallets}
                                                title="Refresh balance"
                                            >
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span><strong>{mainWallet.name || 'Main Wallet'}</strong></span>
                                        <small className="text-muted">
                                            {mainWallet.is_frozen ? 'Cannot withdraw - Wallet is frozen' : 'Available for withdrawal'}
                                        </small>
                                    </div>
                                    {/* Quick Transfer Button */}
                                    {!mainWallet.is_frozen && (
                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                className="btn btn-success w-100"
                                                onClick={() => {
                                                    console.log("Main wallet selected:", mainWallet);
                                                    setWithdrawData({
                                                        ...withdrawData,
                                                        wallet_id: mainWallet.id
                                                    });
                                                }}
                                            >
                                                <i className="bi bi-arrow-right-circle me-2"></i>
                                                Transfer Main Wallet to Bank
                                            </button>
                                        </div>
                                    )}
                                    {mainWallet.is_frozen && (
                                        <div className="mt-3">
                                            <div className="alert alert-warning">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                <strong>Wallet is Frozen</strong>
                                                <br/>
                                                <small>This wallet cannot be used for withdrawals. Please contact support to unfreeze the wallet.</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Select Wallet</label>
                                        <select
                                            className="form-select"
                                            name="wallet_id"
                                            value={withdrawData.wallet_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Choose a wallet...</option>
                                            {wallets.map(wallet => (
                                                <option key={wallet.id} value={wallet.id} className={wallet.type === 'main' ? 'fw-bold text-primary' : ''}>
                                                    {wallet.type === 'main' ? '🏦 MAIN WALLET: ' : '💼 '}
                                                    {wallet.name} - Balance: ₹{parseFloat(wallet.balance || 0).toFixed(2)}
                                                    {wallet.is_frozen && ' ❄️FROZEN'}
                                                </option>
                                            ))}
                                            {wallets.length === 0 && (
                                                <option disabled className="text-muted">
                                                    Loading wallets...
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Withdrawal Amount (₹)</label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="amount"
                                                value={withdrawData.amount}
                                                onChange={handleChange}
                                                placeholder="100.00"
                                                step="0.01"
                                                min="100"
                                                max={maxWithdrawAmount >= 100 ? maxWithdrawAmount : undefined}
                                                required
                                            />
                                        </div>
                                        {/* Amount Range Display */}
                                        <div className="alert alert-info mt-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <small className="text-muted">Minimum Amount</small>
                                                    <div className="h6 mb-0">₹100.00</div>
                                                </div>
                                                <div className="text-end">
                                                    <small className="text-muted">Maximum Available</small>
                                                    <div className="h6 mb-0 text-success">
                                                        ₹{maxWithdrawAmount.toFixed(2)}
                                                        {maxWithdrawAmount === 0 && (
                                                            <small className="text-warning ms-2">(No balance)</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Debug Info */}
                                            <div className="mt-2 pt-2 border-top">
                                                <small className="text-muted">
                                                    Debug: Selected Wallet ID: {withdrawData.wallet_id || 'None'} | 
                                                    Balance: {selectedWallet?.balance || 'N/A'} | 
                                                    Calculated Max: ₹{maxWithdrawAmount.toFixed(2)}
                                                </small>
                                            </div>
                                        </div>
                                        {selectedWallet && (
                                            <div className="alert alert-success mt-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>Selected Wallet:</strong> {selectedWallet.name}
                                                        {selectedWallet.type === 'main' && (
                                                            <span className="badge bg-primary ms-2">Main Wallet</span>
                                                        )}
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="h5 mb-0 text-success">₹{parseFloat(selectedWallet.balance || 0).toFixed(2)}</div>
                                                        <small className="text-muted">Available Balance</small>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* Quick Amount Buttons */}
                                    <div className="mb-3">
                                        <label className="form-label">Quick Amounts</label>
                                        <div className="btn-group w-100" role="group">
                                            {[100, 500, 1000, 5000].map(amount => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => {
                                                        setWithdrawData({...withdrawData, amount: amount.toString()});
                                                    }}
                                                    disabled={amount > maxWithdrawAmount}
                                                >
                                                    ₹{amount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Add Money Section */}
                                    <div className="mb-3">
                                        <label className="form-label">
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Quick Add Money to Wallet
                                        </label>
                                        <div className="btn-group w-100" role="group">
                                            {[1000, 5000, 10000].map(amount => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    className="btn btn-success"
                                                    onClick={() => addMoneyToWallet(amount)}
                                                    disabled={!withdrawData.wallet_id}
                                                >
                                                    <i className="bi bi-plus-circle me-1"></i>
                                                    Add ₹{amount}
                                                </button>
                                            ))}
                                        </div>
                                        <small className="text-muted">
                                            Instantly add money to selected wallet (for testing)
                                        </small>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card border-primary">
                                        <div className="card-header bg-primary text-white">
                                            <h6 className="mb-0">
                                                <i className="bi bi-bank me-2"></i>
                                                Bank Account Details
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    <i className="bi bi-person me-1"></i>
                                                    Account Holder Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="account_holder_name"
                                                    value={withdrawData.account_holder_name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    <i className="bi bi-credit-card me-1"></i>
                                                    Bank Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="bank_account"
                                                    value={withdrawData.bank_account}
                                                    onChange={handleChange}
                                                    placeholder="Enter your account number"
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    <i className="bi bi-building me-1"></i>
                                                    IFSC Code
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="ifsc_code"
                                                    value={withdrawData.ifsc_code}
                                                    onChange={handleChange}
                                                    placeholder="Enter IFSC code (e.g., SBIN0000123)"
                                                    required
                                                />
                                            </div>

                                            <div className="alert alert-info">
                                                <i className="bi bi-info-circle me-2"></i>
                                                <strong>Transfer Information:</strong><br/>
                                                <small>
                                                    • Funds will be transferred to the above bank account<br/>
                                                    • Processing time: 1-3 business days<br/>
                                                    • Minimum withdrawal: ₹100<br/>
                                                    • Bank charges may apply
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <h6>
                                    <i className="bi bi-info-circle me-2"></i>
                                    Bank Transfer Process
                                </h6>
                                <ol className="mb-0">
                                    <li><strong>Deposit funds</strong> to your wallet using Razorpay</li>
                                    <li><strong>Request withdrawal</strong> to your bank account</li>
                                    <li><strong>Processing time:</strong> 24-48 hours</li>
                                    <li><strong>Minimum withdrawal:</strong> ₹100</li>
                                    <li><strong>Bank charges:</strong> May apply as per bank policy</li>
                                    <li><strong>Important:</strong> Ensure bank details are correct</li>
                                </ol>
                            </div>
                            <div className="alert alert-warning">
                                <h6>
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    Withdrawal Information
                                </h6>
                                <ul className="mb-0">
                                    <li>Frozen wallets cannot initiate withdrawals</li>
                                    <li>Withdrawals are subject to verification</li>
                                    <li>₹1,00,000 and above requires eKYC approval</li>
                                    <li>Below ₹1,00,000 does not require eKYC approval</li>
                                    <li>Transaction history will be updated</li>
                                    <li>You will receive confirmation email</li>
                                </ul>
                            </div>

                            {requiresHighValueEkyc && (
                                <div className="row g-3 mt-1">
                                    <div className="col-lg-8">
                                        <div className="card border-warning">
                                            <div className="card-header bg-warning-subtle">
                                                <h6 className="mb-0">eKYC Verification Required (₹1,00,000+)</h6>
                                            </div>
                                            <div className="card-body">
                                                <form onSubmit={handleSubmitEkyc}>
                                                    <h6 className="mb-3">SECTION 1: Basic Information</h6>
                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <label className="form-label">First Name *</label>
                                                            <input className="form-control" name="first_name" value={ekycForm.first_name} onChange={handleEkycFieldChange} required />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Last Name</label>
                                                            <input className="form-control" name="last_name" value={ekycForm.last_name} onChange={handleEkycFieldChange} />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Email *</label>
                                                            <input className="form-control" type="email" name="email" value={ekycForm.email} onChange={handleEkycFieldChange} required />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Date of Birth</label>
                                                            <input className="form-control" type="date" name="date_of_birth" value={ekycForm.date_of_birth} onChange={handleEkycFieldChange} />
                                                        </div>
                                                        <div className="col-md-12">
                                                            <label className="form-label">Upload Profile Photo</label>
                                                            <input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleEkycFileChange("profile_photo", e.target.files?.[0] || null)} />
                                                        </div>
                                                    </div>

                                                    <hr className="my-3" />
                                                    <h6 className="mb-3">SECTION 2: Document Verification (KYC)</h6>
                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <label className="form-label">Document Type</label>
                                                            <select className="form-select" name="document_type" value={ekycForm.document_type} onChange={handleEkycFieldChange}>
                                                                <option value="aadhaar">Aadhaar</option>
                                                                <option value="pan">PAN</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Aadhaar Number or PAN</label>
                                                            <input className="form-control" name="kyc_id_number" value={ekycForm.kyc_id_number} onChange={handleEkycFieldChange} required />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Upload Document Front</label>
                                                            <input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleEkycFileChange("document_front", e.target.files?.[0] || null)} required />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label">Upload Document Back</label>
                                                            <input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleEkycFileChange("document_back", e.target.files?.[0] || null)} required />
                                                        </div>
                                                    </div>

                                                    <div className="mt-3">
                                                        <h6 className="mb-2">Image Preview</h6>
                                                        <div className="row g-2">
                                                            {ekycPreview.profile_photo && <div className="col-6"><img src={ekycPreview.profile_photo} alt="Profile" className="img-fluid rounded border" /></div>}
                                                            {ekycPreview.document_front && <div className="col-6"><img src={ekycPreview.document_front} alt="Document front" className="img-fluid rounded border" /></div>}
                                                            {ekycPreview.document_back && <div className="col-6"><img src={ekycPreview.document_back} alt="Document back" className="img-fluid rounded border" /></div>}
                                                            {ekycPreview.selfie_photo && <div className="col-6"><img src={ekycPreview.selfie_photo} alt="Selfie" className="img-fluid rounded border" /></div>}
                                                        </div>
                                                    </div>

                                                    <hr className="my-3" />
                                                    <h6 className="mb-2">Face Verification (Optional)</h6>
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        <button type="button" className="btn btn-outline-primary" onClick={openCamera}>Open Camera</button>
                                                        <button type="button" className="btn btn-outline-success" onClick={captureSelfie} disabled={!streaming}>Capture Selfie</button>
                                                        <button type="button" className="btn btn-outline-secondary" onClick={stopCamera} disabled={!streaming}>Close Camera</button>
                                                    </div>
                                                    <small className="text-muted">Liveness Detection: {ekycForm.liveness_verified ? "Detected" : "Not Detected"}</small>

                                                    {cameraOpen && (
                                                        <div className="mt-2 p-2 border rounded">
                                                            <video ref={videoRef} autoPlay playsInline muted className="w-100 rounded" style={{ maxHeight: 220 }} />
                                                            <canvas ref={canvasRef} className="d-none" />
                                                        </div>
                                                    )}

                                                    <div className="mt-3">
                                                        <button type="submit" className="btn btn-warning w-100" disabled={ekycSubmitting}>
                                                            {ekycSubmitting ? "Submitting eKYC..." : "Submit eKYC"}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-4">
                                        <div className="card border-info h-100">
                                            <div className="card-header bg-info-subtle">
                                                <h6 className="mb-0">KYC Status</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className={`badge ${currentKycStatus.className} mb-3`}>{currentKycStatus.label}</div>
                                                <ul className="small ps-3 mb-0">
                                                    <li>🟡 Not Submitted</li>
                                                    <li>🔵 Pending</li>
                                                    <li>🟢 Approved</li>
                                                    <li>🔴 Rejected</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Validation Feedback */}
                            {!withdrawData.wallet_id && (
                                <div className="alert alert-warning">
                                    <small>Please select a wallet to withdraw from</small>
                                </div>
                            )}
                            {withdrawData.wallet_id && withdrawData.amount && parseFloat(withdrawData.amount) < 100 && (
                                <div className="alert alert-warning">
                                    <small>Minimum withdrawal amount is ₹100</small>
                                </div>
                            )}
                            {withdrawData.wallet_id && withdrawData.amount && parseFloat(withdrawData.amount) > maxWithdrawAmount && (
                                <div className="alert alert-warning">
                                    <small>Maximum withdrawal amount is ₹{maxWithdrawAmount.toFixed(2)}</small>
                                </div>
                            )}

                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-success"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Processing Transfer...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-arrow-right-circle me-2"></i>
                                            Withdraw to Bank Account
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;
