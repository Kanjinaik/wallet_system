<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking current wallet status...\n";

$user = User::where('email', 'test@example.com')->first();
if (!$user) {
    echo "❌ Test user not found\n";
    exit(1);
}

$wallets = $user->wallets;
echo "Found " . $wallets->count() . " wallets:\n";

foreach ($wallets as $wallet) {
    echo "ID: {$wallet->id} - Name: {$wallet->name} - Balance: ₹{$wallet->balance} - Frozen: " . ($wallet->is_frozen ? 'YES' : 'NO') . "\n";
}

// Test API response
echo "\n🔄 Testing API response...\n";

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

if ($httpCode === 200) {
    $data = json_decode($response, true);
    $token = $data['token'];
    
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
        $apiWallets = json_decode($walletsResponse, true);
        echo "✅ API Response - " . count($apiWallets) . " wallets:\n";
        foreach ($apiWallets as $wallet) {
            echo "  ID: {$wallet['id']} - Name: {$wallet['name']} - Balance: ₹{$wallet['balance']} - Frozen: " . ($wallet['is_frozen'] ? 'YES' : 'NO') . "\n";
        }
    } else {
        echo "❌ API failed: HTTP $walletsHttpCode\n";
    }
} else {
    echo "❌ Login failed: HTTP $httpCode\n";
}

echo "\n✅ Wallet check complete!\n";
