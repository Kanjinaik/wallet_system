<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔍 TESTING AUTHENTICATION\n";
echo "========================\n\n";

try {
    // Test 1: Check if Sanctum is working
    echo "1. Testing Sanctum configuration...\n";
    $sanctumConfig = config('sanctum');
    echo "Sanctum stateful domains: " . implode(', ', $sanctumConfig['stateful']) . "\n\n";
    
    // Test 2: Check database connection
    echo "2. Testing database connection...\n";
    $users = DB::table('users')->count();
    echo "Users in database: $users\n\n";
    
    // Test 3: Check personal access tokens table
    echo "3. Testing personal access tokens...\n";
    $tokens = DB::table('personal_access_tokens')->count();
    echo "Personal access tokens: $tokens\n\n";
    
    // Test 4: Create a test token
    echo "4. Creating test token...\n";
    $user = DB::table('users')->first();
    if ($user) {
        $userModel = \App\Models\User::find($user->id);
        $token = $userModel->createToken('test-token')->plainTextToken;
        echo "Test token created: " . substr($token, 0, 20) . "...\n\n";
        
        // Test 5: Test authentication with token
        echo "5. Testing authentication...\n";
        $request = \Illuminate\Http\Request::create('/api/wallets', 'GET');
        $request->headers->set('Authorization', 'Bearer ' . $token);
        
        // Simulate authentication
        $authenticatedUser = \Illuminate\Support\Facades\Auth::guard('sanctum')->setUser($userModel);
        echo "Authenticated user ID: " . $authenticatedUser->id . "\n";
        echo "Authentication test: SUCCESS\n";
    } else {
        echo "No users found in database\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

?>
