<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\CommissionConfig;
use App\Models\User;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Commission System ===\n\n";

// Test 1: Get commission configuration for retailer
echo "1. Getting commission config for retailer...\n";
$retailerConfig = CommissionConfig::getActiveConfig('retailer');
if ($retailerConfig) {
    echo "✓ Found retailer commission config\n";
    echo "  Admin commission: {$retailerConfig->admin_commission}%\n";
    echo "  Distributor commission: {$retailerConfig->distributor_commission}%\n";
} else {
    echo "✗ No retailer commission config found\n";
}

echo "\n";

// Test 2: Calculate commission for ₹100 withdrawal
echo "2. Calculating commission for ₹100 withdrawal...\n";
if ($retailerConfig) {
    $calculation = $retailerConfig->calculateCommission(100);
    echo "✓ Commission calculated:\n";
    echo "  Original amount: ₹{$calculation['original_amount']}\n";
    echo "  Admin commission: ₹{$calculation['admin_commission_amount']} ({$calculation['admin_commission_percentage']}%)\n";
    echo "  Distributor commission: ₹{$calculation['distributor_commission_amount']} ({$calculation['distributor_commission_percentage']}%)\n";
    echo "  Total commission: ₹{$calculation['total_commission']}\n";
    echo "  Net amount to retailer: ₹{$calculation['net_amount']}\n";
} else {
    echo "✗ Cannot calculate commission - no config found\n";
}

echo "\n";

// Test 3: Check test users
echo "3. Checking test users...\n";
$admin = User::where('email', 'admin@example.com')->first();
$distributor = User::where('email', 'distributor@example.com')->first();
$retailer = User::where('email', 'retailer@example.com')->first();

if ($admin && $distributor && $retailer) {
    echo "✓ All test users found:\n";
    echo "  Admin: {$admin->name} ({$admin->role})\n";
    echo "  Distributor: {$distributor->name} ({$distributor->role})\n";
    echo "  Retailer: {$retailer->name} ({$retailer->role})\n";
    
    echo "\n  Wallet balances:\n";
    foreach ([$admin, $distributor, $retailer] as $user) {
        foreach ($user->wallets as $wallet) {
            echo "    {$user->name} - {$wallet->name}: ₹{$wallet->balance}\n";
        }
    }
} else {
    echo "✗ Some test users missing\n";
    echo "  Admin found: " . ($admin ? 'Yes' : 'No') . "\n";
    echo "  Distributor found: " . ($distributor ? 'Yes' : 'No') . "\n";
    echo "  Retailer found: " . ($retailer ? 'Yes' : 'No') . "\n";
}

echo "\n=== Commission System Test Complete ===\n";
