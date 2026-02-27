import React, { useState } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

const TransferFunds = ({ wallets, onTransferComplete }) => {
    const [transferData, setTransferData] = useState({
        transfer_type: "wallet", // "wallet" or "bank"
        from_wallet_id: "",
        to_wallet_id: "",
        amount: "",
        description: "",
        // Bank transfer fields
        bank_account: "",
        ifsc_code: "",
        account_holder_name: ""
    });
    const [loading, setLoading] = useState(false);

    const mainWallet = wallets.find(w => w.type === 'main');
    const subWallets = wallets.filter(w => w.type === 'sub');
    
    // Show all wallets for withdrawal (including frozen ones)
    const allWalletsForWithdrawal = wallets.filter(w => parseFloat(w.balance || 0) > 0);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log("Transfer data being sent:", transferData);
        console.log("Available wallets:", wallets);

        try {
            let response;
            
            if (transferData.transfer_type === "wallet") {
                // Wallet to wallet transfer
                response = await api.post("/transfer", {
                    from_wallet_id: transferData.from_wallet_id,
                    to_wallet_id: transferData.to_wallet_id,
                    amount: transferData.amount,
                    description: transferData.description
                });
            } else {
                // Wallet to bank transfer
                response = await api.post("/withdraw", {
                    wallet_id: transferData.from_wallet_id,
                    amount: transferData.amount,
                    bank_account: transferData.bank_account,
                    ifsc_code: transferData.ifsc_code,
                    account_holder_name: transferData.account_holder_name,
                    description: transferData.description
                });
            }
            
            console.log("Transfer response:", response.data);
            
            const successMessage = transferData.transfer_type === "wallet" 
                ? "Transfer completed successfully!" 
                : "Bank transfer request submitted successfully!";
            
            toast.success(successMessage);
            setTransferData({
                transfer_type: "wallet",
                from_wallet_id: "",
                to_wallet_id: "",
                amount: "",
                description: "",
                bank_account: "",
                ifsc_code: "",
                account_holder_name: ""
            });
            onTransferComplete();
        } catch (error) {
            console.error("Transfer error:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.message || "Transfer failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        console.log("Transfer type changed:", e.target.name, e.target.value);
        setTransferData({
            ...transferData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="row">
            <div className="col-lg-8 mx-auto">
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                            <i className="bi bi-arrow-left-right me-2"></i>
                            Transfer Funds
                        </h5>
                    </div>
                    <div className="card-body">
                        {/* Debug Info */}
                        <div className="alert alert-warning">
                            <small>Debug: Current transfer type = {transferData.transfer_type}</small>
                        </div>
                        
                        <form onSubmit={handleTransfer}>
                            {/* Transfer Type Selector */}
                            <div className="mb-4">
                                <label className="form-label">
                                    <i className="bi bi-exchange-alt me-2"></i>
                                    Transfer Type
                                </label>
                                <div className="btn-group w-100" role="group">
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="transfer_type"
                                        id="walletTransfer"
                                        value="wallet"
                                        checked={transferData.transfer_type === "wallet"}
                                        onChange={handleChange}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="walletTransfer">
                                        <i className="bi bi-wallet2 me-2"></i>
                                        Wallet to Wallet
                                    </label>
                                    
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name="transfer_type"
                                        id="bankTransfer"
                                        value="bank"
                                        checked={transferData.transfer_type === "bank"}
                                        onChange={handleChange}
                                    />
                                    <label className="btn btn-outline-success" htmlFor="bankTransfer">
                                        <i className="bi bi-bank me-2"></i>
                                        Wallet to Bank
                                    </label>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">From Wallet</label>
                                    <select
                                        className="form-select"
                                        name="from_wallet_id"
                                        value={transferData.from_wallet_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select source wallet</option>
                                        {allWalletsForWithdrawal.map(wallet => (
                                            <option key={wallet.id} value={wallet.id}>
                                                {wallet.name} - ₹{parseFloat(wallet.balance).toFixed(2)}
                                                {wallet.is_frozen && ' ❄️FROZEN'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Conditional Destination Field */}
                                <div className="alert alert-info">
                                    <small>Debug: Showing bank fields = {transferData.transfer_type !== "wallet"}</small>
                                </div>
                                {transferData.transfer_type === "wallet" ? (
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">To Wallet</label>
                                        <select
                                            className="form-select"
                                            name="to_wallet_id"
                                            value={transferData.to_wallet_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select destination wallet</option>
                                            {allWalletsForWithdrawal.map(wallet => (
                                                <option key={wallet.id} value={wallet.id}>
                                                    {wallet.name} - ₹{parseFloat(wallet.balance).toFixed(2)}
                                                    {wallet.is_frozen && ' ❄️FROZEN'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Bank Account Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="bank_account"
                                            value={transferData.bank_account}
                                            onChange={handleChange}
                                            placeholder="1234567890"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Bank Transfer Additional Fields */}
                            {transferData.transfer_type === "bank" && (
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">IFSC Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="ifsc_code"
                                            value={transferData.ifsc_code}
                                            onChange={handleChange}
                                            placeholder="SBIN0000123"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Account Holder Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="account_holder_name"
                                            value={transferData.account_holder_name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Amount (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="amount"
                                            value={transferData.amount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Description (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="description"
                                        value={transferData.description}
                                        onChange={handleChange}
                                        placeholder="Transfer description"
                                    />
                                </div>
                            </div>

                            {/* Transfer Info */}
                            <div className="mt-4">
                                {transferData.transfer_type === "wallet" ? (
                                    <div className="alert alert-info">
                                        <h6>
                                            <i className="bi bi-info-circle me-2"></i>
                                            Wallet Transfer Information
                                        </h6>
                                        <ul className="mb-0">
                                            <li>Instant transfer between your wallets</li>
                                            <li>No processing fees</li>
                                            <li>Both wallets must be active (not frozen)</li>
                                            <li>Transaction will appear in history immediately</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="alert alert-success">
                                        <h6>
                                            <i className="bi bi-bank me-2"></i>
                                            Bank Transfer Information
                                        </h6>
                                        <ul className="mb-0">
                                            <li>Transfer processed within 24-48 hours</li>
                                            <li>Bank charges may apply</li>
                                            <li>Ensure bank details are correct</li>
                                            <li>You will receive confirmation via email</li>
                                            <li>Minimum transfer: ₹100</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="d-grid">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={
                                        loading || 
                                        !transferData.from_wallet_id || 
                                        !transferData.amount || 
                                        parseFloat(transferData.amount) <= 0 ||
                                        (transferData.transfer_type === "wallet" && !transferData.to_wallet_id) ||
                                        (transferData.transfer_type === "bank" && (!transferData.bank_account || !transferData.ifsc_code || !transferData.account_holder_name))
                                    }
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-arrow-right-circle me-2"></i>
                                            {transferData.transfer_type === "wallet" ? "Transfer to Wallet" : "Transfer to Bank"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferFunds;
