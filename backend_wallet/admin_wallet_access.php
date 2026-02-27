<?php

echo "=== Admin Wallet Access Helper ===\n\n";

// Get admin token
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'admin@example.com',
    'password' => 'password'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo "❌ Login failed! HTTP Code: {$httpCode}\n";
    echo "Response: {$response}\n";
    exit(1);
}

$data = json_decode($response, true);
$token = $data['token'];

echo "✅ Admin login successful!\n";
echo "🔑 Token: {$token}\n\n";

// Test different endpoints
$endpoints = [
    'My Wallets' => '/api/wallets',
    'All Users Wallets (Admin)' => '/api/admin/wallets',
    'Admin Dashboard' => '/api/admin/dashboard',
    'All Users' => '/api/admin/users',
    'Commission Transactions' => '/api/admin/transactions'
];

$authHeaders = [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
];

foreach ($endpoints as $name => $endpoint) {
    echo "📊 Testing: {$name}\n";
    echo "🔗 URL: http://127.0.0.1:8000{$endpoint}\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000' . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $authHeaders);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📈 Status: {$httpCode}\n";
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (is_array($data)) {
            echo "📋 Records: " . count($data) . "\n";
        } else {
            echo "📋 Response: " . json_encode($data) . "\n";
        }
    } else {
        echo "❌ Error: {$response}\n";
    }
    
    echo str_repeat("-", 50) . "\n\n";
}

echo "💡 Use this token in your browser or API client:\n";
echo "Authorization: Bearer {$token}\n\n";

echo "🌐 Browser Access:\n";
echo "1. Open browser developer tools\n";
echo "2. Go to http://127.0.0.1:8000/api/wallets\n";
echo "3. Add header: Authorization: Bearer {$token}\n";
echo "4. Add header: Accept: application/json\n\n";

echo "=== Access Complete ===\n";
