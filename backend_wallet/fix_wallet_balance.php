<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Wallet;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking and fixing wallet balances...\n";

$user = User::where('email', 'test@example.com')->first();
if (!$user) {
    echo "❌ Test user not found\n";
    exit(1);
}

echo "✅ Found test user: {$user->name}\n";

$wallets = $user->wallets;
foreach ($wallets as $wallet) {
    echo "Wallet: {$wallet->name} (ID: {$wallet->id}) - Balance: ₹{$wallet->balance}\n";
}

// Update main wallet to have sufficient balance
$mainWallet = $wallets->where('type', 'main')->first();
if ($mainWallet) {
    $mainWallet->balance = 5000.00;
    $mainWallet->save();
    echo "✅ Updated main wallet balance to ₹5000.00\n";
}

// Update sub wallet to have some balance
$subWallet = $wallets->where('type', 'sub')->first();
if ($subWallet) {
    $subWallet->balance = 2500.00;
    $subWallet->save();
    echo "✅ Updated sub wallet balance to ₹2500.00\n";
}

echo "\n🎉 Wallet balances fixed!\n";

// Test withdraw again
echo "\n🔄 Testing withdraw again...\n";

// Login
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
    echo "❌ Login failed\n";
    exit(1);
}

$data = json_decode($response, true);
$token = $data['token'];

// Test withdraw
$withdrawData = [
    'wallet_id' => $mainWallet->id,
    'amount' => 100,
    'bank_account' => '1234567890123456',
    'ifsc_code' => 'SBIN0000123',
    'account_holder_name' => 'Test User'
];

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
echo $withdrawResponse . "\n";

if ($withdrawHttpCode === 200) {
    echo "✅ Withdraw successful!\n";
} else {
    echo "❌ Withdraw still failed\n";
}
