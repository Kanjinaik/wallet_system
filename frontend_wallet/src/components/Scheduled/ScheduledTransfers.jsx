import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

const ScheduledTransfers = ({ wallets }) => {
    const [scheduledTransfers, setScheduledTransfers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTransfer, setEditingTransfer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        from_wallet_id: "",
        to_wallet_id: "",
        amount: "",
        description: "",
        frequency: "daily",
        scheduled_at: ""
    });

    // Show all wallets for scheduled transfers (including frozen ones)
    const allWalletsForTransfer = wallets.filter(w => parseFloat(w.balance || 0) > 0);

    useEffect(() => {
        fetchScheduledTransfers();
    }, []);

    const fetchScheduledTransfers = async () => {
        try {
            const response = await api.get("/scheduled-transfers");
            setScheduledTransfers(response.data);
        } catch (error) {
            toast.error("Failed to fetch scheduled transfers");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingTransfer) {
                await api.put(`/scheduled-transfers/${editingTransfer.id}`, formData);
                toast.success("Scheduled transfer updated successfully!");
            } else {
                await api.post("/scheduled-transfers", formData);
                toast.success("Scheduled transfer created successfully!");
            }

            resetForm();
            fetchScheduledTransfers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save scheduled transfer");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (transfer) => {
        setEditingTransfer(transfer);
        setFormData({
            from_wallet_id: transfer.from_wallet_id,
            to_wallet_id: transfer.to_wallet_id,
            amount: transfer.amount,
            description: transfer.description || "",
            frequency: transfer.frequency,
            scheduled_at: new Date(transfer.scheduled_at).toISOString().slice(0, 16)
        });
        setShowCreateModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this scheduled transfer?")) {
            return;
        }

        try {
            await api.delete(`/scheduled-transfers/${id}`);
            toast.success("Scheduled transfer deleted successfully!");
            fetchScheduledTransfers();
        } catch (error) {
            toast.error("Failed to delete scheduled transfer");
        }
    };

    const handleToggle = async (id) => {
        try {
            await api.post(`/scheduled-transfers/${id}/toggle`);
            toast.success("Scheduled transfer status updated!");
            fetchScheduledTransfers();
        } catch (error) {
            toast.error("Failed to update scheduled transfer");
        }
    };

    const resetForm = () => {
        setFormData({
            from_wallet_id: "",
            to_wallet_id: "",
            amount: "",
            description: "",
            frequency: "daily",
            scheduled_at: ""
        });
        setEditingTransfer(null);
        setShowCreateModal(false);
    };

    const getFrequencyLabel = (frequency) => {
        const labels = {
            daily: "Daily",
            weekly: "Weekly",
            monthly: "Monthly",
            yearly: "Yearly",
            once: "Once"
        };
        return labels[frequency] || frequency;
    };

    return (
        <div>
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5>
                            <i className="bi bi-clock-history me-2"></i>
                            Scheduled Transfers ({scheduledTransfers.length})
                        </h5>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Schedule Transfer
                        </button>
                    </div>
                </div>
            </div>

            {/* Scheduled Transfers List */}
            <div className="card shadow">
                <div className="card-body">
                    {scheduledTransfers.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Amount</th>
                                        <th>Frequency</th>
                                        <th>Next Execution</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scheduledTransfers.map(transfer => {
                                        const fromWallet = wallets.find(w => w.id === transfer.from_wallet_id);
                                        const toWallet = wallets.find(w => w.id === transfer.to_wallet_id);
                                        
                                        return (
                                            <tr key={transfer.id}>
                                                <td>
                                                    <i className="bi bi-wallet me-2"></i>
                                                    {fromWallet?.name || 'Unknown'}
                                                </td>
                                                <td>
                                                    <i className="bi bi-wallet me-2"></i>
                                                    {toWallet?.name || 'Unknown'}
                                                </td>
                                                <td className="fw-bold text-primary">
                                                    ₹{parseFloat(transfer.amount).toFixed(2)}
                                                </td>
                                                <td>
                                                    <span className="badge bg-info">
                                                        {getFrequencyLabel(transfer.frequency)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {new Date(transfer.next_execution_at).toLocaleString()}
                                                </td>
                                                <td>
                                                    <span className={`badge ${transfer.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                                        {transfer.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => handleEdit(transfer)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            className={`btn ${transfer.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                            onClick={() => handleToggle(transfer.id)}
                                                        >
                                                            <i className={`bi bi-${transfer.is_active ? 'pause' : 'play'}`}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(transfer.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-clock display-1 text-muted"></i>
                            <h5 className="text-muted mt-3">No Scheduled Transfers</h5>
                            <p className="text-muted">Set up automatic transfers between your wallets</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingTransfer ? 'Edit Scheduled Transfer' : 'Schedule New Transfer'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={resetForm}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">From Wallet</label>
                                            <select
                                                className="form-select"
                                                name="from_wallet_id"
                                                value={formData.from_wallet_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select source wallet</option>
                                                {allWalletsForTransfer.map(wallet => (
                                                    <option key={wallet.id} value={wallet.id}>
                                                        {wallet.name} - ₹{parseFloat(wallet.balance).toFixed(2)}
                                                        {wallet.is_frozen && ' ❄️FROZEN'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">To Wallet</label>
                                            <select
                                                className="form-select"
                                                name="to_wallet_id"
                                                value={formData.to_wallet_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select destination wallet</option>
                                                {allWalletsForTransfer.map(wallet => (
                                                    <option key={wallet.id} value={wallet.id}>
                                                        {wallet.name} - ₹{parseFloat(wallet.balance).toFixed(2)}
                                                        {wallet.is_frozen && ' ❄️FROZEN'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Amount (₹)</label>
                                            <div className="input-group">
                                                <span className="input-group-text">₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="amount"
                                                    value={formData.amount}
                                                    onChange={handleChange}
                                                    placeholder="100.00"
                                                    step="0.01"
                                                    min="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Frequency</label>
                                            <select
                                                className="form-select"
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                                <option value="once">Once</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Schedule Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            name="scheduled_at"
                                            value={formData.scheduled_at}
                                            onChange={handleChange}
                                            min={new Date().toISOString().slice(0, 16)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Description (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Transfer description"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : (editingTransfer ? "Update Transfer" : "Schedule Transfer")}
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

export default ScheduledTransfers;
