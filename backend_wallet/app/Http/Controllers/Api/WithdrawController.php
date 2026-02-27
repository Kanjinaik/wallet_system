<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\RetailerController;
use App\Models\AdminSetting;
use App\Models\CommissionConfig;
use App\Models\Transaction;
use App\Models\CommissionTransaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WithdrawRequest;
use App\Models\WalletLimit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WithdrawController extends Controller
{
    public function requestOtp(Request $request)
    {
        $request->validate([
            'wallet_id' => 'required|exists:wallets,id',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $wallet = $user->wallets()->findOrFail($request->wallet_id);
        if ((float) $wallet->balance < (float) $request->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance',
            ], 422);
        }

        $otp = (string) random_int(100000, 999999);
        $user->withdraw_otp_code = $otp;
        $user->withdraw_otp_expires_at = now()->addMinutes(10);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'OTP generated successfully',
            // Exposed for local development/testing.
            'otp' => $otp,
            'expires_at' => optional($user->withdraw_otp_expires_at)->toDateTimeString(),
        ]);
    }

    public function withdraw(Request $request)
    {
        try {
            $request->validate([
                'wallet_id' => 'required|exists:wallets,id',
                'amount' => 'required|numeric|min:0.01',
                'bank_account' => 'required|string|max:20',
                'ifsc_code' => 'required|string|max:15',
                'account_holder_name' => 'required|string|max:255',
                'otp_code' => 'nullable|string|size:6',
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

            // OTP is optional for withdrawal. Existing generated OTP should not block a valid request.
            // Users may still generate OTP for their own flow, but withdraw does not enforce it.

            $minAmount = (float) AdminSetting::getValue('withdraw_min_amount', 100);
            $maxAmount = (float) AdminSetting::getValue('withdraw_max_per_tx', 50000);

            if ($request->amount < $minAmount) {
                return response()->json(['message' => "Minimum withdrawal amount is {$minAmount}"], 422);
            }
            if ($maxAmount > 0 && $request->amount > $maxAmount) {
                return response()->json(['message' => "Maximum withdrawal per transaction is {$maxAmount}"], 422);
            }

            // Allow withdrawals from any wallet (frozen or unfrozen)
            // Only check balance and limits

        if ($wallet->balance < $request->amount) {
            return response()->json(['message' => 'Insufficient balance'], 422);
        }

        // Check limits
        if (!WalletLimit::checkLimit($user->id, $request->amount, 'per_transaction')) {
            return response()->json(['message' => 'Per-transaction limit exceeded'], 422);
        }
        if (!WalletLimit::checkLimit($user->id, $request->amount, 'daily')) {
            return response()->json(['message' => 'Daily limit exceeded'], 422);
        }
        if (!WalletLimit::checkLimit($user->id, $request->amount, 'monthly')) {
            return response()->json(['message' => 'Monthly limit exceeded'], 422);
        }

        return DB::transaction(function () use ($request, $wallet, $user) {
            $highValueEkycThreshold = 100000.00;
            $requiresEkycApproval = (float) $request->amount >= $highValueEkycThreshold;

            // Calculate flat withdrawal fee based on amount
            $withdrawalAmount = (float) $request->amount;
            $feeAmount = 0.0;
            if ($withdrawalAmount >= 5000.0 && $withdrawalAmount <= 10000.0) {
                $feeAmount = 5.0;
            } elseif ($withdrawalAmount > 10000.0) {
                $feeAmount = 10.0;
            }
            $netAmount = $withdrawalAmount - $feeAmount;

            $withdrawRequest = WithdrawRequest::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'amount' => $request->amount,
                'net_amount' => (float) $request->amount,
                'status' => $requiresEkycApproval ? 'pending' : 'approved',
                'metadata' => [
                    'bank_account' => $request->bank_account,
                    'ifsc_code' => $request->ifsc_code,
                    'account_holder_name' => $request->account_holder_name,
                    'requires_ekyc_approval' => $requiresEkycApproval,
                    'ekyc_threshold' => $highValueEkycThreshold,
                    'withdrawal_fee' => $feeAmount,
                    'net_payout_to_customer' => $netAmount,
                ],
            ]);

            if ($requiresEkycApproval) {
                    RetailerController::notify(
                        $user->id,
                        'withdraw_requested',
                        'Withdraw Requested',
                    'Your withdrawal request is submitted and pending eKYC approval.',
                        ['withdraw_request_id' => $withdrawRequest->id, 'amount' => (float) $request->amount]
                    );

                    $user->withdraw_otp_code = null;
                    $user->withdraw_otp_expires_at = null;
                    $user->save();

                    return response()->json([
                        'success' => true,
                        'message' => 'Withdrawal request submitted and pending eKYC approval.',
                        'withdraw_request_id' => $withdrawRequest->id,
                        'withdrawal_amount' => (float) $request->amount,
                        'debited_amount' => 0,
                        'original_amount' => $request->amount,
                    ]);
                }

                $processed = $this->processApprovedRequest($withdrawRequest);

            RetailerController::notify(
                $user->id,
                    'wallet_updated',
                    'Wallet Updated',
                    'Your wallet balance was updated after withdrawal.',
                    [
                        'wallet_id' => $processed['wallet']->id,
                        'new_balance' => (float) $processed['wallet']->balance,
                    ]
            );

            $user->withdraw_otp_code = null;
            $user->withdraw_otp_expires_at = null;
            $user->save();

            return response()->json([
                'success' => true,
                    'message' => 'Withdrawal successful',
                    'transaction_id' => $processed['transaction']->id,
                'withdraw_request_id' => $withdrawRequest->id,
                'withdrawal_amount' => (float) $request->amount,
                    'debited_amount' => (float) $request->amount,
                'original_amount' => $request->amount,
            ]);
        });
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function calculateCommission(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:100',
                'user_role' => 'required|in:admin,master_distributor,super_distributor,distributor,retailer',
            ]);

            $commissionCalculation = [
                'original_amount' => (float) $request->amount,
                'admin_commission_percentage' => 0,
                'distributor_commission_percentage' => 0,
                'admin_commission_amount' => 0,
                'distributor_commission_amount' => 0,
                'total_commission' => 0,
                'net_amount' => (float) $request->amount,
            ];

            return response()->json([
                'success' => true,
                'commission_details' => $commissionCalculation,
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
                'message' => 'Commission calculation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function withdrawalHistory(Request $request)
    {
        $withdrawals = $request->user()->transactions()
            ->where('type', 'withdraw')
            ->with(['fromWallet'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($withdrawals);
    }

    private function processApprovedRequest(WithdrawRequest $withdrawRequest): array
    {
        $user = $withdrawRequest->user()->firstOrFail();
        $wallet = $withdrawRequest->wallet()->lockForUpdate()->firstOrFail();

        if ($wallet->balance < $withdrawRequest->amount) {
            throw new \RuntimeException('Insufficient balance during withdrawal processing.');
        }

        // Get fee and net payout from metadata (calculated at withdrawal request time)
        if (isset($withdrawRequest->metadata['withdrawal_fee'])) {
            $feeAmount = (float) $withdrawRequest->metadata['withdrawal_fee'];
        } else {
            // Fallback calculation if fee not in metadata
            $withdrawalAmount = (float) $withdrawRequest->amount;
            $feeAmount = 0.0;
            if ($withdrawalAmount >= 5000.0 && $withdrawalAmount <= 10000.0) {
                $feeAmount = 5.0;
            } elseif ($withdrawalAmount > 10000.0) {
                $feeAmount = 10.0;
            }
        }
        $netPayoutAmount = (float) $withdrawRequest->amount - $feeAmount;

        $transaction = $user->transactions()->create([
            'from_wallet_id' => $wallet->id,
            'type' => 'withdraw',
            'amount' => $withdrawRequest->amount,
            'reference' => Transaction::generateReference(),
            'description' => 'Bank withdrawal',
            'status' => 'completed',
            'metadata' => [
                'withdraw_request_id' => $withdrawRequest->id,
                'bank_account' => $withdrawRequest->metadata['bank_account'] ?? null,
                'ifsc_code' => $withdrawRequest->metadata['ifsc_code'] ?? null,
                'account_holder_name' => $withdrawRequest->metadata['account_holder_name'] ?? null,
                'processing_time' => '24-48 hours',
                'original_amount' => $withdrawRequest->amount,
                'debited_amount' => $withdrawRequest->amount,
                'withdrawal_fee' => $feeAmount,
                'net_payout_amount' => $netPayoutAmount,
            ]
        ]);

        // Deduct full amount from retailer wallet
        $wallet->balance -= $withdrawRequest->amount;
        $wallet->save();

        // Add fee directly to admin main wallet (profit holding - NOT commission transaction)
        if ($feeAmount > 0) {
            try {
                $adminUser = User::where('role', 'admin')->lockForUpdate()->first();
                if ($adminUser) {
                    $adminMainWallet = Wallet::lockForUpdate()
                        ->where('user_id', $adminUser->id)
                        ->where('type', 'main')
                        ->first();
                    
                    if (!$adminMainWallet) {
                        $adminMainWallet = Wallet::lockForUpdate()
                            ->where('user_id', $adminUser->id)
                            ->where('type', 'sub')
                            ->first();
                    }
                    
                    if ($adminMainWallet) {
                        $adminMainWallet->balance = (float) $adminMainWallet->balance + (float) $feeAmount;
                        $adminMainWallet->save();
                    }
                }
            } catch (\Exception $e) {
                // Log error but don't fail the withdrawal
                \Log::error('Failed to credit admin fee: ' . $e->getMessage());
            }
        }

        WalletLimit::updateLimit($user->id, (float) $withdrawRequest->amount, 'daily');
        WalletLimit::updateLimit($user->id, (float) $withdrawRequest->amount, 'monthly');

        $withdrawRequest->status = 'processed';
        $withdrawRequest->reviewed_at = now();
        $withdrawRequest->save();

        RetailerController::notify(
            $user->id,
            'withdraw_processed',
            'Withdraw Approved',
            'Your withdrawal has been approved and processed successfully.',
            [
                'withdraw_request_id' => $withdrawRequest->id,
                'transaction_id' => $transaction->id,
                'amount' => (float) $withdrawRequest->amount,
            ]
        );
        RetailerController::notify(
            $user->id,
            'wallet_updated',
            'Wallet Updated',
            'Your wallet balance was updated after withdrawal.',
            [
                'wallet_id' => $wallet->id,
                'new_balance' => (float) $wallet->balance,
            ]
        );

        return [
            'transaction' => $transaction,
            'wallet' => $wallet,
        ];
    }
}
