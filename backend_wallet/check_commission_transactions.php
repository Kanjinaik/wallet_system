<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Commission Transactions ===\n\n";

$transactions = App\Models\CommissionTransaction::with(['user', 'wallet'])->get();

echo "Total commission transactions: " . $transactions->count() . "\n\n";

foreach ($transactions as $tx) {
    echo "Transaction ID: {$tx->id}\n";
    echo "  User: {$tx->user->name} ({$tx->user->role})\n";
    echo "  Wallet: {$tx->wallet->name} (Balance: {$tx->wallet->balance})\n";
    echo "  Commission Type: {$tx->commission_type}\n";
    echo "  Commission Amount: ₹{$tx->commission_amount}\n";
    echo "  Description: {$tx->description}\n";
    echo "  Created: {$tx->created_at}\n\n";
}

echo "=== Current Wallet Balances ===\n\n";

$users = App\Models\User::with('wallets')->get();
foreach ($users as $user) {
    echo "{$user->name} ({$user->role}):\n";
    foreach ($user->wallets as $wallet) {
        echo "  {$wallet->name}: ₹{$wallet->balance}\n";
    }
    echo "\n";
}
