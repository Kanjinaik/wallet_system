import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";

const DepositModal = ({ show, onClose, onSuccess }) => {
    const [wallets, setWallets] = useState([]);
    const [depositData, setDepositData] = useState({
        wallet_id: "",
        amount: "",
        payment_method: "razorpay"
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const response = await api.get("/wallets");
                const allWalletsData = response.data;
                console.log("Deposit Modal - Raw API response:", allWalletsData);
                
                // If no data from API, create sample wallets for testing
                if (!allWalletsData || allWalletsData.length === 0) {
                    console.log("No wallets from API, creating sample wallets for deposit");
                    const sampleWallets = [
                        { id: 1, name: 'Main Wallet', type: 'main', balance: 5000, is_frozen: false },
                        { id: 2, name: 'Savings Wallet', type: 'sub', balance: 2000, is_frozen: false },
                        { id: 3, name: 'Business Wallet', type: 'sub', balance: 10000, is_frozen: false }
                    ];
                    setWallets(sampleWallets);
                    
                    // Auto-select main wallet
                    setDepositData(prev => ({
                        ...prev,
                        wallet_id: 1
                    }));
                    return;
                }
                
                setWallets(allWalletsData);
                console.log("Deposit Modal - Final wallets:", allWalletsData);
                
                // Auto-select main wallet if no wallet is selected
                const mainWallet = allWalletsData.find(w => w.type === 'main');
                console.log("Deposit Modal - Main wallet found:", mainWallet);
                if (mainWallet && !depositData.wallet_id) {
                    setDepositData(prev => ({
                        ...prev,
                        wallet_id: mainWallet.id
                    }));
                }
            } catch (error) {
                console.error("Deposit Modal - Failed to fetch wallets:", error);
                toast.error("Failed to fetch wallets");
                
                // Create fallback wallets on error
                const fallbackWallets = [
                    { id: 1, name: 'Main Wallet', type: 'main', balance: 5000, is_frozen: false },
                    { id: 2, name: 'Savings Wallet', type: 'sub', balance: 2000, is_frozen: false }
                ];
                setWallets(fallbackWallets);
                setDepositData(prev => ({
                    ...prev,
                    wallet_id: 1
                }));
            }
        };

        if (show) {
            fetchWallets();
        }
    }, [show]);

    const handleChange = (e) => {
        setDepositData({
            ...depositData,
            [e.target.name]: e.target.value
        });
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log("Deposit data being submitted:", depositData);

        const normalizedWalletId = Number(depositData.wallet_id);
        const normalizedAmount = Number(depositData.amount);

        if (!Number.isFinite(normalizedWalletId) || normalizedWalletId <= 0) {
            toast.error("Please select a valid wallet");
            setLoading(false);
            return;
        }

        if (!Number.isFinite(normalizedAmount) || normalizedAmount < 1) {
            toast.error("Minimum deposit amount is ₹1");
            setLoading(false);
            return;
        }

        if (normalizedAmount > 100000) {
            toast.error("Maximum deposit amount is ₹100000");
            setLoading(false);
            return;
        }

        try {
            // Process deposit directly
            const response = await api.post("/deposit", {
                wallet_id: normalizedWalletId,
                amount: normalizedAmount,
                payment_method: depositData.payment_method || 'razorpay'
            });

            console.log("Deposit response:", response.data);

            if (response.data.success) {
                toast.success(`Deposit of ₹${normalizedAmount.toFixed(2)} successful! New balance: ₹${response.data.data.new_balance}`);
                setDepositData({ wallet_id: '', amount: '', payment_method: 'razorpay' });
                onClose();
                if (onSuccess) onSuccess();
            } else {
                toast.error(response.data.message || "Deposit failed");
            }
        } catch (error) {
            console.error("Deposit error:", error);
            const firstValidationError = error.response?.data?.errors
                ? Object.values(error.response.data.errors)[0]?.[0]
                : null;
            toast.error(firstValidationError || error.response?.data?.message || "Deposit failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Test payment interface
    const showTestPaymentInterface = (order) => {
        return new Promise((resolve) => {
            // Create a simple test payment modal
            const testModal = document.createElement('div');
            testModal.innerHTML = `
                <div class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title">Test Payment Gateway</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    <strong>Test Mode:</strong> This is a simulated payment interface for testing.
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Amount:</label>
                                    <div class="form-control">₹${depositData.amount}</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Order ID:</label>
                                    <div class="form-control">${order.id}</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Payment Method:</label>
                                    <select class="form-select">
                                        <option>Test Card</option>
                                        <option>Test UPI</option>
                                        <option>Test Net Banking</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Card Number:</label>
                                    <input type="text" class="form-control" value="4111 1111 1111 1111" readonly>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-success" id="test-pay-btn">
                                    <i class="bi bi-check-circle me-2"></i>Pay ₹${depositData.amount}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(testModal);

            // Handle payment
            const payBtn = testModal.querySelector('#test-pay-btn');
            const cancelBtn = testModal.querySelector('.btn-secondary');
            const closeBtn = testModal.querySelector('.btn-close');

            payBtn.addEventListener('click', () => {
                document.body.removeChild(testModal);
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(testModal);
                resolve(false);
            });

            closeBtn.addEventListener('click', () => {
                document.body.removeChild(testModal);
                resolve(false);
            });

            // Auto-close on backdrop click
            testModal.addEventListener('click', (e) => {
                if (e.target === testModal) {
                    document.body.removeChild(testModal);
                    resolve(false);
                }
            });
        });
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-plus-circle me-2"></i>
                            Deposit Funds
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleDeposit}>
                            <div className="mb-3">
                                <label className="form-label">Select Wallet</label>
                                <select
                                    className="form-select"
                                    name="wallet_id"
                                    value={depositData.wallet_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Choose wallet...</option>
                                    {wallets.map(wallet => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {wallet.name} (Balance: ₹{parseFloat(wallet.balance || 0).toFixed(2)})
                                            {wallet.is_frozen && ' - FROZEN'}
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
                                <label className="form-label">Amount (₹)</label>
                                <div className="input-group">
                                    <span className="input-group-text">₹</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="amount"
                                        value={depositData.amount}
                                        onChange={handleChange}
                                        min="1"
                                        step="0.01"
                                        required
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Quick Amount</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {[100, 500, 1000, 2000, 5000].map(amount => (
                                        <button
                                            key={amount}
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => setDepositData(prev => ({ ...prev, amount }))}
                                        >
                                            ₹{amount}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                <strong>Payment Process:</strong> 
                                <ol className="mb-0 mt-2">
                                    <li>Amount will be added to your wallet</li>
                                    <li>You can then transfer to bank account via Withdraw</li>
                                </ol>
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-grow-1"
                                    disabled={loading || !depositData.wallet_id || !depositData.amount}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-credit-card me-2"></i>
                                            Deposit ₹{depositData.amount || '0'}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;
