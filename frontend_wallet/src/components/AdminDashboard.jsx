import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [allWallets, setAllWallets] = useState([]);
    const [activeTab, setActiveTab] = useState("users");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Create authenticated axios instance
    const api = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    // Add request interceptor to include token
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role !== "admin") {
            navigate("/dashboard");
            return;
        }

        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            const [usersRes, transactionsRes, walletsRes] = await Promise.all([
                api.get("/admin/users"),
                api.get("/admin/transactions"),
                api.get("/admin/wallets")
            ]);

            setUsers(usersRes.data);
            setAllTransactions(transactionsRes.data);
            setAllWallets(walletsRes.data);
        } catch (error) {
            toast.error("Failed to fetch admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleFreezeWallet = async (walletId, isFrozen) => {
        try {
            await api.post(`/admin/wallets/${walletId}/freeze`, {
                is_frozen: !isFrozen,
                reason: !isFrozen ? "Admin action" : null
            });
            
            toast.success(`Wallet ${!isFrozen ? 'frozen' : 'unfrozen'} successfully!`);
            fetchDashboardData();
        } catch (error) {
            toast.error("Failed to update wallet status");
        }
    };

    const handleToggleUserStatus = async (userId, isActive) => {
        try {
            await api.post(`/admin/users/${userId}/toggle`, {
                is_active: !isActive
            });
            
            toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully!`);
            fetchDashboardData();
        } catch (error) {
            toast.error("Failed to update user status");
        }
    };

    const totalBalance = allWallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const totalTransactions = allTransactions.length;
    const frozenWallets = allWallets.filter(w => w.is_frozen).length;

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light">
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
                <div className="container">
                    <a className="navbar-brand" href="#">
                        <i className="bi bi-shield-check me-2"></i>
                        Admin Panel
                    </a>
                    <div className="navbar-nav ms-auto">
                        <button 
                            className="btn btn-outline-light btn-sm me-2"
                            onClick={() => navigate("/dashboard")}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to Dashboard
                        </button>
                        <button 
                            className="btn btn-outline-light btn-sm"
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                navigate("/login");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                {/* Admin Stats */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                                <h6 className="card-title">Total Users</h6>
                                <h3>{totalUsers}</h3>
                                <small>Active: {activeUsers}</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h6 className="card-title">Total Balance</h6>
                                <h3>₹{totalBalance.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h6 className="card-title">Transactions</h6>
                                <h3>{totalTransactions}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-warning text-white">
                            <div className="card-body">
                                <h6 className="card-title">Frozen Wallets</h6>
                                <h3>{frozenWallets}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                            onClick={() => setActiveTab("users")}
                        >
                            Users ({users.length})
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "wallets" ? "active" : ""}`}
                            onClick={() => setActiveTab("wallets")}
                        >
                            Wallets ({allWallets.length})
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === "transactions" ? "active" : ""}`}
                            onClick={() => setActiveTab("transactions")}
                        >
                            Transactions ({allTransactions.length})
                        </button>
                    </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div className="card shadow">
                            <div className="card-header">
                                <h5 className="mb-0">All Users</h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Wallets</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => {
                                                const userWallets = allWallets.filter(w => w.user_id === user.id);
                                                return (
                                                    <tr key={user.id}>
                                                        <td>{user.id}</td>
                                                        <td>{user.name}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.phone || '-'}</td>
                                                        <td>
                                                            <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                                {user.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td>{userWallets.length}</td>
                                                        <td>
                                                            <button
                                                                className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                                                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                                                disabled={user.role === 'admin'}
                                                            >
                                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Wallets Tab */}
                    {activeTab === "wallets" && (
                        <div className="card shadow">
                            <div className="card-header">
                                <h5 className="mb-0">All Wallets</h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>User</th>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>Balance</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allWallets.map(wallet => {
                                                const user = users.find(u => u.id === wallet.user_id);
                                                return (
                                                    <tr key={wallet.id}>
                                                        <td>{wallet.id}</td>
                                                        <td>{user?.name || 'Unknown'}</td>
                                                        <td>{wallet.name}</td>
                                                        <td>
                                                            <span className={`badge ${wallet.type === 'main' ? 'bg-primary' : 'bg-secondary'}`}>
                                                                {wallet.type}
                                                            </span>
                                                        </td>
                                                        <td className="fw-bold">₹{parseFloat(wallet.balance).toFixed(2)}</td>
                                                        <td>
                                                            <span className={`badge ${wallet.is_frozen ? 'bg-danger' : 'bg-success'}`}>
                                                                {wallet.is_frozen ? 'Frozen' : 'Active'}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(wallet.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <button
                                                                className={`btn btn-sm ${wallet.is_frozen ? 'btn-success' : 'btn-warning'}`}
                                                                onClick={() => handleFreezeWallet(wallet.id, wallet.is_frozen)}
                                                            >
                                                                {wallet.is_frozen ? 'Unfreeze' : 'Freeze'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === "transactions" && (
                        <div className="card shadow">
                            <div className="card-header">
                                <h5 className="mb-0">All Transactions</h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>User</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Reference</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allTransactions.map(transaction => {
                                                const user = users.find(u => u.id === transaction.user_id);
                                                return (
                                                    <tr key={transaction.id}>
                                                        <td>{transaction.id}</td>
                                                        <td>{user?.name || 'Unknown'}</td>
                                                        <td>
                                                            <span className="text-capitalize">{transaction.type}</span>
                                                        </td>
                                                        <td className="fw-bold">
                                                            ₹{parseFloat(transaction.amount).toFixed(2)}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${
                                                                transaction.status === 'completed' ? 'bg-success' :
                                                                transaction.status === 'pending' ? 'bg-warning' :
                                                                transaction.status === 'failed' ? 'bg-danger' : 'bg-secondary'
                                                            }`}>
                                                                {transaction.status}
                                                            </span>
                                                        </td>
                                                        <td><code>{transaction.reference}</code></td>
                                                        <td>{new Date(transaction.created_at).toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
