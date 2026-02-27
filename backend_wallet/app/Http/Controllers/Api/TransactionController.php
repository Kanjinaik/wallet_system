<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\WalletLimit;
use App\Events\BalanceUpdated;
use App\Events\NewTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'type' => 'nullable|in:deposit,withdraw,transfer,receive',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $type = $request->query('type');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $transactions = $request->user()->transactions()
            ->with(['fromWallet', 'toWallet'])
            ->when($type, fn($q) => $q->where('type', $type))
            ->when($startDate, fn($q) => $q->whereDate('created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('created_at', '<=', $endDate))
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:deposit,withdraw,transfer,receive',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'from_wallet_id' => 'required_if:type,transfer|exists:wallets,id',
            'to_wallet_id' => 'required_if:type,transfer,receive|exists:wallets,id',
        ]);

        return DB::transaction(function () use ($request) {
            $user = $request->user();
            $reference = Transaction::generateReference();

            // Check limits for outgoing transactions
            if (in_array($request->type, ['withdraw', 'transfer'])) {
                if (!WalletLimit::checkLimit($user->id, $request->amount, 'per_transaction')) {
                    return response()->json(['message' => 'Per-transaction limit exceeded'], 422);
                }
                if (!WalletLimit::checkLimit($user->id, $request->amount, 'daily')) {
                    return response()->json(['message' => 'Daily limit exceeded'], 422);
                }
                if (!WalletLimit::checkLimit($user->id, $request->amount, 'monthly')) {
                    return response()->json(['message' => 'Monthly limit exceeded'], 422);
                }
            }

            $transaction = $user->transactions()->create([
                'from_wallet_id' => $request->from_wallet_id,
                'to_wallet_id' => $request->to_wallet_id,
                'type' => $request->type,
                'amount' => $request->amount,
                'reference' => $reference,
                'description' => $request->description,
                'status' => 'pending',
            ]);

            // Process the transaction
            $this->processTransaction($transaction);

            return response()->json($transaction, 201);
        });
    }

    private function processTransaction(Transaction $transaction)
    {
        switch ($transaction->type) {
            case 'deposit':
                $this->processDeposit($transaction);
                break;
            case 'withdraw':
                $this->processWithdrawal($transaction);
                break;
            case 'transfer':
                $this->processTransfer($transaction);
                break;
            case 'receive':
                $this->processReceive($transaction);
                break;
        }
    }

    private function processDeposit(Transaction $transaction)
    {
        $wallet = $transaction->toWallet;
        if ($wallet && !$wallet->is_frozen) {
            $wallet->balance += $transaction->amount;
            $wallet->save();
            $transaction->status = 'completed';
            
            // Broadcast events
            event(new BalanceUpdated($wallet->id, $wallet->balance, $transaction->user_id));
            event(new NewTransaction($transaction));
            
            // Update limits
            WalletLimit::updateLimit($transaction->user_id, $transaction->amount, 'daily');
            WalletLimit::updateLimit($transaction->user_id, $transaction->amount, 'monthly');
        } else {
            $transaction->status = 'failed';
        }
        
        $transaction->save();
    }

    private function processWithdrawal(Transaction $transaction)
    {
        $wallet = $transaction->fromWallet;
        if ($wallet && !$wallet->is_frozen && $wallet->balance >= $transaction->amount) {
            $wallet->balance -= $transaction->amount;
            $wallet->save();
            $transaction->status = 'completed';
            
            // Broadcast events
            event(new BalanceUpdated($wallet->id, $wallet->balance, $transaction->user_id));
            event(new NewTransaction($transaction));
            
            // Update limits
            WalletLimit::updateLimit($transaction->user_id, $transaction->amount, 'daily');
            WalletLimit::updateLimit($transaction->user_id, $transaction->amount, 'monthly');
        } else {
            $transaction->status = 'failed';
        }
        
        $transaction->save();
    }

    private function processTransfer(Transaction $transaction)
    {
        $fromWallet = $transaction->fromWallet;
        $toWallet = $transaction->toWallet;

        if ($fromWallet && $toWallet && 
            !$fromWallet->is_frozen && !$toWallet->is_frozen && 
            $fromWallet->balance >= $transaction->amount) {
            
            $fromWallet->balance -= $transaction->amount;
            $toWallet->balance += $transaction->amount;
            
            $fromWallet->save();
            $toWallet->save();
            
            $transaction->status = 'completed';
            
            // Broadcast events
            event(new BalanceUpdated($fromWallet->id, $fromWallet->balance, $transaction->user_id));
            event(new BalanceUpdated($toWallet->id, $toWallet->balance, $transaction->user_id));
            event(new NewTransaction($transaction));
            
            // Update limits
            WalletLimit::updateLimit($transaction->user_id, $transaction->amount, 'daily');
            WalletLimit::updateLimit($transaction->user_id, $transaction->amount, 'monthly');
        } else {
            $transaction->status = 'failed';
        }
        
        $transaction->save();
    }

    private function processReceive(Transaction $transaction)
    {
        $wallet = $transaction->toWallet;
        if ($wallet && !$wallet->is_frozen) {
            $wallet->balance += $transaction->amount;
            $wallet->save();
            $transaction->status = 'completed';
        } else {
            $transaction->status = 'failed';
        }
        
        $transaction->save();
    }

    public function show(Request $request, $id)
    {
        $transaction = $request->user()->transactions()
            ->with(['fromWallet', 'toWallet'])
            ->findOrFail($id);
        
        return response()->json($transaction);
    }

    public function export(Request $request)
    {
        $request->validate([
            'type' => 'nullable|in:deposit,withdraw,transfer,receive',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $type = $request->query('type');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $transactions = $request->user()->transactions()
            ->with(['fromWallet', 'toWallet'])
            ->when($type, fn($q) => $q->where('type', $type))
            ->when($startDate, fn($q) => $q->whereDate('created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('created_at', '<=', $endDate))
            ->orderBy('created_at', 'desc')
            ->get();

        $csv = "ID,Reference,Type,Amount,Status,Description,Date\n";
        
        foreach ($transactions as $transaction) {
            $csv .= "{$transaction->id},{$transaction->reference},{$transaction->type},{$transaction->amount},{$transaction->status},\"{$transaction->description}\",{$transaction->created_at}\n";
        }

        $filename = "transactions_" . date('Y-m-d') . ".csv";
        
        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
