<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔍 QUICK AUTH TEST\n";
echo "==================\n\n";

try {
    // Test if user exists and can create token
    $user = \App\Models\User::first();
    if ($user) {
        echo "Found user: {$user->email}\n";
        
        // Create token
        $token = $user->createToken('test')->plainTextToken;
        echo "Created token: " . substr($token, 0, 30) . "...\n";
        
        // Test authentication
        $testUser = \Illuminate\Support\Facades\Auth::guard('sanctum')->user();
        echo "Current auth user: " . ($testUser ? $testUser->email : 'None') . "\n";
        
        echo "\n✅ Sanctum is working!\n";
    } else {
        echo "❌ No users found in database\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

?>
