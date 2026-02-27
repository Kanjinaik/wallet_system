import React from "react";

const WalletOverview = ({ wallets }) => {
    const mainWallet = wallets.find(w => w.type === 'main');
    const subWallets = wallets.filter(w => w.type === 'sub');

    return (
        <div className="row">
            {/* Main Wallet Card */}
            <div className="col-lg-6 mb-4">
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                            <i className="bi bi-wallet2 me-2"></i>
                            Main Wallet
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-6">
                                <p className="text-muted mb-1">Balance</p>
                                <h3 className="text-success">₹{mainWallet?.balance || "0.00"}</h3>
                            </div>
                            <div className="col-6">
                                <p className="text-muted mb-1">Status</p>
                                <span className={`badge ${mainWallet?.is_frozen ? 'bg-danger' : 'bg-success'}`}>
                                    {mainWallet?.is_frozen ? 'Frozen' : 'Active'}
                                </span>
                            </div>
                        </div>
                        {mainWallet?.is_frozen && (
                            <div className="alert alert-warning mt-3">
                                <small>
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {mainWallet.freeze_reason || 'Wallet is frozen'}
                                </small>
                            </div>
                        )}
                        {!mainWallet?.is_frozen && (
                            <div className="mt-3">
                                <div className="btn-group w-100" role="group">
                                    <button 
                                        className="btn btn-success flex-fill"
                                        onClick={() => {
                                            // This will trigger the withdraw modal
                                            window.location.href = '/dashboard?withdraw=true';
                                        }}
                                    >
                                        <i className="bi bi-arrow-right-circle me-2"></i>
                                        Withdraw
                                    </button>
                                    <button 
                                        className="btn btn-primary flex-fill"
                                        onClick={() => {
                                            // This will trigger the deposit modal
                                            window.location.href = '/dashboard?deposit=true';
                                        }}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Deposit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="col-lg-6 mb-4">
                <div className="card shadow">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0">
                            <i className="bi bi-speedometer2 me-2"></i>
                            Quick Stats
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row text-center">
                            <div className="col-4">
                                <h4 className="text-primary">{subWallets.length}</h4>
                                <small className="text-muted">Sub Wallets</small>
                            </div>
                            <div className="col-4">
                                <h4 className="text-success">
                                    ₹{subWallets.reduce((sum, w) => sum + parseFloat(w.balance), 0).toFixed(2)}
                                </h4>
                                <small className="text-muted">Sub Balance</small>
                            </div>
                            <div className="col-4">
                                <h4 className="text-warning">
                                    ₹{wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0).toFixed(2)}
                                </h4>
                                <small className="text-muted">Total Balance</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Wallets */}
            <div className="col-12">
                <div className="card shadow">
                    <div className="card-header bg-secondary text-white">
                        <h5 className="mb-0">
                            <i className="bi bi-layers me-2"></i>
                            Sub Wallets
                        </h5>
                    </div>
                    <div className="card-body">
                        {subWallets.length > 0 ? (
                            <div className="row">
                                {subWallets.map(wallet => (
                                    <div key={wallet.id} className="col-md-4 mb-3">
                                        <div className="card border-primary">
                                            <div className="card-body">
                                                <h6 className="card-title">{wallet.name}</h6>
                                                <p className="card-text">
                                                    <strong>Balance:</strong> 
                                                    <span className="text-success ms-2">
                                                        ₹{parseFloat(wallet.balance).toFixed(2)}
                                                    </span>
                                                </p>
                                                <span className={`badge ${wallet.is_frozen ? 'bg-danger' : 'bg-success'}`}>
                                                    {wallet.is_frozen ? 'Frozen' : 'Active'}
                                                </span>
                                                {!wallet.is_frozen && (
                                                    <div className="mt-2">
                                                        <div className="btn-group w-100" role="group">
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary flex-fill"
                                                                onClick={() => {
                                                                    window.location.href = `/dashboard?withdraw=true&wallet_id=${wallet.id}`;
                                                                }}
                                                            >
                                                                <i className="bi bi-arrow-right-circle me-1"></i>
                                                                Withdraw
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-success flex-fill"
                                                                onClick={() => {
                                                                    window.location.href = `/dashboard?deposit=true&wallet_id=${wallet.id}`;
                                                                }}
                                                            >
                                                                <i className="bi bi-plus-circle me-1"></i>
                                                                Deposit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="bi bi-inbox display-1 text-muted"></i>
                                <p className="text-muted mt-3">No sub wallets created yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletOverview;
