<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing withdraw functionality...\n";

// Login first
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
    echo "Response: $response\n";
    exit(1);
}

$data = json_decode($response, true);
$token = $data['token'];
echo "✅ Login successful!\n";

// Get wallets to find a valid wallet ID
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
    echo "Response: $walletsResponse\n";
    exit(1);
}

$wallets = json_decode($walletsResponse, true);
echo "✅ Retrieved " . count($wallets) . " wallets\n";

if (empty($wallets)) {
    echo "❌ No wallets found for testing\n";
    exit(1);
}

$wallet = $wallets[0];
echo "Using wallet: {$wallet['name']} (ID: {$wallet['id']}, Balance: ₹{$wallet['balance']})\n";

// Test withdraw
$withdrawData = [
    'wallet_id' => $wallet['id'],
    'amount' => 100,
    'bank_account' => '1234567890123456',
    'ifsc_code' => 'SBIN0000123',
    'account_holder_name' => 'Test User'
];

echo "\n🔄 Testing withdraw with amount: ₹{$withdrawData['amount']}\n";

$ch = curl_init('http://127.0.0.1:8000/api/withdraw');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($withdrawData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept': application/json',
    'Authorization: Bearer ' . $token
]);

$withdrawResponse = curl_exec($ch);
$withdrawHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Withdraw Response (HTTP $withdrawHttpCode):\n";
echo $withdrawResponse . "\n\n";

if ($withdrawHttpCode === 200) {
    echo "✅ Withdraw successful!\n";
    
    // Check updated wallet balance
    $ch = curl_init('http://127.0.0.1:8000/api/wallets');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept': application/json',
        'Authorization: Bearer ' . $token
    ]);
    
    $updatedWalletsResponse = curl_exec($ch);
    curl_close($ch);
    
    $updatedWallets = json_decode($updatedWalletsResponse, true);
    $updatedWallet = collect($updatedWallets)->firstWhere('id', $wallet['id']);
    
    if ($updatedWallet) {
        echo "Updated wallet balance: ₹{$updatedWallet['balance']}\n";
        echo "Previous balance: ₹{$wallet['balance']}\n";
        echo "Amount withdrawn: ₹{$withdrawData['amount']}\n";
        echo "Calculation: ₹{$wallet['balance']} - ₹{$withdrawData['amount']} = ₹" . ($wallet['balance'] - $withdrawData['amount']) . "\n";
        
        if (abs(($wallet['balance'] - $withdrawData['amount']) - $updatedWallet['balance']) < 0.01) {
            echo "✅ Balance updated correctly!\n";
        } else {
            echo "❌ Balance mismatch!\n";
        }
    }
} else {
    echo "❌ Withdraw failed!\n";
}

echo "\n🎉 Test complete!\n";
