import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SubWallets = ({ wallets, onWalletUpdate }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWalletName, setNewWalletName] = useState("");
    const [loading, setLoading] = useState(false);

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

    const mainWallet = wallets.find(w => w.type === 'main');
    const subWallets = wallets.filter(w => w.type === 'sub');

    const handleCreateWallet = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/wallets", {
                name: newWalletName,
                type: 'sub'
            });
            
            toast.success("Sub wallet created successfully!");
            setNewWalletName("");
            setShowCreateModal(false);
            onWalletUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create wallet");
        } finally {
            setLoading(false);
        }
    };

    const handleFreezeWallet = async (walletId, isFrozen) => {
        try {
            await api.post(`/wallets/${walletId}/freeze`, {
                is_frozen: !isFrozen,
                reason: !isFrozen ? "Manual freeze by user" : null
            });
            
            toast.success(`Wallet ${!isFrozen ? 'frozen' : 'unfrozen'} successfully!`);
            onWalletUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update wallet status");
        }
    };

    return (
        <div>
            {/* Create Wallet Button */}
            <div className="row mb-4">
                <div className="col-12">
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Sub Wallet
                    </button>
                </div>
            </div>

            {/* Main Wallet */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-wallet2 me-2"></i>
                                Main Wallet
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <h6>{mainWallet?.name || "Main Wallet"}</h6>
                                    <h4 className="text-success">₹{mainWallet?.balance || "0.00"}</h4>
                                </div>
                                <div className="col-md-4">
                                    <span className={`badge ${mainWallet?.is_frozen ? 'bg-danger' : 'bg-success'}`}>
                                        {mainWallet?.is_frozen ? 'Frozen' : 'Active'}
                                    </span>
                                </div>
                                <div className="col-md-4 text-end">
                                    <button 
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleFreezeWallet(mainWallet?.id, mainWallet?.is_frozen)}
                                        disabled={mainWallet?.is_frozen}
                                    >
                                        {mainWallet?.is_frozen ? 'Unfreeze' : 'Freeze'}
                                    </button>
                                </div>
                            </div>
                            {mainWallet?.is_frozen && mainWallet?.freeze_reason && (
                                <div className="alert alert-warning mt-3 mb-0">
                                    <small>{mainWallet.freeze_reason}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Wallets */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-layers me-2"></i>
                                Sub Wallets ({subWallets.length})
                            </h5>
                        </div>
                        <div className="card-body">
                            {subWallets.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Balance</th>
                                                <th>Status</th>
                                                <th>Created At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subWallets.map(wallet => (
                                                <tr key={wallet.id}>
                                                    <td>
                                                        <i className="bi bi-wallet me-2"></i>
                                                        {wallet.name}
                                                    </td>
                                                    <td className="text-success fw-bold">
                                                        ₹{parseFloat(wallet.balance).toFixed(2)}
                                                    </td>
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
                                                            <i className={`bi bi-${wallet.is_frozen ? 'unlock' : 'lock'} me-1`}></i>
                                                            {wallet.is_frozen ? 'Unfreeze' : 'Freeze'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-inbox display-1 text-muted"></i>
                                    <h5 className="text-muted mt-3">No Sub Wallets</h5>
                                    <p className="text-muted">Create your first sub wallet to get started</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Wallet Modal */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Sub Wallet</h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setShowCreateModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleCreateWallet}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Wallet Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newWalletName}
                                            onChange={(e) => setNewWalletName(e.target.value)}
                                            placeholder="e.g., Savings Wallet"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? "Creating..." : "Create Wallet"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubWallets;
