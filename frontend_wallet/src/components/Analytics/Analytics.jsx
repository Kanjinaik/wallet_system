import React, { useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { format, subDays, startOfDay } from "date-fns";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
);

const Analytics = ({ transactions, wallets }) => {
    const analyticsData = useMemo(() => {
        const completedTransactions = transactions.filter(t => t.status === 'completed');
        
        // Transaction types breakdown
        const typeBreakdown = completedTransactions.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

        // Last 7 days transactions
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = startOfDay(subDays(new Date(), i));
            const dayTransactions = completedTransactions.filter(t => 
                startOfDay(new Date(t.created_at)).getTime() === date.getTime()
            );
            
            last7Days.push({
                date: format(date, 'MMM dd'),
                deposits: dayTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + parseFloat(t.amount), 0),
                withdrawals: dayTransactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + parseFloat(t.amount), 0),
                transfers: dayTransactions.filter(t => t.type === 'transfer').reduce((sum, t) => sum + parseFloat(t.amount), 0),
            });
        }

        // Wallet distribution
        const walletDistribution = wallets.map(w => ({
            name: w.name,
            balance: parseFloat(w.balance),
            type: w.type
        }));

        // Monthly trends
        const monthlyData = completedTransactions.reduce((acc, t) => {
            const month = format(new Date(t.created_at), 'MMM yyyy');
            if (!acc[month]) {
                acc[month] = { deposits: 0, withdrawals: 0, transfers: 0 };
            }
            acc[month][t.type === 'deposit' ? 'deposits' : t.type === 'withdraw' ? 'withdrawals' : 'transfers'] += parseFloat(t.amount);
            return acc;
        }, {});

        return {
            typeBreakdown,
            last7Days,
            walletDistribution,
            monthlyData
        };
    }, [transactions, wallets]);

    // Chart configurations
    const pieChartData = {
        labels: Object.keys(analyticsData.typeBreakdown),
        datasets: [
            {
                data: Object.values(analyticsData.typeBreakdown),
                backgroundColor: [
                    '#28a745',
                    '#dc3545',
                    '#007bff',
                    '#17a2b8',
                ],
                borderWidth: 2,
                borderColor: '#fff',
            },
        ],
    };

    const barChartData = {
        labels: analyticsData.last7Days.map(d => d.date),
        datasets: [
            {
                label: 'Deposits',
                data: analyticsData.last7Days.map(d => d.deposits),
                backgroundColor: '#28a745',
            },
            {
                label: 'Withdrawals',
                data: analyticsData.last7Days.map(d => d.withdrawals),
                backgroundColor: '#dc3545',
            },
            {
                label: 'Transfers',
                data: analyticsData.last7Days.map(d => d.transfers),
                backgroundColor: '#007bff',
            },
        ],
    };

    const walletChartData = {
        labels: analyticsData.walletDistribution.map(w => w.name),
        datasets: [
            {
                label: 'Wallet Balance',
                data: analyticsData.walletDistribution.map(w => w.balance),
                backgroundColor: analyticsData.walletDistribution.map(w => 
                    w.type === 'main' ? '#007bff' : '#28a745'
                ),
            },
        ],
    };

    const monthlyChartData = {
        labels: Object.keys(analyticsData.monthlyData),
        datasets: [
            {
                label: 'Deposits',
                data: Object.values(analyticsData.monthlyData).map(d => d.deposits),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Withdrawals',
                data: Object.values(analyticsData.monthlyData).map(d => d.withdrawals),
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions * 100).toFixed(1) : 0;

    return (
        <div>
            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Balance</h6>
                            <h3>₹{totalBalance.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Transactions</h6>
                            <h3>{totalTransactions}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <h6 className="card-title">Success Rate</h6>
                            <h3>{successRate}%</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <h6 className="card-title">Active Wallets</h6>
                            <h3>{wallets.length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="row">
                {/* Transaction Types Pie Chart */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow">
                        <div className="card-header">
                            <h6 className="mb-0">Transaction Types</h6>
                        </div>
                        <div className="card-body">
                            {Object.keys(analyticsData.typeBreakdown).length > 0 ? (
                                <Pie data={pieChartData} />
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted">No transaction data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Last 7 Days Bar Chart */}
                <div className="col-md-8 mb-4">
                    <div className="card shadow">
                        <div className="card-header">
                            <h6 className="mb-0">Last 7 Days Activity</h6>
                        </div>
                        <div className="card-body">
                            <Bar data={barChartData} />
                        </div>
                    </div>
                </div>

                {/* Wallet Distribution */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow">
                        <div className="card-header">
                            <h6 className="mb-0">Wallet Balance Distribution</h6>
                        </div>
                        <div className="card-body">
                            <Bar data={walletChartData} />
                        </div>
                    </div>
                </div>

                {/* Monthly Trends */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow">
                        <div className="card-header">
                            <h6 className="mb-0">Monthly Trends</h6>
                        </div>
                        <div className="card-body">
                            {Object.keys(analyticsData.monthlyData).length > 0 ? (
                                <Line data={monthlyChartData} />
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted">Insufficient data for monthly trends</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Statistics */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header">
                            <h6 className="mb-0">Detailed Statistics</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <h6>Total Deposits</h6>
                                    <p className="text-success fs-4">
                                        ₹{analyticsData.typeBreakdown.deposit?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div className="col-md-3">
                                    <h6>Total Withdrawals</h6>
                                    <p className="text-danger fs-4">
                                        ₹{analyticsData.typeBreakdown.withdraw?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div className="col-md-3">
                                    <h6>Total Transfers</h6>
                                    <p className="text-primary fs-4">
                                        ₹{analyticsData.typeBreakdown.transfer?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div className="col-md-3">
                                    <h6>Total Received</h6>
                                    <p className="text-info fs-4">
                                        ₹{analyticsData.typeBreakdown.receive?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
