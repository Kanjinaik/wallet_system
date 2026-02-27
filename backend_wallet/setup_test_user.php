<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletLimit;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Setting up test user and data...\n";

// Create or update test user
$user = User::where('email', 'test@example.com')->first();
if (!$user) {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
        'phone' => '1234567890',
        'role' => 'user',
        'is_active' => true
    ]);
    echo "✅ Created test user: test@example.com\n";
} else {
    echo "✅ Test user already exists\n";
}

// Create main wallet if not exists
$mainWallet = $user->wallets()->where('type', 'main')->first();
if (!$mainWallet) {
    $mainWallet = $user->wallets()->create([
        'name' => 'Main Wallet',
        'type' => 'main',
        'balance' => 5000.00, // Give some balance for testing
    ]);
    echo "✅ Created main wallet with balance: ₹5000.00\n";
} else {
    echo "✅ Main wallet already exists with balance: ₹" . $mainWallet->balance . "\n";
}

// Create a sub wallet if not exists
$subWallet = $user->wallets()->where('type', 'sub')->first();
if (!$subWallet) {
    $subWallet = $user->wallets()->create([
        'name' => 'Savings Wallet',
        'type' => 'sub',
        'balance' => 2500.00, // Give some balance for testing
    ]);
    echo "✅ Created sub wallet with balance: ₹2500.00\n";
} else {
    echo "✅ Sub wallet already exists with balance: ₹" . $subWallet->balance . "\n";
}

// Set up wallet limits if not exists
$limits = $user->walletLimits()->count();
if ($limits === 0) {
    $user->walletLimits()->createMany([
        [
            'limit_type' => 'daily',
            'max_amount' => 10000,
            'reset_date' => now()->toDateString(),
        ],
        [
            'limit_type' => 'monthly',
            'max_amount' => 100000,
            'reset_date' => now()->startOfMonth()->toDateString(),
        ],
        [
            'limit_type' => 'per_transaction',
            'max_amount' => 50000,
        ],
    ]);
    echo "✅ Created wallet limits\n";
} else {
    echo "✅ Wallet limits already exist\n";
}

// Test authentication
echo "\n🔐 Testing authentication...\n";

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
    if (isset($data['token'])) {
        echo "✅ Login successful!\n";
        echo "Token: " . substr($data['token'], 0, 20) . "...\n";
        
        // Test wallets endpoint
        $ch = curl_init('http://127.0.0.1:8000/api/wallets');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $data['token']
        ]);
        
        $walletsResponse = curl_exec($ch);
        $walletsHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($walletsHttpCode === 200) {
            $wallets = json_decode($walletsResponse, true);
            echo "✅ Wallets endpoint working! Found " . count($wallets) . " wallets\n";
        } else {
            echo "❌ Wallets endpoint failed: HTTP $walletsHttpCode\n";
        }
    }
} else {
    echo "❌ Login failed: HTTP $httpCode\n";
    echo "Response: $response\n";
}

echo "\n🎉 Setup complete! Use these credentials:\n";
echo "Email: test@example.com\n";
echo "Password: password123\n";
echo "Main Wallet Balance: ₹5000.00\n";
echo "Sub Wallet Balance: ₹2500.00\n";
