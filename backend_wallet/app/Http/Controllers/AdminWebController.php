<?php

namespace App\Http\Controllers;

use App\Models\AdminActionLog;
use App\Models\AdminSetting;
use App\Models\CommissionConfig;
use App\Models\CommissionOverride;
use App\Models\CommissionTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletAdjustment;
use App\Models\WalletLimit;
use App\Models\WithdrawRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminWebController extends Controller
{
    public function dashboard()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'dashboard']));
    }

    public function users(Request $request)
    {
        $section = (string) $request->query('section', 'users');
        if (!in_array($section, ['users', 'add-user', 'roles'], true)) {
            $section = 'users';
        }

        return view('admin.panel', array_merge($this->baseData(), [
            'tab' => 'users',
            'userSection' => $section,
        ]));
    }

    public function wallets()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'wallets']));
    }

    public function walletTransfer()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'wallet-transfer']));
    }

    public function commissions()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'commissions']));
    }

    public function withdrawals()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'withdrawals']));
    }

    public function transactions(Request $request)
    {
        $query = trim((string) $request->query('q', ''));
        $type = $request->query('type');

        $withdrawals = Transaction::with(['user', 'fromWallet'])
            ->where('type', 'withdraw')
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($q) use ($query) {
                    $q->where('reference', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhereHas('user', function ($uq) use ($query) {
                            $uq->where('name', 'like', "%{$query}%")
                                ->orWhere('email', 'like', "%{$query}%");
                        });
                });
            })
            ->orderBy('created_at', 'desc')
            ->limit(250)
            ->get();

        $commissions = CommissionTransaction::with(['user', 'wallet'])
            ->when(in_array($type, ['admin', 'master_distributor', 'super_distributor', 'distributor'], true), fn($builder) => $builder->where('commission_type', $type))
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($q) use ($query) {
                    $q->where('reference', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhereHas('user', function ($uq) use ($query) {
                            $uq->where('name', 'like', "%{$query}%")
                                ->orWhere('email', 'like', "%{$query}%");
                        });
                });
            })
            ->orderBy('created_at', 'desc')
            ->limit(250)
            ->get();

        return view('admin.panel', array_merge($this->baseData(), [
            'tab' => 'transactions',
            'search' => $query,
            'typeFilter' => $type,
            'recentWithdrawals' => $withdrawals,
            'recentCommissions' => $commissions,
        ]));
    }

    public function reports()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'reports']));
    }

    public function logs()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'logs']));
    }

    public function security()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'security']));
    }

    public function profile()
    {
        return view('admin.panel', array_merge($this->baseData(), ['tab' => 'profile']));
    }

    public function media(string $path)
    {
        $path = ltrim($path, '/');
        if ($path === '' || str_contains($path, '..')) {
            abort(404);
        }

        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public')->response($path);
    }

    public function updateProfilePhoto(Request $request)
    {
        $payload = $request->validate([
            'profile_photo' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $admin = auth()->user();
        if (!$admin) {
            return redirect()->route('admin.login.form');
        }

        $admin->profile_photo_path = $request->file('profile_photo')->store('users/profile-photo', 'public');
        $admin->save();

        $this->logAdminAction('update_profile_photo', 'user', $admin->id, [
            'mime' => $payload['profile_photo']->getClientMimeType(),
        ]);

        return redirect()->route('admin.profile')->with('success', 'Profile photo updated successfully.');
    }

    public function editUser(int $id)
    {
        $user = User::with(['distributor', 'commissionOverride'])->findOrFail($id);

        return view('admin.user-edit', [
            'admin' => auth()->user(),
            'user' => $user,
            'masterDistributors' => User::where('role', 'master_distributor')->orderBy('name')->get(),
            'superDistributors' => User::where('role', 'super_distributor')->orderBy('name')->get(),
            'distributors' => User::where('role', 'distributor')->orderBy('name')->get(),
            'defaultCommission' => CommissionConfig::where('is_active', true)->where('user_role', $user->role)->first(),
        ]);
    }

    public function userProfile(int $id)
    {
        $user = User::with(['distributor', 'wallets', 'commissionOverride'])->findOrFail($id);
        $defaultCommission = CommissionConfig::where('is_active', true)
            ->where('user_role', $user->role)
            ->first();

        return view('admin.user-profile', [
            'admin' => auth()->user(),
            'user' => $user,
            'defaultCommission' => $defaultCommission,
        ]);
    }

    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:master_distributor,super_distributor,distributor,retailer',
            'phone' => 'required|string|digits:10',
            'alternate_mobile' => 'nullable|string|digits:10',
            'business_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:2000',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date|before:today',
            'profile_photo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
            'kyc_id_number' => 'nullable|string|max:64',
            'kyc_photo' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'address_proof_front' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'address_proof_back' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'distributor_id' => 'nullable|integer|exists:users,id',
            'opening_balance' => 'nullable|numeric|min:0',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:64',
            'bank_ifsc_code' => 'nullable|string|max:32',
            'bank_name' => 'nullable|string|max:255',
            'admin_commission' => 'nullable|numeric|min:0|max:100',
            'distributor_commission' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return redirect()->route('admin.users', ['section' => 'add-user'])
                ->withErrors($validator)
                ->withInput();
        }

        $payload = $validator->validated();

        $profilePhotoPath = $request->hasFile('profile_photo')
            ? $request->file('profile_photo')->store('users/profile-photo', 'public')
            : null;
        $kycPhotoPath = $request->hasFile('kyc_photo')
            ? $request->file('kyc_photo')->store('users/kyc-photo', 'public')
            : null;
        $addressProofFrontPath = $request->hasFile('address_proof_front')
            ? $request->file('address_proof_front')->store('users/address-proof/front', 'public')
            : null;
        $addressProofBackPath = $request->hasFile('address_proof_back')
            ? $request->file('address_proof_back')->store('users/address-proof/back', 'public')
            : null;

        if ($payload['role'] === 'retailer' && empty($payload['distributor_id'])) {
            return back()->withInput()->with('error', 'Distributor is required for retailer.');
        }
        if ($payload['role'] === 'super_distributor' && empty($payload['distributor_id'])) {
            return back()->withInput()->with('error', 'Master distributor is required for super distributor.');
        }
        if ($payload['role'] === 'super_distributor' && !empty($payload['distributor_id'])) {
            $validMaster = User::where('id', $payload['distributor_id'])->where('role', 'master_distributor')->exists();
            if (!$validMaster) {
                return back()->withInput()->with('error', 'Valid master distributor is required for super distributor.');
            }
        }
        if ($payload['role'] === 'distributor' && empty($payload['distributor_id'])) {
            return back()->withInput()->with('error', 'Super distributor is required for distributor.');
        }
        if ($payload['role'] === 'distributor' && !empty($payload['distributor_id'])) {
            $validSuper = User::where('id', $payload['distributor_id'])->where('role', 'super_distributor')->exists();
            if (!$validSuper) {
                return back()->withInput()->with('error', 'Valid super distributor is required for distributor.');
            }
        }
        if ($payload['role'] === 'retailer' && !empty($payload['distributor_id'])) {
            $validDistributor = User::where('id', $payload['distributor_id'])->where('role', 'distributor')->exists();
            if (!$validDistributor) {
                return back()->withInput()->with('error', 'Valid distributor is required for retailer.');
            }
        }

        $newUser = DB::transaction(function () use (
            $payload,
            $profilePhotoPath,
            $kycPhotoPath,
            $addressProofFrontPath,
            $addressProofBackPath
        ) {
            $user = User::create([
                'name' => $payload['name'],
                'last_name' => $payload['last_name'] ?? null,
                'email' => $payload['email'],
                'password' => Hash::make($payload['password']),
                'phone' => $payload['phone'],
                'alternate_mobile' => $payload['alternate_mobile'] ?? null,
                'business_name' => $payload['business_name'] ?? null,
                'address' => $payload['address'] ?? null,
                'city' => $payload['city'] ?? null,
                'state' => $payload['state'] ?? null,
                'date_of_birth' => $payload['date_of_birth'] ?? null,
                'profile_photo_path' => $profilePhotoPath,
                'kyc_id_number' => $payload['kyc_id_number'] ?? null,
                'kyc_photo_path' => $kycPhotoPath,
                'address_proof_front_path' => $addressProofFrontPath,
                'address_proof_back_path' => $addressProofBackPath,
                'kyc_document_path' => $kycPhotoPath,
                'role' => $payload['role'],
                'distributor_id' => in_array($payload['role'], ['super_distributor', 'distributor', 'retailer'], true)
                    ? ($payload['distributor_id'] ?? null)
                    : null,
                'is_active' => true,
                'bank_account_name' => $payload['bank_account_name'] ?? null,
                'bank_account_number' => $payload['bank_account_number'] ?? null,
                'bank_ifsc_code' => $payload['bank_ifsc_code'] ?? null,
                'bank_name' => $payload['bank_name'] ?? null,
            ]);

            $user->wallets()->create([
                'name' => ucfirst($payload['role']) . ' Sub Wallet',
                'type' => 'sub',
                'balance' => (float) ($payload['opening_balance'] ?? 0),
                'is_frozen' => false,
            ]);

            $daily = in_array($payload['role'], ['master_distributor', 'super_distributor', 'distributor'], true) ? 500000 : 10000;
            $monthly = in_array($payload['role'], ['master_distributor', 'super_distributor', 'distributor'], true) ? 5000000 : 100000;
            $perTx = in_array($payload['role'], ['master_distributor', 'super_distributor', 'distributor'], true) ? 200000 : 50000;

            $user->walletLimits()->createMany([
                ['limit_type' => 'daily', 'max_amount' => $daily, 'reset_date' => now()->toDateString()],
                ['limit_type' => 'monthly', 'max_amount' => $monthly, 'reset_date' => now()->startOfMonth()->toDateString()],
                ['limit_type' => 'per_transaction', 'max_amount' => $perTx],
            ]);

            $adminCommission = array_key_exists('admin_commission', $payload) ? $payload['admin_commission'] : null;
            $distributorCommission = array_key_exists('distributor_commission', $payload) ? $payload['distributor_commission'] : null;
            if ($adminCommission !== null || $distributorCommission !== null) {
                CommissionOverride::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'admin_commission' => (float) ($adminCommission ?? 0),
                        'distributor_commission' => (float) ($distributorCommission ?? 0),
                        'is_active' => true,
                    ]
                );
            }

            return $user;
        });

        $this->logAdminAction('create_user', 'user', $newUser->id, ['role' => $newUser->role]);
        return redirect()->route('admin.users', ['section' => 'users'])
            ->with('success', ucfirst($payload['role']) . ' created successfully.');
    }

    public function toggleUser(int $id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'admin') {
            return back()->with('error', 'Admin user cannot be deactivated from this action.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $this->logAdminAction('toggle_user_status', 'user', $user->id, ['is_active' => $user->is_active]);
        return back()->with('success', 'User ' . ($user->is_active ? 'activated' : 'deactivated') . ' successfully.');
    }

    public function updateUser(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $payload = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'required|string|digits:10',
            'alternate_mobile' => 'nullable|string|digits:10',
            'business_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:2000',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date|before:today',
            'role' => 'required|in:admin,master_distributor,super_distributor,distributor,retailer',
            'distributor_id' => 'nullable|integer|exists:users,id',
            'kyc_id_number' => 'nullable|string|max:64',
            'kyc_document_type' => 'nullable|string|max:50',
            'kyc_status' => 'nullable|string|max:30',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:64',
            'bank_ifsc_code' => 'nullable|string|max:32',
            'bank_name' => 'nullable|string|max:255',
            'profile_photo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
            'kyc_photo' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'address_proof_front' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'address_proof_back' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'admin_commission' => 'nullable|numeric|min:0|max:100',
            'distributor_commission' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($payload['role'] === 'retailer' && empty($payload['distributor_id'])) {
            return back()->withInput()->with('error', 'Distributor is required for retailer.');
        }
        if ($payload['role'] === 'super_distributor' && empty($payload['distributor_id'])) {
            return back()->withInput()->with('error', 'Master distributor is required for super distributor.');
        }
        if ($payload['role'] === 'super_distributor' && !empty($payload['distributor_id'])) {
            $validMaster = User::where('id', $payload['distributor_id'])->where('role', 'master_distributor')->exists();
            if (!$validMaster) {
                return back()->withInput()->with('error', 'Valid master distributor is required for super distributor.');
            }
        }
        if ($payload['role'] === 'distributor' && empty($payload['distributor_id'])) {
            return back()->withInput()->with('error', 'Super distributor is required for distributor.');
        }
        if ($payload['role'] === 'distributor' && !empty($payload['distributor_id'])) {
            $validSuper = User::where('id', $payload['distributor_id'])->where('role', 'super_distributor')->exists();
            if (!$validSuper) {
                return back()->withInput()->with('error', 'Valid super distributor is required for distributor.');
            }
        }
        if ($payload['role'] === 'retailer' && !empty($payload['distributor_id'])) {
            $validDistributor = User::where('id', $payload['distributor_id'])->where('role', 'distributor')->exists();
            if (!$validDistributor) {
                return back()->withInput()->with('error', 'Valid distributor is required for retailer.');
            }
        }

        DB::transaction(function () use ($request, $user, $payload) {
            $updateData = [
                'name' => $payload['name'],
                'last_name' => $payload['last_name'] ?? null,
                'email' => $payload['email'],
                'phone' => $payload['phone'],
                'alternate_mobile' => $payload['alternate_mobile'] ?? null,
                'business_name' => $payload['business_name'] ?? null,
                'address' => $payload['address'] ?? null,
                'city' => $payload['city'] ?? null,
                'state' => $payload['state'] ?? null,
                'date_of_birth' => $payload['date_of_birth'] ?? null,
                'role' => $payload['role'],
                'distributor_id' => in_array($payload['role'], ['super_distributor', 'distributor', 'retailer'], true)
                    ? ($payload['distributor_id'] ?? null)
                    : null,
                'kyc_id_number' => $payload['kyc_id_number'] ?? null,
                'kyc_document_type' => $payload['kyc_document_type'] ?? null,
                'kyc_status' => $payload['kyc_status'] ?? null,
                'bank_account_name' => $payload['bank_account_name'] ?? null,
                'bank_account_number' => $payload['bank_account_number'] ?? null,
                'bank_ifsc_code' => $payload['bank_ifsc_code'] ?? null,
                'bank_name' => $payload['bank_name'] ?? null,
            ];

            if ($request->hasFile('profile_photo')) {
                $updateData['profile_photo_path'] = $request->file('profile_photo')->store('users/profile-photo', 'public');
            }
            if ($request->hasFile('kyc_photo')) {
                $updateData['kyc_photo_path'] = $request->file('kyc_photo')->store('users/kyc-photo', 'public');
                $updateData['kyc_document_path'] = $updateData['kyc_photo_path'];
            }
            if ($request->hasFile('address_proof_front')) {
                $updateData['address_proof_front_path'] = $request->file('address_proof_front')->store('users/address-proof/front', 'public');
            }
            if ($request->hasFile('address_proof_back')) {
                $updateData['address_proof_back_path'] = $request->file('address_proof_back')->store('users/address-proof/back', 'public');
            }

            $user->update($updateData);

            $adminCommission = $payload['admin_commission'] ?? null;
            $distributorCommission = $payload['distributor_commission'] ?? null;

            if ($adminCommission !== null || $distributorCommission !== null) {
                CommissionOverride::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'admin_commission' => (float) ($adminCommission ?? 0),
                        'distributor_commission' => (float) ($distributorCommission ?? 0),
                        'is_active' => true,
                    ]
                );
            }
        });

        $this->logAdminAction('update_user', 'user', $user->id, [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
        ]);

        return redirect()->route('admin.users.edit', ['id' => $user->id])->with('success', 'User updated successfully.');
    }

    public function resetUserPassword(Request $request, int $id)
    {
        $payload = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::findOrFail($id);
        $user->password = Hash::make($payload['password']);
        $user->save();

        $this->logAdminAction('reset_user_password', 'user', $user->id, []);
        return back()->with('success', 'Password reset successfully.');
    }

    public function deleteUser(int $id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'admin') {
            return back()->with('error', 'Admin user cannot be deleted.');
        }
        $deletedId = $user->id;
        $user->delete();

        $this->logAdminAction('delete_user', 'user', $deletedId, []);
        return back()->with('success', 'User deleted successfully.');
    }

    public function toggleWallet(int $id)
    {
        $wallet = Wallet::with('user')->findOrFail($id);
        $wallet->is_frozen = !$wallet->is_frozen;
        $wallet->freeze_reason = $wallet->is_frozen ? 'Frozen by admin backend' : null;
        $wallet->save();

        $this->logAdminAction('toggle_wallet_freeze', 'wallet', $wallet->id, ['is_frozen' => $wallet->is_frozen]);
        return back()->with('success', 'Wallet for ' . ($wallet->user?->name ?? 'user') . ' ' . ($wallet->is_frozen ? 'frozen' : 'unfrozen') . '.');
    }

    public function adjustWallet(Request $request)
    {
        $payload = $request->validate([
            'wallet_id' => 'required|integer|exists:wallets,id',
            'type' => 'required|in:add,deduct',
            'amount' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($payload) {
            $wallet = Wallet::with('user')->lockForUpdate()->findOrFail($payload['wallet_id']);
            $amount = (float) $payload['amount'];
            if ($payload['type'] === 'deduct' && $wallet->balance < $amount) {
                throw new \RuntimeException('Insufficient wallet balance for deduction.');
            }

            $wallet->balance = $payload['type'] === 'add'
                ? $wallet->balance + $amount
                : $wallet->balance - $amount;
            $wallet->save();

            WalletAdjustment::create([
                'admin_user_id' => auth()->id(),
                'user_id' => $wallet->user_id,
                'wallet_id' => $wallet->id,
                'type' => $payload['type'],
                'amount' => $amount,
                'reference' => WalletAdjustment::generateReference(),
                'remarks' => $payload['remarks'] ?? null,
            ]);

            $this->logAdminAction('wallet_adjustment', 'wallet', $wallet->id, [
                'type' => $payload['type'],
                'amount' => $amount,
            ]);
        });

        return back()->with('success', 'Wallet adjusted successfully.');
    }

    public function updateDefaultCommission(Request $request)
    {
        $payload = $request->validate([
            'user_role' => 'required|in:admin,master_distributor,super_distributor,distributor,retailer',
            'admin_commission' => 'required|numeric|min:0|max:100',
            'distributor_commission' => 'required|numeric|min:0|max:100',
        ]);

        CommissionConfig::updateOrCreate(
            ['user_role' => $payload['user_role'], 'is_active' => true],
            [
                'name' => ucfirst($payload['user_role']) . ' Withdrawal Commission',
                'admin_commission' => $payload['admin_commission'],
                'distributor_commission' => $payload['distributor_commission'],
            ]
        );

        $this->logAdminAction('update_default_commission', 'commission_config', 0, $payload);
        return back()->with('success', 'Default commission updated.');
    }

    public function setCommissionOverride(Request $request)
    {
        $payload = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'admin_commission' => 'required|numeric|min:0|max:100',
            'distributor_commission' => 'required|numeric|min:0|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $override = CommissionOverride::updateOrCreate(
            ['user_id' => $payload['user_id']],
            [
                'admin_commission' => $payload['admin_commission'],
                'distributor_commission' => $payload['distributor_commission'],
                'is_active' => $payload['is_active'] ?? true,
            ]
        );

        $this->logAdminAction('set_commission_override', 'commission_override', $override->id, $payload);
        return back()->with('success', 'Commission override saved.');
    }

    public function deleteCommissionOverride(int $id)
    {
        $override = CommissionOverride::findOrFail($id);
        $overrideId = $override->id;
        $override->delete();
        $this->logAdminAction('delete_commission_override', 'commission_override', $overrideId, []);
        return back()->with('success', 'Commission override removed.');
    }

    public function updateWithdrawSettings(Request $request)
    {
        $payload = $request->validate([
            'withdraw_approval_mode' => 'required|in:auto,manual',
            'withdraw_min_amount' => 'required|numeric|min:0',
            'withdraw_max_per_tx' => 'required|numeric|min:0',
        ]);

        AdminSetting::setValue('withdraw_approval_mode', $payload['withdraw_approval_mode']);
        AdminSetting::setValue('withdraw_min_amount', $payload['withdraw_min_amount']);
        AdminSetting::setValue('withdraw_max_per_tx', $payload['withdraw_max_per_tx']);

        $this->logAdminAction('update_withdraw_settings', 'admin_setting', 0, $payload);
        return back()->with('success', 'Withdraw settings updated.');
    }

    public function approveWithdraw(Request $request, int $id)
    {
        $payload = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($id, $payload) {
            $wr = WithdrawRequest::with(['user', 'wallet'])->lockForUpdate()->findOrFail($id);
            if ($wr->status !== 'pending' && $wr->status !== 'approved') {
                throw new \RuntimeException('Only pending/approved requests can be processed.');
            }

            $wallet = $wr->wallet;
            if (!$wallet || $wallet->balance < $wr->amount) {
                throw new \RuntimeException('Insufficient balance to process withdrawal.');
            }

            // Get fee from metadata or calculate it
            if (isset($wr->metadata['withdrawal_fee'])) {
                $feeAmount = (float) $wr->metadata['withdrawal_fee'];
            } else {
                // Fallback calculation if fee not in metadata
                $withdrawalAmount = (float) $wr->amount;
                $feeAmount = 0.0;
                if ($withdrawalAmount >= 5000.0 && $withdrawalAmount <= 10000.0) {
                    $feeAmount = 5.0;
                } elseif ($withdrawalAmount > 10000.0) {
                    $feeAmount = 10.0;
                }
            }
            $netPayoutAmount = (float) $wr->amount - $feeAmount;

            $tx = $wr->user->transactions()->create([
                'from_wallet_id' => $wallet->id,
                'type' => 'withdraw',
                'amount' => $wr->amount,
                'reference' => Transaction::generateReference(),
                'description' => 'Bank withdrawal (approved by admin)',
                'status' => 'completed',
                'metadata' => [
                    'withdraw_request_id' => $wr->id,
                    'original_amount' => $wr->amount,
                    'debited_amount' => $wr->amount,
                    'withdrawal_fee' => $feeAmount,
                    'net_payout_amount' => $netPayoutAmount,
                    'remarks' => $payload['remarks'] ?? null,
                ],
            ]);

            $wallet->balance -= $wr->amount;
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

            WalletLimit::updateLimit($wr->user_id, (float) $wr->amount, 'daily');
            WalletLimit::updateLimit($wr->user_id, (float) $wr->amount, 'monthly');

            $wr->status = 'processed';
            $wr->remarks = $payload['remarks'] ?? $wr->remarks;
            $wr->reviewed_by = auth()->id();
            $wr->reviewed_at = now();
            $wr->save();

            \App\Http\Controllers\Api\RetailerController::notify(
                $wr->user_id,
                'withdraw_processed',
                'Withdraw Approved',
                'Your withdrawal has been approved and processed.',
                [
                    'withdraw_request_id' => $wr->id,
                    'transaction_id' => $tx->id,
                    'amount' => (float) $wr->amount,
                ]
            );

            $this->logAdminAction('approve_withdraw', 'withdraw_request', $wr->id, ['transaction_id' => $tx->id]);
        });

        return back()->with('success', 'Withdraw request approved and processed.');
    }

    public function rejectWithdraw(Request $request, int $id)
    {
        $payload = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $wr = WithdrawRequest::findOrFail($id);
        if ($wr->status !== 'pending' && $wr->status !== 'approved') {
            return back()->with('error', 'Only pending/approved requests can be rejected.');
        }

        $wr->status = 'rejected';
        $wr->remarks = $payload['remarks'] ?? $wr->remarks;
        $wr->reviewed_by = auth()->id();
        $wr->reviewed_at = now();
        $wr->save();

        \App\Http\Controllers\Api\RetailerController::notify(
            $wr->user_id,
            'withdraw_rejected',
            'Withdraw Rejected',
            'Your withdrawal request was rejected.',
            [
                'withdraw_request_id' => $wr->id,
                'remarks' => $wr->remarks,
            ]
        );

        $this->logAdminAction('reject_withdraw', 'withdraw_request', $wr->id, []);
        return back()->with('success', 'Withdraw request rejected.');
    }

    public function forceSettlement(Request $request)
    {
        $payload = $request->validate([
            'wallet_id' => 'required|integer|exists:wallets,id',
            'amount' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($payload) {
            $wallet = Wallet::with('user')->lockForUpdate()->findOrFail($payload['wallet_id']);
            $amount = (float) $payload['amount'];
            if ($wallet->balance < $amount) {
                throw new \RuntimeException('Insufficient balance for forced settlement.');
            }

            $wallet->balance -= $amount;
            $wallet->save();

            WalletAdjustment::create([
                'admin_user_id' => auth()->id(),
                'user_id' => $wallet->user_id,
                'wallet_id' => $wallet->id,
                'type' => 'force_settlement',
                'amount' => $amount,
                'reference' => WalletAdjustment::generateReference(),
                'remarks' => $payload['remarks'] ?? 'Forced settlement by admin',
            ]);

            $this->logAdminAction('force_settlement', 'wallet', $wallet->id, ['amount' => $amount]);
        });

        return back()->with('success', 'Forced settlement applied.');
    }

    public function transferBetweenWallets(Request $request)
    {
        $payload = $request->validate([
            'from_wallet_id' => 'required|integer|exists:wallets,id|different:to_wallet_id',
            'to_wallet_id' => 'required|integer|exists:wallets,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            DB::transaction(function () use ($payload) {
                $fromWallet = Wallet::with('user')->lockForUpdate()->findOrFail($payload['from_wallet_id']);
                $toWallet = Wallet::with('user')->lockForUpdate()->findOrFail($payload['to_wallet_id']);
                $amount = (float) $payload['amount'];

                if ($fromWallet->is_frozen || $toWallet->is_frozen) {
                    throw new \RuntimeException('Cannot transfer to/from frozen wallets.');
                }

                if ((float) $fromWallet->balance < $amount) {
                    throw new \RuntimeException('Insufficient balance in source wallet.');
                }

                $fromWallet->balance = (float) $fromWallet->balance - $amount;
                $toWallet->balance = (float) $toWallet->balance + $amount;
                $fromWallet->save();
                $toWallet->save();

                $tx = Transaction::create([
                    'user_id' => auth()->id(),
                    'from_wallet_id' => $fromWallet->id,
                    'to_wallet_id' => $toWallet->id,
                    'type' => 'transfer',
                    'amount' => $amount,
                    'reference' => Transaction::generateReference(),
                    'description' => $payload['description'] ?? 'Admin wallet-to-wallet transfer',
                    'status' => 'completed',
                ]);

                $this->logAdminAction('wallet_transfer', 'transaction', $tx->id, [
                    'from_wallet_id' => $fromWallet->id,
                    'to_wallet_id' => $toWallet->id,
                    'amount' => $amount,
                ]);
            });

            return redirect()->route('admin.wallet-transfer')->with('success', 'Wallet transfer completed successfully.');
        } catch (\RuntimeException $e) {
            return redirect()->route('admin.wallet-transfer')->with('error', $e->getMessage());
        }
    }

    public function updateSecuritySettings(Request $request)
    {
        $payload = $request->validate([
            'security_2fa_enforced' => 'nullable|in:0,1',
            'security_ip_restriction' => 'nullable|string|max:1000',
            'security_rate_limit_per_minute' => 'required|integer|min:10|max:10000',
            'security_min_password_length' => 'required|integer|min:8|max:64',
        ]);

        AdminSetting::setValue('security_2fa_enforced', $payload['security_2fa_enforced'] ?? '0');
        AdminSetting::setValue('security_ip_restriction', $payload['security_ip_restriction'] ?? '');
        AdminSetting::setValue('security_rate_limit_per_minute', $payload['security_rate_limit_per_minute']);
        AdminSetting::setValue('security_min_password_length', $payload['security_min_password_length']);

        $this->logAdminAction('update_security_settings', 'admin_setting', 0, $payload);
        return back()->with('success', 'Security settings saved.');
    }

    public function exportTransactionsCsv()
    {
        $filename = 'admin_transactions_' . now()->format('Ymd_His') . '.csv';

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['section', 'date', 'user', 'type', 'amount', 'status', 'reference', 'details']);

            Transaction::with('user')->orderBy('created_at', 'desc')->limit(1000)->get()->each(function ($row) use ($handle) {
                fputcsv($handle, [
                    'transaction',
                    optional($row->created_at)->format('Y-m-d H:i:s'),
                    $row->user?->email,
                    $row->type,
                    (float) $row->amount,
                    $row->status,
                    $row->reference,
                    $row->description,
                ]);
            });

            CommissionTransaction::with('user')->orderBy('created_at', 'desc')->limit(1000)->get()->each(function ($row) use ($handle) {
                fputcsv($handle, [
                    'commission',
                    optional($row->created_at)->format('Y-m-d H:i:s'),
                    $row->user?->email,
                    $row->commission_type,
                    (float) $row->commission_amount,
                    'completed',
                    $row->reference,
                    $row->description,
                ]);
            });

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function baseData(): array
    {
        $admin = auth()->user();
        $adminMainWallet = $admin?->wallets()->where('type', 'main')->orderBy('id')->first();

        $stats = [
            'admin_main_wallet_balance' => (float) ($adminMainWallet?->balance ?? 0),
            'total_wallet_balance' => (float) Wallet::sum('balance'),
            'total_master_distributors' => User::where('role', 'master_distributor')->count(),
            'total_super_distributors' => User::where('role', 'super_distributor')->count(),
            'total_distributors' => User::where('role', 'distributor')->count(),
            'total_retailers' => User::where('role', 'retailer')->count(),
            'total_commission_paid' => (float) CommissionTransaction::sum('commission_amount'),
            'total_withdrawals' => (float) Transaction::where('type', 'withdraw')->sum('amount'),
            'total_withdraw_today' => (float) Transaction::where('type', 'withdraw')->whereDate('created_at', now()->toDateString())->sum('amount'),
            'total_commission_today' => (float) CommissionTransaction::whereDate('created_at', now()->toDateString())->sum('commission_amount'),
            'active_users_count' => User::where('is_active', true)->count(),
        ];

        $masterDistributors = User::where('role', 'master_distributor')->with('wallets')->orderBy('id')->get();
        $superDistributors = User::where('role', 'super_distributor')->with('wallets')->orderBy('id')->get();
        $distributors = User::where('role', 'distributor')->with('wallets')->orderBy('id')->get();
        $retailers = User::where('role', 'retailer')->with(['wallets', 'distributor'])->orderBy('id')->get();
        $allWallets = Wallet::with('user')->orderBy('id')->get();
        $allNonAdminUsers = User::whereIn('role', ['master_distributor', 'super_distributor', 'distributor', 'retailer', 'user'])->orderBy('name')->get();

        $recentWithdrawals = Transaction::with(['user', 'fromWallet'])
            ->where('type', 'withdraw')->orderBy('created_at', 'desc')->limit(20)->get();
        $recentCommissions = CommissionTransaction::with(['user', 'wallet'])
            ->orderBy('created_at', 'desc')->limit(20)->get();
        $withdrawRequests = WithdrawRequest::with(['user', 'wallet', 'reviewer'])
            ->orderBy('created_at', 'desc')->limit(100)->get();
        $walletAdjustments = WalletAdjustment::with(['admin', 'user', 'wallet'])
            ->orderBy('created_at', 'desc')->limit(100)->get();
        $adminLogs = AdminActionLog::with('admin')->orderBy('created_at', 'desc')->limit(200)->get();
        $commissionOverrides = CommissionOverride::with('user')->orderBy('id')->get();
        $commissionConfigs = CommissionConfig::where('is_active', true)->orderBy('user_role')->get();

        $security = [
            'security_2fa_enforced' => AdminSetting::getValue('security_2fa_enforced', '0'),
            'security_ip_restriction' => AdminSetting::getValue('security_ip_restriction', ''),
            'security_rate_limit_per_minute' => AdminSetting::getValue('security_rate_limit_per_minute', '120'),
            'security_min_password_length' => AdminSetting::getValue('security_min_password_length', '8'),
        ];
        $withdrawConfig = [
            'withdraw_approval_mode' => AdminSetting::getValue('withdraw_approval_mode', 'auto'),
            'withdraw_min_amount' => AdminSetting::getValue('withdraw_min_amount', '100'),
            'withdraw_max_per_tx' => AdminSetting::getValue('withdraw_max_per_tx', '50000'),
        ];

        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->startOfMonth()->subMonths($i);
            $key = $monthStart->format('M Y');
            $monthlyRevenue[$key] = (float) CommissionTransaction::whereBetween('created_at', [
                $monthStart->copy()->startOfMonth(),
                $monthStart->copy()->endOfMonth(),
            ])->sum('commission_amount');
        }

        return [
            'stats' => $stats,
            'admin' => $admin,
            'adminMainWallet' => $adminMainWallet,
            'masterDistributors' => $masterDistributors,
            'superDistributors' => $superDistributors,
            'distributors' => $distributors,
            'retailers' => $retailers,
            'allWallets' => $allWallets,
            'allNonAdminUsers' => $allNonAdminUsers,
            'recentWithdrawals' => $recentWithdrawals,
            'recentCommissions' => $recentCommissions,
            'withdrawRequests' => $withdrawRequests,
            'walletAdjustments' => $walletAdjustments,
            'adminLogs' => $adminLogs,
            'commissionOverrides' => $commissionOverrides,
            'commissionConfigs' => $commissionConfigs,
            'security' => $security,
            'withdrawConfig' => $withdrawConfig,
            'monthlyRevenue' => $monthlyRevenue,
            'search' => '',
            'typeFilter' => null,
        ];
    }

    private function logAdminAction(string $action, string $targetType, int $targetId, array $metadata): void
    {
        AdminActionLog::create([
            'admin_user_id' => auth()->id(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
        ]);
    }
}
