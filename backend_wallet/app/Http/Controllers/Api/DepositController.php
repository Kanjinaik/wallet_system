<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\RetailerController;
use App\Models\CommissionTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletLimit;
use App\Events\BalanceUpdated;
use App\Events\NewTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Razorpay\Api\Api;

class DepositController extends Controller
{
    private const RETAILER_DEPOSIT_COMMISSION_PERCENT = 0.02;

    public function __construct()
    {
        $this->razorpay = new Api(
            config('services.razorpay.key'),
            config('services.razorpay.secret')
        );
    }

    public function deposit(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1|max:100000',
                'wallet_id' => 'required|exists:wallets,id',
                'payment_method' => 'required|string|in:razorpay,bank_transfer,upi,credit_card,debit_card'
            ]);

            // Get authenticated user
            $user = auth('sanctum')->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $wallet = $user->wallets()->findOrFail($request->wallet_id);

            [$transaction, $netCredit, $commissionDetails] = DB::transaction(function () use ($user, $wallet, $request) {
                $lockedWallet = Wallet::lockForUpdate()->findOrFail($wallet->id);

                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'to_wallet_id' => $lockedWallet->id,
                    'type' => 'deposit',
                    'amount' => $request->amount,
                    'reference' => 'TXN' . strtoupper(uniqid()),
                    'description' => "Deposit via {$request->payment_method}",
                    'status' => 'completed',
                    'metadata' => [
                        'payment_method' => $request->payment_method,
                        'test_mode' => true,
                        'processed_at' => now(),
                    ],
                ]);

                [$netCredit, $commissionDetails] = $this->applyRetailerDepositCommission(
                    $user,
                    $transaction,
                    $lockedWallet,
                    (float) $request->amount
                );

                return [$transaction, $netCredit, $commissionDetails];
            });

            $wallet->refresh();

            RetailerController::notify(
                $user->id,
                'wallet_updated',
                'Wallet Updated',
                'Deposit credited to your wallet.',
                [
                    'wallet_id' => $wallet->id,
                    'amount' => (float) $netCredit,
                    'original_amount' => (float) $request->amount,
                    'commission' => $commissionDetails,
                    'new_balance' => (float) $wallet->balance,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Deposit processed successfully',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'new_balance' => $wallet->balance,
                    'amount' => $request->amount,
                    'net_credited' => $netCredit,
                    'commission' => $commissionDetails,
                    'wallet_name' => $wallet->name
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Deposit failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'wallet_id' => 'required|exists:wallets,id',
        ]);

        $user = $request->user();
        $wallet = $user->wallets()->findOrFail($request->wallet_id);

        if ($wallet->is_frozen) {
            return response()->json(['message' => 'Cannot deposit to frozen wallet'], 422);
        }

        $amountInPaise = $request->amount * 100;

        try {
            // Always use test mode for development
            return response()->json([
                'order' => [
                    'id' => 'order_' . time(),
                    'amount' => $amountInPaise,
                    'currency' => 'INR',
                    'receipt' => 'wallet_deposit_' . time()
                ],
                'razorpay_key' => 'rzp_test_1DP5mmOlF5G6T',
                'amount' => $request->amount,
                'wallet_id' => $request->wallet_id,
                'test_mode' => true
            ]);
        } catch (\Exception $e) {
            \Log::error('Razorpay order creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function verifyPayment(Request $request)
    {
        // For test mode, we don't need all these validations
        if ($request->razorpay_order_id && str_starts_with($request->razorpay_order_id, 'order_')) {
            $request->merge([
                'wallet_id' => $request->wallet_id,
                'amount' => $request->amount
            ]);
        } else {
            $request->validate([
                'razorpay_order_id' => 'required|string',
                'razorpay_payment_id' => 'required|string',
                'razorpay_signature' => 'required|string',
                'wallet_id' => 'required|exists:wallets,id',
                'amount' => 'required|numeric|min:1',
            ]);
        }

        $user = $request->user();
        $wallet = $user->wallets()->findOrFail($request->wallet_id);

        try {
            // Always process as test deposit for development
            [$transaction, $netCredit, $commissionDetails] = DB::transaction(function () use ($user, $wallet, $request) {
                $lockedWallet = Wallet::lockForUpdate()->findOrFail($wallet->id);

                $transaction = $user->transactions()->create([
                    'to_wallet_id' => $lockedWallet->id,
                    'type' => 'deposit',
                    'amount' => $request->amount,
                    'reference' => Transaction::generateReference(),
                    'description' => 'Deposit via Razorpay',
                    'status' => 'completed',
                    'metadata' => ['test_mode' => true, 'razorpay_order_id' => $request->razorpay_order_id],
                ]);

                [$netCredit, $commissionDetails] = $this->applyRetailerDepositCommission(
                    $user,
                    $transaction,
                    $lockedWallet,
                    (float) $request->amount
                );

                return [$transaction, $netCredit, $commissionDetails];
            });

            $wallet->refresh();

            RetailerController::notify(
                $user->id,
                'wallet_updated',
                'Wallet Updated',
                'Deposit credited to your wallet.',
                [
                    'wallet_id' => $wallet->id,
                    'amount' => (float) $netCredit,
                    'original_amount' => (float) $request->amount,
                    'commission' => $commissionDetails,
                    'new_balance' => (float) $wallet->balance,
                ]
            );

            // Broadcast events
            event(new BalanceUpdated($wallet->id, $wallet->balance, $user->id));
            event(new NewTransaction($transaction));

            // Update limits
            WalletLimit::updateLimit($user->id, $request->amount, 'daily');
            WalletLimit::updateLimit($user->id, $request->amount, 'monthly');

            return response()->json([
                'message' => 'Deposit successful',
                'transaction' => $transaction,
                'wallet_balance' => $wallet->balance,
                'net_credited' => $netCredit,
                'commission' => $commissionDetails,
            ]);
        } catch (\Exception $e) {
            \Log::error('Deposit verification failed: ' . $e->getMessage());
            return response()->json(['message' => 'Deposit failed: ' . $e->getMessage()], 500);
        }
    }

    public function webhook(Request $request)
    {
        $webhookSecret = config('services.razorpay.webhook_secret');
        $signature = $request->header('X-Razorpay-Signature');
        
        if (!$signature || !$webhookSecret) {
            return response()->json(['message' => 'Webhook verification failed'], 400);
        }

        try {
            $payload = $request->getContent();
            $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
            
            if (!hash_equals($signature, $expectedSignature)) {
                return response()->json(['message' => 'Invalid signature'], 400);
            }

            $webhookData = json_decode($payload, true);
            
            if ($webhookData['event'] === 'payment.captured') {
                $payment = $webhookData['payload']['payment']['entity'];
                
                // Find and update the transaction
                $transaction = Transaction::where('reference', $payment['order_id'])->first();
                if ($transaction && $transaction->status === 'pending') {
                    $transaction->status = 'completed';
                    $transaction->metadata = array_merge($transaction->metadata ?? [], [
                        'razorpay_payment_id' => $payment['id'],
                        'webhook_processed' => true
                    ]);
                    $transaction->save();

                    $wallet = Wallet::lockForUpdate()->findOrFail($transaction->to_wallet_id);
                    $user = User::find($transaction->user_id);
                    if ($user) {
                        $this->applyRetailerDepositCommission(
                            $user,
                            $transaction,
                            $wallet,
                            (float) $transaction->amount
                        );
                    } else {
                        $wallet->balance += $transaction->amount;
                  $wallet->save();
                 }

                    // Broadcast events
                    event(new BalanceUpdated($wallet->id, $wallet->balance, $transaction->user_id));
                    event(new NewTransaction($transaction));
                }
            }
            
            return response()->json(['message' => 'Webhook processed successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('Webhook processing failed: ' . $e->getMessage());
            return response()->json(['message' => 'Webhook processing failed'], 500);
        }
    }

    private function applyRetailerDepositCommission(User $user, Transaction $transaction, Wallet $retailerWallet, float $amount): array
    {
        $isRetailer = in_array($user->role, ['retailer', 'user'], true);
        if (!$isRetailer) {
            $retailerWallet->balance += $amount;
            $retailerWallet->save();

            return [$amount, [
                'admin_amount' => 0,
                'master_distributor_amount' => 0,
                'super_distributor_amount' => 0,
                'distributor_amount' => 0,
                'total_commission' => 0,
                'commission_rate' => self::RETAILER_DEPOSIT_COMMISSION_PERCENT,
            ]];
        }

        $commissionRatePercent = self::RETAILER_DEPOSIT_COMMISSION_PERCENT;
        $commissionRateDecimal = $commissionRatePercent / 100;

        $adminCommission = round($amount * $commissionRateDecimal, 2);
        $masterCommission = round($amount * $commissionRateDecimal, 2);
        $superCommission = round($amount * $commissionRateDecimal, 2);
        $distributorCommission = round($amount * $commissionRateDecimal, 2);
        $totalCommission = round($adminCommission + $masterCommission + $superCommission + $distributorCommission, 2);
        $netCredit = round($amount - $totalCommission, 2);

        $distributorUser = null;
        $superDistributorUser = null;
        $masterDistributorUser = null;
        if ($user->distributor_id) {
            $distributorUser = User::where('id', $user->distributor_id)
                ->where('role', 'distributor')
                ->first();
        }
        if ($distributorUser && $distributorUser->distributor_id) {
            $superDistributorUser = User::where('id', $distributorUser->distributor_id)
                ->where('role', 'super_distributor')
                ->first();
        }
        if ($superDistributorUser && $superDistributorUser->distributor_id) {
            $masterDistributorUser = User::where('id', $superDistributorUser->distributor_id)
                ->where('role', 'master_distributor')
                ->first();
        }
        $adminUser = User::where('role', 'admin')->first();

        $creditedAdmin = $this->creditCommissionWallet(
            recipient: $adminUser,
            preferredWalletType: 'main',
            fallbackWalletType: 'sub',
            commissionType: 'admin',
            amount: $adminCommission,
            percentage: $commissionRatePercent,
            transaction: $transaction,
            description: "Admin commission from {$user->name}'s deposit"
        );

        $creditedMaster = $this->creditCommissionWallet(
            recipient: $masterDistributorUser,
            preferredWalletType: 'sub',
            fallbackWalletType: 'main',
            commissionType: 'master_distributor',
            amount: $masterCommission,
            percentage: $commissionRatePercent,
            transaction: $transaction,
            description: "Master distributor commission from {$user->name}'s deposit"
        );

        $creditedSuper = $this->creditCommissionWallet(
            recipient: $superDistributorUser,
            preferredWalletType: 'sub',
            fallbackWalletType: 'main',
            commissionType: 'super_distributor',
            amount: $superCommission,
            percentage: $commissionRatePercent,
            transaction: $transaction,
            description: "Super distributor commission from {$user->name}'s deposit"
        );

        $creditedDistributor = $this->creditCommissionWallet(
            recipient: $distributorUser,
            preferredWalletType: 'sub',
            fallbackWalletType: 'main',
            commissionType: 'distributor',
            amount: $distributorCommission,
            percentage: $commissionRatePercent,
            transaction: $transaction,
            description: "Distributor commission from {$user->name}'s deposit"
        );

        $effectiveTotalCommission = round($creditedAdmin + $creditedMaster + $creditedSuper + $creditedDistributor, 2);
        $effectiveNetCredit = round($amount - $effectiveTotalCommission, 2);

        $retailerWallet->balance += $effectiveNetCredit;
        $retailerWallet->save();

        return [$effectiveNetCredit, [
            'admin_amount' => $creditedAdmin,
            'master_distributor_amount' => $creditedMaster,
            'super_distributor_amount' => $creditedSuper,
            'distributor_amount' => $creditedDistributor,
            'total_commission' => $effectiveTotalCommission,
            'commission_rate' => $commissionRatePercent,
        ]];
    }

    private function creditCommissionWallet(
        ?User $recipient,
        string $preferredWalletType,
        string $fallbackWalletType,
        string $commissionType,
        float $amount,
        float $percentage,
        Transaction $transaction,
        string $description
    ): float {
        if (!$recipient || $amount <= 0) {
            return 0;
        }

        $wallet = Wallet::lockForUpdate()
            ->where('user_id', $recipient->id)
            ->where('type', $preferredWalletType)
            ->first();

        if (!$wallet) {
            $wallet = Wallet::lockForUpdate()
                ->where('user_id', $recipient->id)
                ->where('type', $fallbackWalletType)
                ->first();
        }

        if (!$wallet) {
            return 0;
        }

        CommissionTransaction::create([
            'original_transaction_id' => $transaction->id,
            'user_id' => $recipient->id,
            'wallet_id' => $wallet->id,
            'commission_type' => $commissionType,
            'original_amount' => $transaction->amount,
            'commission_percentage' => $percentage,
            'commission_amount' => $amount,
            'reference' => CommissionTransaction::generateReference(),
            'description' => $description,
        ]);

        $wallet->balance += $amount;
        $wallet->save();

        RetailerController::notify(
            $recipient->id,
            'commission_credited',
            'Commission Credited',
            'Commission credited to your wallet.',
            [
                'amount' => $amount,
                'original_transaction_id' => $transaction->id,
            ]
        );

        return $amount;
    }
}
