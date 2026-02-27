<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use Illuminate\Http\Request;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get first user and create token
$user = User::first();
$token = $user->createToken('test-token')->plainTextToken;

echo "User: " . $user->email . "\n";
echo "Token: " . $token . "\n";

// Test the API with the token
$client = new GuzzleHttp\Client();
$response = $client->get('http://127.0.0.1:8000/api/wallets', [
    'headers' => [
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json'
    ]
]);

echo "Response: " . $response->getBody() . "\n";
