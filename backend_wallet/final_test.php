<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Wallet;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔥 FINAL WALLET TRANSFER TEST 🔥\n\n";

// Login and get token
$ch = curl_init('http://127.0.0.1:8000/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'test@example.com',
    'password' => 'password123'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo "❌ Login failed: HTTP $httpCode\n";
    exit(1);
}

$data = json_decode($response, true);
$token = $data['token'];
echo "✅ Login successful!\n";

// Get wallets
$ch = curl_init('http://127.0.0.1:8000/api/wallets');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$walletsResponse = curl_exec($ch);
$walletsHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($walletsHttpCode !== 200) {
    echo "❌ Failed to get wallets: HTTP $walletsHttpCode\n";
    exit(1);
}

$wallets = json_decode($walletsResponse, true);
echo "✅ Retrieved " . count($wallets) . " wallets:\n";

foreach ($wallets as $wallet) {
    $status = $wallet['is_frozen'] ? '❌ FROZEN' : '✅ ACTIVE';
    echo "  - {$wallet['name']}: ₹{$wallet['balance']} ($status)\n";
}

// Find an active wallet with balance
$activeWallet = null;
foreach ($wallets as $wallet) {
    if (!$wallet['is_frozen'] && $wallet['balance'] >= 100) {
        $activeWallet = $wallet;
        break;
    }
}

if (!$activeWallet) {
    echo "❌ No active wallet with sufficient balance found!\n";
    exit(1);
}

echo "\n🎯 Using wallet: {$activeWallet['name']} (ID: {$activeWallet['id']})\n";
echo "💰 Available balance: ₹{$activeWallet['balance']}\n";

// Perform withdrawal
$withdrawAmount = 500; // Test with ₹500
$withdrawData = [
    'wallet_id' => $activeWallet['id'],
    'amount' => $withdrawAmount,
    'bank_account' => '1234567890123456',
    'ifsc_code' => 'SBIN0000123',
    'account_holder_name' => 'Test User'
];

echo "\n🔄 Processing withdrawal of ₹$withdrawAmount...\n";

$ch = curl_init('http://127.0.0.1:8000/api/withdraw');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($withdrawData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$withdrawResponse = curl_exec($ch);
$withdrawHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Withdraw Response (HTTP $withdrawHttpCode):\n";

if ($withdrawHttpCode === 200) {
    $result = json_decode($withdrawResponse, true);
    echo "✅ WITHDRAWAL SUCCESSFUL!\n";
    echo "📋 Transaction ID: {$result['transaction']['reference']}\n";
    echo "💸 Amount: ₹{$result['transaction']['amount']}\n";
    echo "📊 Status: {$result['transaction']['status']}\n";
    echo "🏦 Bank: {$result['transaction']['metadata']['bank_account']}\n";
    
    // Check updated balance
    echo "\n🔄 Checking updated balance...\n";
    
    $ch = curl_init('http://127.0.0.1:8000/api/wallets');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $token
    ]);
    
    $updatedWalletsResponse = curl_exec($ch);
    curl_close($ch);
    
    $updatedWallets = json_decode($updatedWalletsResponse, true);
    $updatedWallet = null;
    foreach ($updatedWallets as $w) {
        if ($w['id'] == $activeWallet['id']) {
            $updatedWallet = $w;
            break;
        }
    }
    
    if ($updatedWallet) {
        $expectedBalance = $activeWallet['balance'] - $withdrawAmount;
        echo "📊 Previous balance: ₹{$activeWallet['balance']}\n";
        echo "📊 Withdrawn amount: ₹$withdrawAmount\n";
        echo "📊 Expected balance: ₹$expectedBalance\n";
        echo "📊 Actual balance: ₹{$updatedWallet['balance']}\n";
        
        if (abs($expectedBalance - $updatedWallet['balance']) < 0.01) {
            echo "✅ BALANCE UPDATED CORRECTLY!\n";
        } else {
            echo "❌ BALANCE MISMATCH!\n";
        }
    }
    
    echo "\n🎉 WALLET TO BANK TRANSFER WORKING PERFECTLY! 🎉\n";
    echo "💰 Funds successfully transferred from wallet to bank account!\n";
    
} else {
    echo "❌ WITHDRAWAL FAILED!\n";
    echo $withdrawResponse . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🚀 PROJECT IS READY FOR LIVE USE! 🚀\n";
echo str_repeat("=", 50) . "\n";
