<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test login endpoint
echo "Testing login endpoint...\n";

// Create a test user if not exists
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
    echo "Created test user: test@example.com\n";
} else {
    echo "Test user already exists\n";
    echo "User is active: " . ($user->is_active ? 'Yes' : 'No') . "\n";
    
    // Test password verification
    if (\Illuminate\Support\Facades\Hash::check('password123', $user->password)) {
        echo "Password verification: PASSED\n";
    } else {
        echo "Password verification: FAILED - updating password\n";
        $user->password = bcrypt('password123');
        $user->save();
        echo "Password updated\n";
    }
}

// Test login with curl
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

echo "Login Response (HTTP $httpCode):\n";
echo $response . "\n\n";

// Test wallets endpoint with the token
$data = json_decode($response, true);
if (isset($data['token'])) {
    echo "Testing wallets endpoint with token...\n";
    
    $ch = curl_init('http://127.0.0.1:8000/api/wallets');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $data['token']
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Wallets Response (HTTP $httpCode):\n";
    echo $response . "\n";
    
    // Create a main wallet if none exists
    $wallets = json_decode($response, true);
    if (empty($wallets)) {
        echo "Creating main wallet for user...\n";
        
        $ch = curl_init('http://127.0.0.1:8000/api/wallets');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'name' => 'Main Wallet',
            'type' => 'sub'
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $data['token']
        ]);
        
        $createResponse = curl_exec($ch);
        $createHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "Create Wallet Response (HTTP $createHttpCode):\n";
        echo $createResponse . "\n";
        
        // Test wallets again
        echo "Testing wallets endpoint again...\n";
        $ch = curl_init('http://127.0.0.1:8000/api/wallets');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $data['token']
        ]);
        
        $finalResponse = curl_exec($ch);
        $finalHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "Final Wallets Response (HTTP $finalHttpCode):\n";
        echo $finalResponse . "\n";
    }
} else {
    echo "No token received in login response\n";
}
