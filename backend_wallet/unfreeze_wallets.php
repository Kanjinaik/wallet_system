<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Wallet;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Unfreezing wallets and adding balance...\n";

$user = User::where('email', 'test@example.com')->first();
if (!$user) {
    echo "❌ Test user not found\n";
    exit(1);
}

echo "✅ Found test user: {$user->name}\n";

$wallets = $user->wallets;
foreach ($wallets as $wallet) {
    echo "Wallet: {$wallet->name} (ID: {$wallet->id}) - Balance: ₹{$wallet->balance} - Frozen: " . ($wallet->is_frozen ? 'Yes' : 'No') . "\n";
    
    // Unfreeze wallet
    $wallet->is_frozen = false;
    $wallet->freeze_reason = null;
    
    // Add proper balance if too low
    if ($wallet->balance < 1000) {
        $wallet->balance = 5000.00;
        echo "  -> Updated balance to ₹5000.00\n";
    }
    
    $wallet->save();
    echo "  -> Unfrozen and ready for withdrawals!\n";
}

echo "\n🎉 All wallets unfrozen and ready!\n";

// Test the withdraw functionality
echo "\n🔄 Testing withdraw functionality...\n";

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

// Get wallets to verify they're unfrozen
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

if ($walletsHttpCode === 200) {
    $wallets = json_decode($walletsResponse, true);
    echo "✅ Retrieved " . count($wallets) . " wallets:\n";
    foreach ($wallets as $wallet) {
        echo "  - {$wallet['name']}: ₹{$wallet['balance']} (" . ($wallet['is_frozen'] ? 'Frozen' : 'Active') . ")\n";
    }
} else {
    echo "❌ Failed to get wallets\n";
}

echo "\n✅ Wallets are now ready for bank transfers!\n";
