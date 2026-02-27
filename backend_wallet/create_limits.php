<?php

require_once __DIR__.'/vendor/autoload.php';

use App\Models\User;

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

$user = User::where('email', 'kanjinaik1234@gmail.com')->first();

if ($user) {
    // Check if limits already exist
    $existingLimits = $user->walletLimits()->count();
    echo "Existing limits: $existingLimits\n";
    
    if ($existingLimits === 0) {
        $user->walletLimits()->createMany([
            ['limit_type' => 'daily', 'max_amount' => 10000, 'transaction_count' => 0, 'total_amount' => 0, 'reset_date' => now()->toDateString()],
            ['limit_type' => 'monthly', 'max_amount' => 100000, 'transaction_count' => 0, 'total_amount' => 0, 'reset_date' => now()->startOfMonth()->toDateString()],
            ['limit_type' => 'per_transaction', 'max_amount' => 50000, 'transaction_count' => 0, 'total_amount' => 0, 'reset_date' => null]
        ]);
        echo "Wallet limits created for user\n";
    } else {
        echo "User already has wallet limits\n";
    }
} else {
    echo "User not found\n";
}

echo "Script completed\n";
