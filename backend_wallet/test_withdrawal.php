<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\CommissionConfig;
use App\Models\CommissionTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Withdrawal with Commission ===\n\n";

// Get test users
$retailer = User::where('email', 'retailer@example.com')->first();
$admin = User::where('email', 'admin@example.com')->first();
$distributor = User::where('email', 'distributor@example.com')->first();

if (!$retailer || !$admin || !$distributor) {
    echo "✗ Test users not found\n";
    exit(1);
}

echo "Initial balances:\n";
$retailerWallet = $retailer->wallets()->first();
$adminWallet = $admin->wallets()->where('type', 'main')->first();
$distributorWallet = $distributor->wallets()->where('type', 'sub')->first();

echo "  Retailer wallet: ₹{$retailerWallet->balance}\n";
echo "  Admin wallet: ₹{$adminWallet->balance}\n";
echo "  Distributor wallet: ₹{$distributorWallet->balance}\n";
echo "\n";

// Simulate withdrawal of ₹100
$withdrawalAmount = 100.00;
echo "Simulating withdrawal of ₹{$withdrawalAmount} from retailer...\n";

try {
    DB::beginTransaction();
    
    // Get commission configuration
    $commissionConfig = CommissionConfig::getActiveConfig($retailer->role);
    
    if (!$commissionConfig) {
        echo "✗ No commission config found for retailer\n";
        DB::rollBack();
        exit(1);
    }
    
    // Calculate commission
    $commissionCalculation = $commissionConfig->calculateCommission($withdrawalAmount);
    $finalWithdrawalAmount = $commissionCalculation['net_amount'];
    
    echo "Commission breakdown:\n";
    echo "  Original amount: ₹{$commissionCalculation['original_amount']}\n";
    echo "  Admin commission: ₹{$commissionCalculation['admin_commission_amount']}\n";
    echo "  Distributor commission: ₹{$commissionCalculation['distributor_commission_amount']}\n";
    echo "  Net withdrawal: ₹{$finalWithdrawalAmount}\n";
    echo "\n";
    
    // Create withdrawal transaction
    $transaction = Transaction::create([
        'user_id' => $retailer->id,
        'from_wallet_id' => $retailerWallet->id,
        'type' => 'withdraw',
        'amount' => $finalWithdrawalAmount,
        'reference' => 'TEST-' . uniqid(),
        'description' => 'Test withdrawal (after commission)',
        'status' => 'completed',
        'metadata' => [
            'original_amount' => $withdrawalAmount,
            'commission_details' => $commissionCalculation,
        ]
    ]);
    
    // Update retailer wallet balance
    $retailerWallet->balance -= $finalWithdrawalAmount;
    $retailerWallet->save();
    
    // Create commission transactions
    $commissionTransactions = CommissionTransaction::createCommissionTransactions($transaction, $commissionCalculation);
    
    DB::commit();
    
    echo "✓ Withdrawal processed successfully!\n";
    echo "  Transaction ID: {$transaction->id}\n";
    echo "  Commission transactions created: " . count($commissionTransactions) . "\n";
    
} catch (Exception $e) {
    DB::rollBack();
    echo "✗ Withdrawal failed: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nFinal balances:\n";
$retailerWallet->refresh();
$adminWallet->refresh();
$distributorWallet->refresh();

echo "  Retailer wallet: ₹{$retailerWallet->balance} (reduced by ₹{$finalWithdrawalAmount})\n";
echo "  Admin wallet: ₹{$adminWallet->balance} (increased by ₹{$commissionCalculation['admin_commission_amount']})\n";
echo "  Distributor wallet: ₹{$distributorWallet->balance} (increased by ₹{$commissionCalculation['distributor_commission_amount']})\n";

echo "\nVerification:\n";
$expectedRetailerBalance = 10000.00 - $finalWithdrawalAmount;
$expectedAdminBalance = 50000.00 + $commissionCalculation['admin_commission_amount'];
$expectedDistributorBalance = 20000.00 + $commissionCalculation['distributor_commission_amount'];

echo "  Retailer balance correct: " . ($retailerWallet->balance == $expectedRetailerBalance ? '✓' : '✗') . "\n";
echo "  Admin balance correct: " . ($adminWallet->balance == $expectedAdminBalance ? '✓' : '✗') . "\n";
echo "  Distributor balance correct: " . ($distributorWallet->balance == $expectedDistributorBalance ? '✓' : '✗') . "\n";

echo "\n=== Withdrawal Test Complete ===\n";
