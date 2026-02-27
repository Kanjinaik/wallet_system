<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Fee Logic ===\n\n";

// Test 1: Check admin user exists
$admin = App\Models\User::where('role', 'admin')->first();
if ($admin) {
    echo "✓ Admin user found: {$admin->name}\n";
    $mainWallet = $admin->wallets()->where('type', 'main')->first();
    $subWallet = $admin->wallets()->where('type', 'sub')->first();
    echo "  Main wallet: " . ($mainWallet ? "✓ Found (Balance: ₹{$mainWallet->balance})" : "✗ Not found") . "\n";
    echo "  Sub wallet: " . ($subWallet ? "✓ Found (Balance: ₹{$subWallet->balance})" : "✗ Not found") . "\n";
} else {
    echo "✗ Admin user not found\n";
}

echo "\n=== Testing Recent Withdrawals ===\n\n";

$withdrawals = App\Models\WithdrawRequest::with(['user', 'wallet'])->orderBy('created_at', 'desc')->limit(5)->get();
echo "Total recent withdraw requests: " . $withdrawals->count() . "\n\n";

foreach ($withdrawals as $wr) {
    echo "Withdrawal ID: {$wr->id}\n";
    echo "  User: {$wr->user->name}\n";
    echo "  Amount: ₹{$wr->amount}\n";
    echo "  Net Amount (DB): ₹{$wr->net_amount}\n";
    echo "  Status: {$wr->status}\n";
    echo "  Fee from metadata: ₹" . ($wr->metadata['withdrawal_fee'] ?? 'NOT SET') . "\n";
    echo "  Net payout from metadata: ₹" . ($wr->metadata['net_payout_to_customer'] ?? 'NOT SET') . "\n";
    echo "  Created: {$wr->created_at}\n\n";
}

echo "=== Current Admin Wallet Balance ===\n";
$admin = App\Models\User::where('role', 'admin')->first();
if ($admin) {
    $mainWallet = $admin->wallets()->where('type', 'main')->first();
    if ($mainWallet) {
        echo "Admin Main Wallet: ₹{$mainWallet->balance}\n";
    }
}
