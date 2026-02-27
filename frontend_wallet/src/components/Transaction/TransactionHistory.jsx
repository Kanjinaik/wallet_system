import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const TransactionHistory = ({ transactions }) => {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

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

    const filteredTransactions = transactions.filter(transaction => {
        const matchesFilter = filter === "all" || transaction.type === filter;
        const matchesSearch = transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning",
            completed: "bg-success",
            failed: "bg-danger",
            cancelled: "bg-secondary"
        };
        return badges[status] || "bg-secondary";
    };

    const getTypeIcon = (type) => {
        const icons = {
            deposit: "bi-plus-circle text-success",
            withdraw: "bi-dash-circle text-danger",
            transfer: "bi-arrow-left-right text-primary",
            receive: "bi-arrow-down-circle text-info"
        };
        return icons[type] || "bi-circle";
    };

    const exportToCSV = async () => {
        try {
            const response = await api.get("/transactions/export", {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success("Transactions exported successfully!");
        } catch (error) {
            toast.error("Failed to export transactions");
        }
    };

    return (
        <div>
            {/* Filters and Search */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <label className="form-label">Filter by Type</label>
                    <select 
                        className="form-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Transactions</option>
                        <option value="deposit">Deposits</option>
                        <option value="withdraw">Withdrawals</option>
                        <option value="transfer">Transfers</option>
                        <option value="receive">Received</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Search</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by reference or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-grid">
                        <button 
                            className="btn btn-success"
                            onClick={exportToCSV}
                        >
                            <i className="bi bi-download me-2"></i>
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-clock-history me-2"></i>
                        Transaction History ({filteredTransactions.length})
                    </h5>
                </div>
                <div className="card-body">
                    {filteredTransactions.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Reference</th>
                                        <th>Amount</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map(transaction => (
                                        <tr key={transaction.id}>
                                            <td>
                                                <i className={`bi ${getTypeIcon(transaction.type)} me-2`}></i>
                                                <span className="text-capitalize">{transaction.type}</span>
                                            </td>
                                            <td>
                                                <code>{transaction.reference}</code>
                                            </td>
                                            <td className="fw-bold">
                                                <span className={transaction.type === 'deposit' || transaction.type === 'receive' ? 'text-success' : 'text-danger'}>
                                                    {transaction.type === 'deposit' || transaction.type === 'receive' ? '+' : '-'}
                                                    ₹{parseFloat(transaction.amount).toFixed(2)}
                                                </span>
                                            </td>
                                            <td>
                                                {transaction.description || '-'}
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(transaction.status)}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(transaction.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                            <h5 className="text-muted mt-3">No Transactions Found</h5>
                            <p className="text-muted">
                                {searchTerm || filter !== "all" 
                                    ? "Try adjusting your filters or search terms" 
                                    : "Start making transactions to see them here"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Summary */}
            <div className="row mt-4">
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <h6>Total Deposits</h6>
                            <h4>
                                ₹{filteredTransactions
                                    .filter(t => t.type === 'deposit' && t.status === 'completed')
                                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                                    .toFixed(2)}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-danger text-white">
                        <div className="card-body text-center">
                            <h6>Total Withdrawals</h6>
                            <h4>
                                ₹{filteredTransactions
                                    .filter(t => t.type === 'withdraw' && t.status === 'completed')
                                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                                    .toFixed(2)}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h6>Total Transfers</h6>
                            <h4>
                                ₹{filteredTransactions
                                    .filter(t => t.type === 'transfer' && t.status === 'completed')
                                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                                    .toFixed(2)}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h6>Total Received</h6>
                            <h4>
                                ₹{filteredTransactions
                                    .filter(t => t.type === 'receive' && t.status === 'completed')
                                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                                    .toFixed(2)}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
