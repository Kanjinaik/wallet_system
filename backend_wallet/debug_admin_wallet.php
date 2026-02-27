<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Wallet;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Debug Admin Wallet Issue ===\n\n";

// Check admin user and wallet
$admin = User::where('email', 'admin@example.com')->first();
echo "Admin user found: " . ($admin ? 'Yes' : 'No') . "\n";
if ($admin) {
    echo "Admin ID: {$admin->id}\n";
    echo "Admin role: {$admin->role}\n";
    
    $adminWallets = $admin->wallets;
    echo "Admin wallets count: " . $adminWallets->count() . "\n";
    
    foreach ($adminWallets as $wallet) {
        echo "  Wallet ID: {$wallet->id}, Type: {$wallet->type}, Balance: {$wallet->balance}\n";
    }
    
    $mainWallet = $admin->wallets()->where('type', 'main')->first();
    echo "Main wallet found: " . ($mainWallet ? 'Yes' : 'No') . "\n";
    if ($mainWallet) {
        echo "Main wallet balance before: {$mainWallet->balance}\n";
        
        // Try to update balance
        $mainWallet->balance += 5;
        $result = $mainWallet->save();
        echo "Save result: " . ($result ? 'Success' : 'Failed') . "\n";
        
        // Refresh and check
        $mainWallet->refresh();
        echo "Main wallet balance after: {$mainWallet->balance}\n";
    }
}

echo "\n=== Debug Complete ===\n";
