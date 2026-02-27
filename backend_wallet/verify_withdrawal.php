<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Withdrawal Fee Verification ===\n\n";

// Check admin wallet
$admin = App\Models\User::where('role', 'admin')->first();
if ($admin) {
    $mainWallet = $admin->wallets()->where('type', 'main')->first();
    echo "Admin Main Wallet Balance: ₹" . ($mainWallet ? $mainWallet->balance : 'N/A') . "\n";
} else {
    echo "Admin not found\n";
}

echo "\n=== Latest Withdrawals ===\n\n";

$withdrawals = App\Models\WithdrawRequest::with(['user', 'wallet'])
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get();

foreach ($withdrawals as $wr) {
    echo "Request ID: {$wr->id}\n";
    echo "  User: {$wr->user->name}\n";
    echo "  Amount: ₹{$wr->amount}\n";
    echo "  Net Amount (DB): ₹{$wr->net_amount}\n";
    echo "  Fee (metadata): ₹" . ($wr->metadata['withdrawal_fee'] ?? 'NOT SET') . "\n";
    echo "  Net to Customer: ₹" . ($wr->metadata['net_payout_to_customer'] ?? 'NOT SET') . "\n";
    echo "  Status: {$wr->status}\n";
    echo "  Created: {$wr->created_at}\n\n";
}

echo "=== Expected Behavior ===\n";
echo "1. Withdrawal Amount shown: ₹5000\n";
echo "2. Net Amount (DB field): ₹5000 (full withdrawal amount)\n";
echo "3. Fee deducted from admin profit: ₹5\n";
echo "4. Admin receives: ₹5 in main wallet\n";
echo "5. Customer gets: ₹4995 in their account\n";
