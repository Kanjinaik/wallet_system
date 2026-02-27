<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Getting Admin Authentication Token ===\n\n";

// Test admin login
$admin = App\Models\User::where('email', 'admin@example.com')->first();
if (!$admin) {
    echo "Admin user not found!\n";
    exit(1);
}

echo "Found admin user: {$admin->name}\n";
echo "Role: {$admin->role}\n";
echo "Active: " . ($admin->is_active ? 'Yes' : 'No') . "\n\n";

// Create a test token for the admin
$token = $admin->createToken('admin-test-token')->plainTextToken;

echo "Admin Token: {$token}\n\n";
echo "You can now use this token to access admin endpoints:\n";
echo "curl -H 'Authorization: Bearer {$token}' http://localhost:8000/api/admin/dashboard\n\n";

// Test the admin dashboard
echo "Testing admin dashboard access...\n";
$headers = [
    'Authorization' => 'Bearer ' . $token,
    'Accept' => 'application/json'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/admin/dashboard');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: {$httpCode}\n";
echo "Response: {$response}\n";
