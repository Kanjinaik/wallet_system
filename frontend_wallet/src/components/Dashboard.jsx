import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/api";
import { toast } from "react-toastify";
import WalletOverview from "./Wallet/WalletOverview";
import TransactionHistory from "./Transaction/TransactionHistory";
import TransferFunds from "./Transfer/TransferFunds";
import DepositModal from "./Deposit/DepositModal";
import WithdrawModal from "./Withdraw/WithdrawModal";
import SubWallets from "./Wallet/SubWallets";
import Analytics from "./Analytics/Analytics";
import ScheduledTransfers from "./Scheduled/ScheduledTransfers";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        console.log("Dashboard - Token exists:", !!token);
        console.log("Dashboard - User data exists:", !!userData);
        
        if (!token || !userData) {
            console.log("Dashboard - Redirecting to login");
            navigate("/login");
            return;
        }

        const parsedUser = JSON.parse(userData);
        console.log("Dashboard - User:", parsedUser);
        setUser(parsedUser);

        // Fetch initial data
        fetchWallets();
        fetchTransactions();

        // Check URL parameters for deposit/withdraw
        const urlParams = new URLSearchParams(window.location.search);
        const shouldDeposit = urlParams.get('deposit');
        const shouldWithdraw = urlParams.get('withdraw');
        const walletId = urlParams.get('wallet_id');

        if (shouldDeposit === 'true') {
            console.log("Dashboard - Opening deposit modal");
            setShowDepositModal(true);
        }

        if (shouldWithdraw === 'true') {
            console.log("Dashboard - Opening withdraw modal with wallet_id:", walletId);
            setShowWithdrawModal(true);
        }

        // Fetch initial data
        fetchWallets();
        fetchTransactions();
    }, [navigate]);

    const fetchWallets = async () => {
        try {
            console.log("Dashboard - Fetching wallets...");
            const response = await api.get("/wallets");
            console.log("Dashboard - Wallets response:", response.data);
            setWallets(response.data);
        } catch (error) {
            console.error("Dashboard - Failed to fetch wallets:", error);
            toast.error("Failed to fetch wallets");
        }
    };

    const fetchTransactions = async () => {
        try {
            console.log("Dashboard - Fetching transactions...");
            const response = await api.get("/transactions");
            console.log("Dashboard - Transactions response:", response.data);
            setTransactions(response.data);
        } catch (error) {
            console.error("Dashboard - Failed to fetch transactions:", error);
            toast.error("Failed to fetch transactions");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const mainWallet = wallets.find(w => w.type === 'main');
    const subWallets = wallets.filter(w => w.type === 'sub');

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
                        {user?.role === 'admin' && (
                            <button 
                                className="btn btn-outline-light btn-sm me-2"
                                onClick={() => navigate("/admin")}
                            >
                                Admin Panel
                            </button>
                        )}
                        <button 
                            className="btn btn-outline-light btn-sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                {/* Quick Stats */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h5 className="card-title">Main Wallet Balance</h5>
                                <h3>₹{mainWallet?.balance || "0.00"}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h5 className="card-title">Sub Wallets</h5>
                                <h3>{subWallets.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card bg-warning text-white">
                            <div className="card-body">
                                <h5 className="card-title">Total Balance</h5>
                                <h3>₹{wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="btn-group w-100" role="group">
                            <button 
                                className="btn btn-success"
                                onClick={() => setShowDepositModal(true)}
                            >
                                <i className="bi bi-plus-circle me-2"></i>Deposit
                            </button>
                            <button 
                                className="btn btn-danger"
                                onClick={() => setShowWithdrawModal(true)}
                            >
                                <i className="bi bi-dash-circle me-2"></i>Withdraw
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setActiveTab("transfer")}
                            >
                                <i className="bi bi-arrow-left-right me-2"></i>Transfer
                            </button>
                            <button 
                                className="btn btn-info"
                                onClick={() => setActiveTab("analytics")}
                            >
                                <i className="bi bi-graph-up me-2"></i>Analytics
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setActiveTab("scheduled")}
                            >
                                <i className="bi bi-clock-history me-2"></i>Scheduled
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "wallets" ? "active" : ""}`}
                            onClick={() => setActiveTab("wallets")}
                        >
                            Wallets
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "transfer" ? "active" : ""}`}
                            onClick={() => setActiveTab("transfer")}
                        >
                            Transfer
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "transactions" ? "active" : ""}`}
                            onClick={() => setActiveTab("transactions")}
                        >
                            Transactions
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "analytics" ? "active" : ""}`}
                            onClick={() => setActiveTab("analytics")}
                        >
                            Analytics
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "scheduled" ? "active" : ""}`}
                            onClick={() => setActiveTab("scheduled")}
                        >
                            Scheduled Transfers
                        </button>
                    </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === "overview" && (
                        <WalletOverview wallets={wallets} />
                    )}
                    {activeTab === "wallets" && (
                        <SubWallets 
                            wallets={wallets} 
                            onWalletUpdate={fetchWallets}
                        />
                    )}
                    {activeTab === "transfer" && (
                        <TransferFunds 
                            wallets={wallets}
                            onTransferComplete={fetchTransactions}
                        />
                    )}
                    {activeTab === "transactions" && (
                        <TransactionHistory transactions={transactions} />
                    )}
                    {activeTab === "analytics" && (
                        <Analytics transactions={transactions} wallets={wallets} />
                    )}
                    {activeTab === "scheduled" && (
                        <ScheduledTransfers wallets={wallets} />
                    )}
                </div>
            </div>

            {/* Modals */}
            <DepositModal 
                show={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                onSuccess={() => {
                    fetchWallets();
                    fetchTransactions();
                    setShowDepositModal(false);
                }}
            />

            <WithdrawModal 
                show={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onSuccess={() => {
                    fetchWallets();
                    fetchTransactions();
                    setShowWithdrawModal(false);
                }}
            />
        </div>
    );
};

export default Dashboard;
