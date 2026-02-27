<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Simple Authentication Test ===\n\n";

// Check admin user
$admin = App\Models\User::where('email', 'admin@example.com')->first();
if ($admin) {
    echo "✓ Admin user found: {$admin->name}\n";
    echo "  Role: {$admin->role}\n";
    echo "  ID: {$admin->id}\n";
} else {
    echo "✗ Admin user not found\n";
    exit(1);
}

// Test login through API
echo "\nTesting API login...\n";

$loginData = [
    'email' => 'admin@example.com',
    'password' => 'password'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: {$httpCode}\n";
echo "Response: {$response}\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['token'])) {
        echo "\n✓ Login successful!\n";
        echo "Token: {$data['token']}\n\n";
        
        // Test admin dashboard with token
        echo "Testing admin dashboard access...\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/admin/dashboard');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $data['token'],
            'Accept: application/json'
        ]);
        
        $dashboardResponse = curl_exec($ch);
        $dashboardCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "Dashboard HTTP Status: {$dashboardCode}\n";
        echo "Dashboard Response: {$dashboardResponse}\n";
    }
}
