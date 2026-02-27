<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wallet Admin Control</title>
    <style>
        :root { --blue:#1459c8; --blue2:#2c86f7; --bg:#cfe2ff; --panel:#ffffff; --text:#15233f; --muted:#5d6f8d; }
        * { box-sizing: border-box; }
        body { margin:0; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; color:var(--text); background:
            radial-gradient(circle at 12% 14%, rgba(91, 156, 255, .38) 0%, rgba(91, 156, 255, 0) 36%),
            radial-gradient(circle at 88% 78%, rgba(106, 173, 255, .32) 0%, rgba(106, 173, 255, 0) 38%),
            linear-gradient(180deg, #d8e8ff 0%, #c7ddff 45%, #b0d0ff 100%);
            background-attachment: fixed;
        }
        .app { min-height:100vh; display:grid; grid-template-columns:250px 1fr; background:transparent; }
        .sidebar { background:linear-gradient(180deg, #0f4ca8, #2373d8); color:#fff; padding:16px 12px; display:flex; flex-direction:column; gap:4px; }
        .brand { display:flex; align-items:center; gap:10px; padding:4px 8px 12px; }
        .brand-logo { width:42px; height:42px; border-radius:12px; background:rgba(255,255,255,.12); display:grid; place-items:center; box-shadow:0 6px 14px rgba(0,0,0,.12); }
        .brand-logo svg { width:30px; height:30px; }
        .brand-text { display:flex; flex-direction:column; line-height:1.1; }
        .brand-name { font-size:18px; font-weight:800; letter-spacing:.04em; }
        .brand-sub { font-size:11px; color:#dbe7ff; font-weight:600; }
        .menu { color:#eaf3ff; text-decoration:none; background:transparent; border-radius:12px; padding:10px 12px; font-size:14px; display:flex; align-items:center; gap:8px; font-weight:600; }
        .menu:hover { background:rgba(255,255,255,.10); }
        .menu.active { background:rgba(172, 207, 255, .34); font-weight:700; }
        .menu-group { display:flex; flex-direction:column; gap:2px; }
        .menu-parent { display:flex; align-items:center; justify-content:space-between; }
        .submenu { margin-left:0; display:flex; flex-direction:column; gap:2px; }
        .submenu-item { color:#e2eeff; text-decoration:none; background:transparent; border-radius:10px; padding:8px 12px 8px 34px; font-size:13px; display:flex; align-items:center; gap:8px; font-weight:600; }
        .submenu-item:hover { background:rgba(255,255,255,.08); }
        .submenu-item.active { background:rgba(172, 207, 255, .26); font-weight:700; }
        .menu-left { display:flex; align-items:center; gap:10px; }
        .menu-icon { width:16px; display:inline-flex; justify-content:center; font-size:13px; opacity:.95; }
        .logout { margin-top:auto; }
        .logout button { width:100%; border:0; border-radius:10px; padding:10px; background:rgba(0,0,0,.22); color:#fff; cursor:pointer; }
        .main { padding:18px; }
        .top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:12px; flex-wrap:wrap; }
        .title { margin:0; font-size:30px; }
        .pill { background:#fff; border-radius:999px; padding:8px 12px; box-shadow:0 8px 20px rgba(14,35,77,.10); font-size:13px; }
        .top-right { margin-left:auto; display:flex; align-items:center; }
        .profile-wrap { position:relative; }
        .profile-chip { border:0; background:rgba(255,255,255,.85); border-radius:999px; padding:6px 8px 6px 14px; display:flex; align-items:center; gap:10px; box-shadow:0 10px 22px rgba(14,35,77,.12); cursor:pointer; }
        .profile-meta { display:flex; flex-direction:column; align-items:flex-start; }
        .profile-name { font-weight:700; font-size:13px; color:#1d2b4c; }
        .profile-role { font-size:11px; color:#4f6184; }
        .profile-avatar { width:40px; height:40px; border-radius:999px; overflow:hidden; background:#e7efff; display:grid; place-items:center; color:#2f4b86; font-weight:700; border:2px solid rgba(255,255,255,.9); }
        .profile-avatar img { width:100%; height:100%; object-fit:cover; }
        .admin-photo-card { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .admin-photo-left { display:flex; align-items:center; gap:12px; }
        .admin-photo-preview { width:64px; height:64px; border-radius:999px; overflow:hidden; border:2px solid #e3ecfb; background:#f1f5fd; display:grid; place-items:center; color:#2f4b86; font-weight:700; }
        .admin-photo-preview img { width:100%; height:100%; object-fit:cover; }
        .admin-photo-form { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .admin-photo-form input[type="file"] { padding:7px 10px; border:1px solid #d9e3f4; border-radius:8px; background:#fff; }
        .profile-caret { font-size:12px; color:#52658b; margin-right:4px; }
        .profile-menu { position:absolute; top:52px; right:0; background:#fff; border-radius:12px; border:1px solid #d9e4f6; box-shadow:0 12px 22px rgba(22,43,80,.15); min-width:160px; padding:6px; display:none; z-index:20; }
        .profile-menu a, .profile-menu button { width:100%; text-align:left; border:0; background:transparent; padding:9px 12px; border-radius:8px; cursor:pointer; color:#1f3a69; font-size:13px; text-decoration:none; display:block; }
        .profile-menu a:hover, .profile-menu button:hover { background:#f3f7ff; }
        .profile-wrap.open .profile-menu { display:block; }
        .profile-wrap.open .profile-chip { box-shadow:0 12px 24px rgba(14,35,77,.2); }
        .flash { margin:0 0 10px 0; padding:10px 12px; border-radius:10px; font-size:14px; }
        .flash.success { background:#e6f8ee; color:#13643a; }
        .flash.error { background:#ffe8e8; color:#a32525; }
        .cards { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-bottom:12px; }
        .card { border-radius:12px; padding:12px; color:#fff; box-shadow:0 10px 18px rgba(0,0,0,.09); }
        .card span { font-size:11px; letter-spacing:.04em; text-transform:uppercase; opacity:.9; }
        .card strong { display:block; margin-top:6px; font-size:25px; }
        .c1{background:linear-gradient(135deg,#0f56c7,#2e85f9)} .c2{background:linear-gradient(135deg,#137a95,#25afcf)}
        .c3{background:linear-gradient(135deg,#8d5b13,#d3a53c)} .c4{background:linear-gradient(135deg,#6f4bb4,#a274e4)}
        .c5{background:linear-gradient(135deg,#146544,#2ebf7f)} .c6{background:linear-gradient(135deg,#954a62,#d77a99)}
        .panel { background:var(--panel); border-radius:12px; box-shadow:0 8px 20px rgba(31,56,98,.08); padding:12px; margin-bottom:12px; }
        .panel h3 { margin:2px 0 10px; font-size:22px; }
        .row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .row3 { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
        .form-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
        .form-grid input, .form-grid select, .inline input, .inline select { width:100%; padding:8px; border:1px solid #d9e3f4; border-radius:8px; }
        .btn { border:0; border-radius:8px; padding:8px 10px; cursor:pointer; color:#fff; background:#1b67d5; }
        .btn.green{background:#1f8d4d} .btn.red{background:#bf2d44} .btn.orange{background:#bc6b00}
        .btn.gray{background:#697892}
        table { width:100%; border-collapse:collapse; }
        th, td { text-align:left; padding:8px 6px; border-bottom:1px solid #edf2fa; font-size:13px; }
        th { font-size:11px; text-transform:uppercase; color:var(--muted); letter-spacing:.04em; }
        .inline { display:flex; gap:8px; align-items:center; }
        .tiny { font-size:12px; color:var(--muted); }
        .users-toolbar { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
        .users-toolbar-left, .users-toolbar-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .users-toolbar label { font-size:14px; color:#2f4270; }
        .users-toolbar select, .users-toolbar input { padding:7px 10px; border:1px solid #d7e2f5; border-radius:8px; background:#fff; }
        .users-toolbar input { min-width:220px; }
        .users-export-wrap { position:relative; }
        .users-export-menu { position:absolute; top:42px; right:0; background:#fff; border:1px solid #d7e2f5; border-radius:10px; box-shadow:0 10px 18px rgba(0,0,0,.08); min-width:140px; display:none; z-index:5; }
        .users-export-menu button { border:0; background:transparent; width:100%; text-align:left; padding:10px 12px; cursor:pointer; color:#244172; }
        .users-export-menu button:hover { background:#f3f7ff; }
        .users-table th .sort { color:#a5b4cf; margin-left:6px; font-size:11px; }
        .user-avatar { width:54px; height:54px; border-radius:999px; overflow:hidden; display:grid; place-items:center; background:#f1f5fd; color:#8ea0c5; font-size:22px; border:1px solid #e1e8f6; }
        .user-avatar img { width:100%; height:100%; object-fit:cover; }
        .name-block { display:flex; flex-direction:column; gap:2px; }
        .name-main { font-weight:700; color:#3f4e67; }
        .name-sub { font-size:12px; color:#8090ad; }
        .role-pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:6px; font-weight:700; font-size:12px; color:#fff; background:#e52a10; }
        .status-pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:6px; font-weight:700; font-size:12px; color:#fff; background:#2ca84f; }
        .status-pill.inactive { background:#a4acbb; }
        .action-icons { display:flex; align-items:center; gap:6px; }
        .action-icon { width:32px; height:32px; border:0; border-radius:6px; color:#fff; cursor:pointer; display:grid; place-items:center; font-size:15px; text-decoration:none; }
        .action-view { background:#ea4f2d; }
        .action-edit { background:#47ad5d; }
        .action-toggle { background:#1cb7d0; }
        .action-delete { background:#f02747; }
        .action-icon:hover { filter:brightness(.95); }
        .user-row-details { background:#f9fbff; }
        .user-row-details td { font-size:12px; color:#4d5f83; }
        .users-pagination { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; flex-wrap:wrap; }
        .users-pagination .pager { display:flex; align-items:center; gap:8px; }
        .users-pagination button { border:1px solid #d7e2f5; background:#fff; color:#2852a8; border-radius:7px; padding:6px 10px; cursor:pointer; }
        .users-pagination button:disabled { opacity:.55; cursor:not-allowed; }
        .users-empty { text-align:center; color:#7f8fad; padding:16px 8px; }
        .password-modal-backdrop { position:fixed; inset:0; background:rgba(8,18,36,.38); display:none; align-items:center; justify-content:center; z-index:1000; }
        .password-modal { width:min(460px,92vw); background:#fff; border-radius:12px; box-shadow:0 18px 40px rgba(0,0,0,.2); padding:14px; }
        .password-modal h4 { margin:0 0 10px; }
        .password-modal .form-grid-2 { display:grid; grid-template-columns:1fr; gap:8px; }
        .password-modal .actions { margin-top:10px; display:flex; justify-content:flex-end; gap:8px; }
        .wizard-steps { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
        .wizard-step { border:1px solid #d8e1f1; color:#506489; background:#fff; padding:9px 16px; border-radius:999px; font-weight:600; font-size:13px; }
        .wizard-step.active { background:#1479f4; border-color:#1479f4; color:#fff; box-shadow:0 6px 14px rgba(20,121,244,.25); }
        .wizard-divider { width:28px; height:2px; background:#d8e1f1; border-radius:8px; }
        .wizard-section { border-top:1px solid #ecf1fa; margin-top:10px; padding-top:14px; }
        .wizard-section h4 { margin:0 0 14px; font-size:38px; color:#14325f; }
        .wizard-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .wizard-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
        .wizard-actions { margin-top:12px; display:flex; justify-content:space-between; align-items:center; gap:10px; }
        .field-help { font-size:11px; color:#8b98b3; margin-top:3px; }
        .hidden-step { display:none; }
        #add-user-wizard-form { background:#fff; border:1px solid #e5ecf8; border-radius:12px; padding:14px; }
        #add-user-wizard-form .wizard-grid-2 > div,
        #add-user-wizard-form .wizard-grid-3 > div { display:flex; flex-direction:column; gap:5px; }
        #add-user-wizard-form .w-label { font-size:13px; color:#263f69; font-weight:600; }
        #add-user-wizard-form input,
        #add-user-wizard-form select,
        #add-user-wizard-form textarea { width:100%; padding:10px 12px; border:1px solid #c7d5ea; border-radius:6px; font-size:14px; background:#fff; color:#1e325a; }
        #add-user-wizard-form input[type="file"] { padding:7px 10px; }
        #add-user-wizard-form input:focus,
        #add-user-wizard-form select:focus,
        #add-user-wizard-form textarea:focus { outline:none; border-color:#2180f2; box-shadow:0 0 0 2px rgba(33,128,242,.12); }
        #add-user-wizard-form .upload-box { border:1px dashed #d5deef; border-radius:8px; padding:8px; background:#fbfdff; }
        #add-user-wizard-form .upload-note { font-size:12px; color:#6d7f9f; margin-top:4px; }
        #add-user-wizard-form .note-line { margin-top:10px; padding-top:8px; border-top:1px solid #e8eef9; font-size:14px; }
        @media(max-width:1100px){
            .wizard-grid-2,.wizard-grid-3{grid-template-columns:1fr;}
        }
        @media(max-width:1100px){ .app{grid-template-columns:1fr;} .cards{grid-template-columns:1fr 1fr;} .row2,.row3,.form-grid{grid-template-columns:1fr;} }
    </style>
</head>
<body>
@php
    $userSection = $userSection ?? 'users';
    $isUserTab = $tab === 'users';
@endphp
<div class="app">
    <aside class="sidebar">
        <div class="brand">
            <div class="brand-logo" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#paint0)"/>
                    <path d="M18 40L28 24L36 32L46 20" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="46" cy="20" r="4" fill="white"/>
                    <defs>
                        <linearGradient id="paint0" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#36D1DC"/>
                            <stop offset="1" stop-color="#5B86E5"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div class="brand-text">
                <span class="brand-name">XENN TECH</span>
                <span class="brand-sub">Wallet Admin</span>
            </div>
        </div>
        <a class="menu {{ $tab==='dashboard'?'active':'' }}" href="{{ route('admin.dashboard') }}"><span class="menu-icon">⌂</span><span>Dashboard</span></a>
        <div class="menu-group">
            <a class="menu menu-parent {{ $isUserTab?'active':'' }}" href="{{ route('admin.users', ['section' => 'users']) }}">
                <span class="menu-left"><span class="menu-icon">👤</span><span>User Management</span></span>
                <span>{{ $isUserTab ? '▾' : '▸' }}</span>
            </a>
            @if($isUserTab)
                <div class="submenu">
                    <a class="submenu-item {{ $userSection==='roles'?'active':'' }}" href="{{ route('admin.users', ['section' => 'roles']) }}"><span class="menu-icon">🛡</span><span>Roles</span></a>
                    <a class="submenu-item {{ in_array($userSection, ['users','add-user'], true)?'active':'' }}" href="{{ route('admin.users', ['section' => 'users']) }}"><span class="menu-icon">👥</span><span>Users</span></a>
                </div>
            @endif
        </div>
        <a class="menu {{ $tab==='wallets'?'active':'' }}" href="{{ route('admin.wallets') }}"><span class="menu-icon">💼</span><span>Wallet Control</span></a>
        <a class="menu {{ $tab==='wallet-transfer'?'active':'' }}" href="{{ route('admin.wallet-transfer') }}"><span class="menu-icon">⇄</span><span>Wallet Transfer</span></a>
        <a class="menu {{ $tab==='commissions'?'active':'' }}" href="{{ route('admin.commissions') }}"><span class="menu-icon">💰</span><span>Commission</span></a>
        <a class="menu {{ $tab==='withdrawals'?'active':'' }}" href="{{ route('admin.withdrawals') }}"><span class="menu-icon">💸</span><span>Withdraw Management</span></a>
        <a class="menu {{ $tab==='transactions'?'active':'' }}" href="{{ route('admin.transactions') }}"><span class="menu-icon">🧾</span><span>Transactions</span></a>
        <a class="menu {{ $tab==='reports'?'active':'' }}" href="{{ route('admin.reports') }}"><span class="menu-icon">📊</span><span>Reports</span></a>
        <a class="menu {{ $tab==='logs'?'active':'' }}" href="{{ route('admin.logs') }}"><span class="menu-icon">🗂</span><span>Audit & Logs</span></a>
        <a class="menu {{ $tab==='security'?'active':'' }}" href="{{ route('admin.security') }}"><span class="menu-icon">🔒</span><span>Security</span></a>
        <a class="menu {{ $tab==='profile'?'active':'' }}" href="{{ route('admin.profile') }}"><span class="menu-icon">👤</span><span>Profile</span></a>
        <form class="logout" method="post" action="{{ route('admin.logout') }}">@csrf <button>Logout</button></form>
    </aside>

    <main class="main">
        @php
            $toMediaUrl = function (?string $path) {
                return $path ? route('admin.media', ['path' => $path]) : null;
            };
            $adminName = $admin?->name ?: 'Admin';
            $adminRole = $admin?->role ? ucwords(str_replace('_', ' ', $admin->role)) : 'Administrator';
            $adminPhotoUrl = $toMediaUrl($admin?->profile_photo_path);
            $adminInitials = '';
            foreach (preg_split('/\s+/', trim($adminName)) as $part) {
                if ($part !== '') {
                    $adminInitials .= strtoupper($part[0]);
                }
            }
            $adminInitials = substr($adminInitials, 0, 2);
        @endphp
        <div class="top">
            <h1 class="title">{{ ucfirst($tab) }} Panel</h1>
            <div class="top-right">
                <div class="profile-wrap" id="profile-wrap">
                    <button class="profile-chip" type="button" id="profile-toggle" aria-haspopup="true" aria-expanded="false">
                        <div class="profile-meta">
                            <div class="profile-name">{{ $adminName }}</div>
                            <div class="profile-role">{{ $adminRole }}</div>
                        </div>
                        <div class="profile-avatar">
                            @if($adminPhotoUrl)
                                <img src="{{ $adminPhotoUrl }}" alt="Admin profile photo">
                            @else
                                <span>{{ $adminInitials }}</span>
                            @endif
                        </div>
                        <span class="profile-caret">▾</span>
                    </button>
                    <div class="profile-menu" id="profile-menu" role="menu">
                        <a href="{{ route('admin.profile') }}">Profile</a>
                        <form method="post" action="{{ route('admin.logout') }}">
                            @csrf
                            <button type="submit">Logout</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        @if(session('success'))<div class="flash success">{{ session('success') }}</div>@endif
        @if(session('error'))<div class="flash error">{{ session('error') }}</div>@endif
        @if($errors->any())<div class="flash error">{{ $errors->first() }}</div>@endif

        @if($tab === 'dashboard')
            <section class="cards">
                <article class="card c1"><span>Admin Main Wallet</span><strong>₹{{ number_format($stats['admin_main_wallet_balance'],2) }}</strong></article>
                <article class="card c2"><span>Total Wallet Balance</span><strong>₹{{ number_format($stats['total_wallet_balance'],2) }}</strong></article>
                <article class="card c3"><span>Total Commission Paid</span><strong>₹{{ number_format($stats['total_commission_paid'],2) }}</strong></article>
                <article class="card c4"><span>Total Withdrawals</span><strong>₹{{ number_format($stats['total_withdrawals'],2) }}</strong></article>
                <article class="card c6"><span>Master Distributors</span><strong>{{ $stats['total_master_distributors'] }}</strong></article>
                <article class="card c6"><span>Super Distributors</span><strong>{{ $stats['total_super_distributors'] }}</strong></article>
                <article class="card c5"><span>Distributors</span><strong>{{ $stats['total_distributors'] }}</strong></article>
                <article class="card c6"><span>Retailers</span><strong>{{ $stats['total_retailers'] }}</strong></article>
                <article class="card c2"><span>Withdraw Today</span><strong>₹{{ number_format($stats['total_withdraw_today'],2) }}</strong></article>
                <article class="card c5"><span>Commission Today</span><strong>₹{{ number_format($stats['total_commission_today'],2) }}</strong></article>
            </section>
            <section class="row2">
                <article class="panel"><h3>Hierarchy Snapshot</h3><table><thead><tr><th>Master Distributor</th><th>Email</th><th>Super Distributors</th><th>Balance</th></tr></thead><tbody>
                    @forelse($masterDistributors as $md)<tr><td>{{ $md->name }}</td><td>{{ $md->email }}</td><td>{{ $superDistributors->where('distributor_id',$md->id)->count() }}</td><td>₹{{ number_format((float)$md->wallets->sum('balance'),2) }}</td></tr>@empty<tr><td colspan="4">No master distributors</td></tr>@endforelse
                </tbody></table></article>
                <article class="panel"><h3>Latest Withdraw Requests</h3><table><thead><tr><th>Date</th><th>User</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                    @forelse($withdrawRequests->take(12) as $wr)<tr><td>{{ $wr->created_at?->format('d-m H:i') }}</td><td>{{ $wr->user?->name }}</td><td>₹{{ number_format((float)$wr->amount,2) }}</td><td>{{ ucfirst($wr->status) }}</td></tr>@empty<tr><td colspan="4">No requests</td></tr>@endforelse
                </tbody></table></article>
            </section>
        @endif

        @if($tab === 'users')
            @if($userSection === 'add-user')
                <section class="panel">
                    <h3>Add User</h3>
                    <div class="wizard-steps" id="add-user-steps">
                        <span class="wizard-step active" data-step="1">Personal Information</span>
                        <span class="wizard-divider"></span>
                        <span class="wizard-step" data-step="2">User eKYC</span>
                        <span class="wizard-divider"></span>
                        <span class="wizard-step" data-step="3">Bank Information</span>
                        <span class="wizard-divider"></span>
                        <span class="wizard-step" data-step="4">Commission Settings</span>
                    </div>

                    <form id="add-user-wizard-form" method="post" action="{{ route('admin.users.create') }}" enctype="multipart/form-data">
                        @csrf

                        <div class="wizard-section" data-step="1">
                            <h4>Personal Information</h4>
                            <div class="wizard-grid-2">
                                <div>
                                    <label class="w-label">First Name *</label>
                                    <input name="name" placeholder="First Name" value="{{ old('name') }}" required>
                                </div>
                                <div>
                                    <label class="w-label">Last Name *</label>
                                    <input name="last_name" placeholder="Last Name" value="{{ old('last_name') }}">
                                </div>

                                <div>
                                    <label class="w-label">Date of Birth</label>
                                    <input type="date" name="date_of_birth" value="{{ old('date_of_birth') }}">
                                </div>
                                <div style="display:flex;flex-direction:column;gap:4px;">
                                    <label class="w-label">Email Address *</label>
                                    <input type="email" name="email" placeholder="Email Address" value="{{ old('email') }}" required>
                                    @error('email')
                                        <span style="color:#bf2d44;font-size:12px;">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div>
                                    <label class="w-label">Mobile Number *</label>
                                    <input name="phone" placeholder="Mobile Number" value="{{ old('phone') }}" required>
                                </div>
                                <div>
                                    <label class="w-label">Alternative Mobile Number</label>
                                    <input name="alternate_mobile" placeholder="Alternative Mobile Number" value="{{ old('alternate_mobile') }}">
                                </div>

                                <div>
                                    <label class="w-label">Business Name *</label>
                                    <input name="business_name" placeholder="Business Name" value="{{ old('business_name') }}">
                                </div>
                                <div>
                                    <label class="w-label">Company Name</label>
                                    <input name="company_name" placeholder="Company Name (optional)" value="{{ old('company_name') }}">
                                </div>

                                <div>
                                    <label class="w-label">Address *</label>
                                    <input name="address" placeholder="Address" value="{{ old('address') }}">
                                </div>
                                <div>
                                    <label class="w-label">GST Number</label>
                                    <input name="gst_number" placeholder="GST Number" value="{{ old('gst_number') }}">
                                </div>

                                <div>
                                    <label class="w-label">State *</label>
                                    <input name="state" placeholder="State" value="{{ old('state') }}">
                                </div>
                                <div>
                                    <label class="w-label">City *</label>
                                    <input name="city" placeholder="City" value="{{ old('city') }}">
                                </div>

                                <div>
                                    <label class="w-label">Pincode *</label>
                                    <input name="pincode" placeholder="Pincode (optional)" value="{{ old('pincode') }}">
                                </div>
                                <div>
                                    <label class="w-label">Upload Photo</label>
                                    <div class="upload-box">
                                        <input type="file" name="profile_photo" accept=".jpg,.jpeg,.png,.webp">
                                        <div class="upload-note">Upload Photo, Max size 2MB preferred</div>
                                    </div>
                                </div>

                                <div>
                                    <label class="w-label">Password *</label>
                                    <input type="password" name="password" placeholder="Password (min 8)" required>
                                </div>
                                <div>
                                    <label class="w-label">Confirm Password *</label>
                                    <input type="password" name="password_confirmation" placeholder="Confirm Password" required>
                                </div>
                            </div>

                            <div class="wizard-actions">
                                <span></span>
                                <button class="btn" type="button" data-next-step="2">Next</button>
                            </div>
                        </div>

                        <div class="wizard-section hidden-step" data-step="2">
                            <h4>User eKYC</h4>
                            <div class="wizard-grid-2">
                                <div>
                                    <label class="w-label">Role *</label>
                                    <select name="role" required>
                                        <option value="">Role</option>
                                        <option value="master_distributor" {{ old('role')==='master_distributor'?'selected':'' }}>Master Distributor</option>
                                        <option value="super_distributor" {{ old('role')==='super_distributor'?'selected':'' }}>Super Distributor</option>
                                        <option value="distributor" {{ old('role')==='distributor'?'selected':'' }}>Distributor</option>
                                        <option value="retailer" {{ old('role')==='retailer'?'selected':'' }}>Retailer</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="w-label">Parent</label>
                                    <select name="distributor_id">
                                        <option value="">Parent (Master for Super / Super for Distributor / Distributor for Retailer)</option>
                                        @foreach($masterDistributors as $md)<option value="{{ $md->id }}" {{ old('distributor_id')==(string)$md->id?'selected':'' }}>{{ $md->name }} (master)</option>@endforeach
                                        @foreach($superDistributors as $sd)<option value="{{ $sd->id }}" {{ old('distributor_id')==(string)$sd->id?'selected':'' }}>{{ $sd->name }} (super)</option>@endforeach
                                        @foreach($distributors as $d)<option value="{{ $d->id }}" {{ old('distributor_id')==(string)$d->id?'selected':'' }}>{{ $d->name }} (distributor)</option>@endforeach
                                    </select>
                                </div>

                                <div>
                                    <label class="w-label">Document Number *</label>
                                    <input name="kyc_id_number" placeholder="Document Number (Aadhaar / PAN)" value="{{ old('kyc_id_number') }}">
                                </div>
                                <div>
                                    <label class="w-label">Document Type *</label>
                                    <select name="kyc_document_type">
                                        <option value="">Document Type</option>
                                        <option value="pan" {{ old('kyc_document_type')==='pan'?'selected':'' }}>PAN Card</option>
                                        <option value="aadhaar" {{ old('kyc_document_type')==='aadhaar'?'selected':'' }}>Aadhaar Card</option>
                                        <option value="other" {{ old('kyc_document_type')==='other'?'selected':'' }}>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="w-label">Upload Document Front *</label>
                                    <div class="upload-box">
                                        <input type="file" name="address_proof_front" accept=".jpg,.jpeg,.png,.webp,.pdf">
                                        <div class="upload-note">Upload front side</div>
                                    </div>
                                </div>
                                <div>
                                    <label class="w-label">Upload Document Back *</label>
                                    <div class="upload-box">
                                        <input type="file" name="address_proof_back" accept=".jpg,.jpeg,.png,.webp,.pdf">
                                        <div class="upload-note">Upload back side</div>
                                    </div>
                                </div>

                                <div style="grid-column:1/-1;">
                                    <label class="w-label">Upload KYC Document (optional)</label>
                                    <div class="upload-box">
                                        <input type="file" name="kyc_photo" accept=".jpg,.jpeg,.png,.webp,.pdf">
                                    </div>
                                </div>
                            </div>

                            <div class="wizard-actions">
                                <button class="btn gray" type="button" data-prev-step="1">Previous</button>
                                <button class="btn" type="button" data-next-step="3">Next</button>
                            </div>
                        </div>

                        <div class="wizard-section hidden-step" data-step="3">
                            <h4>Bank Information</h4>
                            <div class="wizard-grid-2">
                                <div style="grid-column:1/-1;">
                                    <label class="w-label">Account Holder Name *</label>
                                    <input name="bank_account_name" placeholder="Account Holder Name" value="{{ old('bank_account_name') }}">
                                </div>
                                <div>
                                    <label class="w-label">Account Number *</label>
                                    <input name="bank_account_number" placeholder="Account Number" value="{{ old('bank_account_number') }}">
                                </div>
                                <div>
                                    <label class="w-label">Bank Name *</label>
                                    <input name="bank_name" placeholder="Bank Name" value="{{ old('bank_name') }}">
                                </div>
                                <div>
                                    <label class="w-label">IFSC Code *</label>
                                    <input name="bank_ifsc_code" placeholder="IFSC Code" value="{{ old('bank_ifsc_code') }}">
                                </div>
                                <div>
                                    <label class="w-label">Branch Name *</label>
                                    <input name="branch_name" placeholder="Branch Name (optional)" value="{{ old('branch_name') }}">
                                </div>
                                <div style="grid-column:1/-1;">
                                    <label class="w-label">Upload Bank Document</label>
                                    <div class="upload-box">
                                        <input type="file" name="bank_document" accept=".jpg,.jpeg,.png,.webp,.pdf">
                                        <div class="upload-note">Upload canceled cheque/passbook</div>
                                    </div>
                                </div>
                            </div>

                            <div class="wizard-actions">
                                <button class="btn gray" type="button" data-prev-step="2">Previous</button>
                                <button class="btn" type="button" data-next-step="4">Next</button>
                            </div>
                        </div>

                        <div class="wizard-section hidden-step" data-step="4">
                            <h4>Commission Settings</h4>
                            <div class="wizard-grid-2">
                                <div>
                                    <label class="w-label">Commission Rate (%) *</label>
                                    <input type="number" step="0.01" min="0" max="100" name="admin_commission" placeholder="Admin Commission (%)" value="{{ old('admin_commission') }}">
                                </div>
                                <div>
                                    <label class="w-label">Distributor Commission (%) *</label>
                                    <input type="number" step="0.01" min="0" max="100" name="distributor_commission" placeholder="Distributor Commission (%)" value="{{ old('distributor_commission') }}">
                                </div>
                                <div>
                                    <label class="w-label">Mobility Check</label>
                                    <select name="mobility_check">
                                        <option value="low">Mobility Check - Low</option>
                                        <option value="medium">Mobility Check - Medium</option>
                                        <option value="high">Mobility Check - High</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="w-label">Opening Balance</label>
                                    <input type="number" step="0.01" min="0" name="opening_balance" placeholder="Opening Balance" value="{{ old('opening_balance') }}">
                                </div>
                            </div>

                            <p class="note-line"><strong>Note:</strong> Commission settings affect the distributor earnings and limits.</p>
                            <div class="wizard-actions">
                                <button class="btn gray" type="button" data-prev-step="3">Previous</button>
                                <button class="btn green" type="submit">Create User</button>
                            </div>
                        </div>
                    </form>
                    <p class="tiny">After creation, user is redirected to List of Users.</p>
                </section>
            @elseif($userSection === 'roles')
                <section class="cards">
                    <article class="card c6"><span>Master Distributors</span><strong>{{ $masterDistributors->count() }}</strong></article>
                    <article class="card c6"><span>Super Distributors</span><strong>{{ $superDistributors->count() }}</strong></article>
                    <article class="card c5"><span>Distributors</span><strong>{{ $distributors->count() }}</strong></article>
                    <article class="card c2"><span>Retailers</span><strong>{{ $retailers->count() }}</strong></article>
                    <article class="card c1"><span>Total Active</span><strong>{{ $masterDistributors->where('is_active', true)->count() + $superDistributors->where('is_active', true)->count() + $distributors->where('is_active', true)->count() + $retailers->where('is_active', true)->count() }}</strong></article>
                </section>
                <section class="panel">
                    <h3>Role Matrix</h3>
                    <table>
                        <thead><tr><th>Role</th><th>Total Users</th><th>Active Users</th><th>Inactive Users</th></tr></thead>
                        <tbody>
                            <tr><td>Master Distributor</td><td>{{ $masterDistributors->count() }}</td><td>{{ $masterDistributors->where('is_active', true)->count() }}</td><td>{{ $masterDistributors->where('is_active', false)->count() }}</td></tr>
                            <tr><td>Super Distributor</td><td>{{ $superDistributors->count() }}</td><td>{{ $superDistributors->where('is_active', true)->count() }}</td><td>{{ $superDistributors->where('is_active', false)->count() }}</td></tr>
                            <tr><td>Distributor</td><td>{{ $distributors->count() }}</td><td>{{ $distributors->where('is_active', true)->count() }}</td><td>{{ $distributors->where('is_active', false)->count() }}</td></tr>
                            <tr><td>Retailer</td><td>{{ $retailers->count() }}</td><td>{{ $retailers->where('is_active', true)->count() }}</td><td>{{ $retailers->where('is_active', false)->count() }}</td></tr>
                        </tbody>
                    </table>
                </section>
            @else
                @php
                    $allManagedUsers = $masterDistributors
                        ->concat($superDistributors)
                        ->concat($distributors)
                        ->concat($retailers)
                        ->sortBy('id')
                        ->values();
                @endphp
                <section class="panel">
                    <div class="top" style="margin-bottom:0;">
                        <h3 style="margin:0;">List Of Users</h3>
                        <div class="users-toolbar-right">
                            <div class="users-export-wrap">
                                <button id="users-export-btn" class="btn gray" type="button">⎙ Export ▾</button>
                                <div class="users-export-menu" id="users-export-menu">
                                    <button type="button" id="users-export-csv">Export CSV</button>
                                </div>
                            </div>
                            <a class="btn red" href="{{ route('admin.users', ['section' => 'add-user']) }}" style="text-decoration:none;display:inline-block;">⊕ Add User</a>
                        </div>
                    </div>
                </section>
                <section class="panel">
                    <div class="users-toolbar" style="margin-bottom:10px;">
                        <div class="users-toolbar-left">
                            <label>Show
                                <select id="users-page-size">
                                    <option value="10">10</option>
                                    <option value="25" selected>25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                entries
                            </label>
                        </div>
                        <div class="users-toolbar-right">
                            <label>Search:
                                <input id="users-search" type="text" placeholder="Name, email, role, mobile">
                            </label>
                        </div>
                    </div>
                    <table class="users-table" id="users-table">
                        <thead><tr><th>S. No <span class="sort">↕</span></th><th>Photo <span class="sort">↕</span></th><th>Name <span class="sort">↕</span></th><th>Email <span class="sort">↕</span></th><th>Agent ID <span class="sort">↕</span></th><th>Role <span class="sort">↕</span></th><th>Mobile <span class="sort">↕</span></th><th>Status <span class="sort">↕</span></th><th>Action <span class="sort">↕</span></th></tr></thead>
                        <tbody id="users-table-body">
                            @forelse($allManagedUsers as $index => $u)
                                @php
                                    $roleCodeMap = [
                                        'master_distributor' => 'MD',
                                        'super_distributor' => 'SD',
                                        'distributor' => 'DT',
                                        'retailer' => 'RT',
                                        'admin' => 'AD',
                                    ];
                                    $roleCode = $roleCodeMap[$u->role] ?? 'US';
                                    $agentCode = 'XT' . $roleCode . str_pad((string)$u->id, 4, '0', STR_PAD_LEFT);
                                    $photoUrl = $toMediaUrl($u->profile_photo_path);
                                    $businessName = trim((string)($u->business_name ?? ''));
                                @endphp
                                @php
                                    $searchIndex = strtolower(implode(' ', array_filter([
                                        $u->name,
                                        $u->last_name,
                                        $u->email,
                                        $agentCode,
                                        $u->role,
                                        $u->phone,
                                    ])));
                                    $parentUser = $u->distributor;
                                @endphp
                                <tr data-search="{{ $searchIndex }}">
                                    <td class="js-serial">{{ $index + 1 }}</td>
                                    <td>
                                        <div class="user-avatar">
                                            @if($photoUrl)
                                                <img src="{{ $photoUrl }}" alt="{{ $u->name }}">
                                            @else
                                                <span>◌</span>
                                            @endif
                                        </div>
                                    </td>
                                    <td>
                                        <div class="name-block">
                                            <span class="name-main">{{ $u->name }}</span>
                                            @if($businessName !== '')
                                                <span class="name-sub">{{ $businessName }}</span>
                                            @endif
                                        </div>
                                    </td>
                                    <td>{{ $u->email }}</td>
                                    <td>{{ $agentCode }}</td>
                                    <td><span class="role-pill">{{ ucwords(str_replace('_',' ',$u->role)) }}</span></td>
                                    <td>{{ $u->phone ?: '-' }}</td>
                                    <td><span class="status-pill {{ $u->is_active ? '' : 'inactive' }}">{{ $u->is_active ? 'Active' : 'Inactive' }}</span></td>
                                    <td>
                                        <div class="action-icons">
                                            <a class="action-icon action-view" href="{{ route('admin.users.profile', $u->id) }}" title="View">👁</a>
                                            <a class="action-icon action-edit" href="{{ route('admin.users.edit', $u->id) }}" title="Edit">✎</a>
                                            <form method="post" action="{{ route('admin.users.toggle',$u->id) }}">@csrf<button class="action-icon action-toggle" title="{{ $u->is_active ? 'Deactivate' : 'Activate' }}">{{ $u->is_active ? '⏸' : '▶' }}</button></form>
                                            <form method="post" action="{{ route('admin.users.delete',$u->id) }}" onsubmit="return confirm('Delete this user?')">@csrf<button class="action-icon action-delete" title="Delete">🗑</button></form>
                                        </div>
                                    </td>
                                </tr>
                                <tr class="user-row-details" id="user-details-{{ $u->id }}" style="display:none;">
                                    <td colspan="9">
                                        <strong>Profile Details:</strong>
                                        Agent ID: {{ $agentCode }} |
                                        Name: {{ trim(($u->name ?? '') . ' ' . ($u->last_name ?? '')) ?: '-' }} |
                                        Email: {{ $u->email ?: '-' }} |
                                        Role: {{ ucwords(str_replace('_',' ',$u->role)) }} |
                                        Parent: {{ $parentUser?->name ?: '-' }} |
                                        Mobile: {{ $u->phone ?: '-' }} |
                                        Alternate Mobile: {{ $u->alternate_mobile ?: '-' }} |
                                        Business Name: {{ $u->business_name ?: '-' }} |
                                        DOB: {{ $u->date_of_birth ? $u->date_of_birth->format('d-m-Y') : '-' }} |
                                        Address: {{ $u->address ?: '-' }} |
                                        City: {{ $u->city ?: '-' }} |
                                        State: {{ $u->state ?: '-' }} |
                                        KYC ID Number: {{ $u->kyc_id_number ?: '-' }} |
                                        Bank Account Name: {{ $u->bank_account_name ?: '-' }} |
                                        Bank Account Number: {{ $u->bank_account_number ?: '-' }} |
                                        IFSC: {{ $u->bank_ifsc_code ?: '-' }} |
                                        Bank Name: {{ $u->bank_name ?: '-' }} |
                                        Status: {{ $u->is_active ? 'Active' : 'Inactive' }}
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="9" class="users-empty">No users found</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                    <div class="users-pagination">
                        <div class="tiny" id="users-page-info">Showing 0 to 0 of 0 entries</div>
                        <div class="pager">
                            <button type="button" id="users-prev">Previous</button>
                            <button type="button" id="users-next">Next</button>
                        </div>
                    </div>
                </section>

                <div class="password-modal-backdrop" id="password-modal-backdrop">
                    <div class="password-modal">
                        <h4 id="password-modal-title">Edit User</h4>
                        <form method="post" id="password-change-form">
                            @csrf
                            <div class="form-grid-2">
                                <input type="text" name="name" id="edit-user-name" placeholder="Name" required>
                                <input type="email" name="email" id="edit-user-email" placeholder="Email" required>
                                <input type="text" name="phone" id="edit-user-phone" placeholder="Mobile Number" minlength="10" maxlength="10" pattern="[0-9]{10}" required>
                            </div>
                            <div class="actions">
                                <button class="btn gray" type="button" id="password-cancel">Cancel</button>
                                <button class="btn" type="submit">Update User</button>
                            </div>
                        </form>
                    </div>
                </div>
            @endif
        @endif

        @if($tab === 'wallets')
            <section class="panel">
                <h3>Manual Wallet Adjustment</h3>
                <form class="form-grid" method="post" action="{{ route('admin.wallets.adjust') }}">
                    @csrf
                    <select name="wallet_id" required><option value="">Wallet</option>@foreach($allWallets as $w)<option value="{{ $w->id }}">{{ $w->user?->name }} - {{ $w->name }}</option>@endforeach</select>
                    <select name="type" required><option value="add">Add Balance</option><option value="deduct">Deduct Balance</option></select>
                    <input type="number" step="0.01" min="0.01" name="amount" placeholder="Amount" required>
                    <input name="remarks" placeholder="Remarks">
                    <button class="btn" type="submit">Apply Adjustment</button>
                </form>
                <form class="form-grid" method="post" action="{{ route('admin.wallets.force-settlement') }}" style="margin-top:8px;">
                    @csrf
                    <select name="wallet_id" required><option value="">Wallet</option>@foreach($allWallets as $w)<option value="{{ $w->id }}">{{ $w->user?->name }} - {{ $w->name }}</option>@endforeach</select>
                    <input type="number" step="0.01" min="0.01" name="amount" placeholder="Force settlement amount" required>
                    <input name="remarks" placeholder="Settlement remarks">
                    <button class="btn orange" type="submit">Force Settlement</button>
                </form>
            </section>
            <section class="panel">
                <h3>Wallet Ledger / Freeze Control</h3>
                <table><thead><tr><th>ID</th><th>User</th><th>Wallet</th><th>Type</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead><tbody>
                    @forelse($allWallets as $w)
                        <tr>
                            <td>{{ $w->id }}</td><td>{{ $w->user?->email }}</td><td>{{ $w->name }}</td><td>{{ $w->type }}</td><td>₹{{ number_format((float)$w->balance,2) }}</td><td>{{ $w->is_frozen?'Frozen':'Active' }}</td>
                            <td><form method="post" action="{{ route('admin.wallets.toggle',$w->id) }}">@csrf<button class="btn {{ $w->is_frozen?'green':'orange' }}">{{ $w->is_frozen?'Unfreeze':'Freeze' }}</button></form></td>
                        </tr>
                    @empty<tr><td colspan="7">No wallets</td></tr>@endforelse
                </tbody></table>
            </section>
            <section class="panel"><h3>Wallet Adjustment Logs</h3>
                <table><thead><tr><th>Date</th><th>Admin</th><th>User</th><th>Type</th><th>Amount</th><th>Ref</th><th>Remarks</th></tr></thead><tbody>
                    @forelse($walletAdjustments as $l)<tr><td>{{ $l->created_at?->format('d-m H:i') }}</td><td>{{ $l->admin?->email }}</td><td>{{ $l->user?->email }}</td><td>{{ $l->type }}</td><td>₹{{ number_format((float)$l->amount,2) }}</td><td>{{ $l->reference }}</td><td>{{ $l->remarks }}</td></tr>@empty<tr><td colspan="7">No logs</td></tr>@endforelse
                </tbody></table>
            </section>
        @endif

        @if($tab === 'wallet-transfer')
            <section class="panel">
                <h3>Transfer Wallet To Wallet</h3>
                <form class="form-grid" method="post" action="{{ route('admin.wallets.transfer') }}">
                    @csrf
                    <select name="from_wallet_id" required>
                        <option value="">Select Source Wallet</option>
                        @foreach($allWallets as $w)
                            <option value="{{ $w->id }}">{{ $w->user?->name }} - {{ $w->name }} (₹{{ number_format((float)$w->balance,2) }})</option>
                        @endforeach
                    </select>
                    <select name="to_wallet_id" required>
                        <option value="">Select Destination Wallet</option>
                        @foreach($allWallets as $w)
                            <option value="{{ $w->id }}">{{ $w->user?->name }} - {{ $w->name }} (₹{{ number_format((float)$w->balance,2) }})</option>
                        @endforeach
                    </select>
                    <input type="number" step="0.01" min="0.01" name="amount" placeholder="Amount" required>
                    <input name="description" placeholder="Description (optional)">
                    <button class="btn" type="submit">Transfer</button>
                </form>
            </section>

            <section class="panel">
                <h3>Recent Wallet Transfers</h3>
                <table>
                    <thead>
                        <tr><th>Date</th><th>From Wallet</th><th>To Wallet</th><th>Amount</th><th>Ref</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        @forelse(\App\Models\Transaction::with(['fromWallet.user','toWallet.user'])->where('type','transfer')->orderBy('created_at','desc')->limit(50)->get() as $tx)
                            <tr>
                                <td>{{ $tx->created_at?->format('d-m H:i') }}</td>
                                <td>{{ $tx->fromWallet?->user?->name }} - {{ $tx->fromWallet?->name }}</td>
                                <td>{{ $tx->toWallet?->user?->name }} - {{ $tx->toWallet?->name }}</td>
                                <td>₹{{ number_format((float)$tx->amount,2) }}</td>
                                <td>{{ $tx->reference }}</td>
                                <td>{{ ucfirst($tx->status) }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="6">No transfers found</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </section>
        @endif

        @if($tab === 'commissions')
            <section class="row2">
                <article class="panel">
                    <h3>Default Commission %</h3>
                    @foreach(['retailer','distributor','super_distributor','master_distributor','admin'] as $r)
                        @php $cfg = $commissionConfigs->firstWhere('user_role',$r); @endphp
                        <form class="form-grid" method="post" action="{{ route('admin.commissions.default') }}" style="margin-bottom:8px;">
                            @csrf
                            <input type="hidden" name="user_role" value="{{ $r }}">
                            <input value="{{ ucfirst($r) }}" disabled>
                            <input type="number" step="0.01" min="0" max="100" name="admin_commission" value="{{ $cfg?->admin_commission ?? 0 }}" required>
                            <input type="number" step="0.01" min="0" max="100" name="distributor_commission" value="{{ $cfg?->distributor_commission ?? 0 }}" required>
                            <button class="btn" type="submit">Save {{ ucfirst($r) }}</button>
                        </form>
                    @endforeach
                </article>
                <article class="panel">
                    <h3>Commission Override (User-specific)</h3>
                    <form class="form-grid" method="post" action="{{ route('admin.commissions.override') }}">
                        @csrf
                        <select name="user_id" required><option value="">User</option>@foreach($allNonAdminUsers as $u)<option value="{{ $u->id }}">{{ $u->name }} ({{ $u->role }})</option>@endforeach</select>
                        <input type="number" step="0.01" min="0" max="100" name="admin_commission" placeholder="Admin %" required>
                        <input type="number" step="0.01" min="0" max="100" name="distributor_commission" placeholder="Distributor %" required>
                        <select name="is_active"><option value="1">Active</option><option value="0">Inactive</option></select>
                        <button class="btn" type="submit">Save Override</button>
                    </form>
                    <table><thead><tr><th>User</th><th>Admin %</th><th>Distributor %</th><th>Status</th><th>Action</th></tr></thead><tbody>
                        @forelse($commissionOverrides as $o)
                            <tr><td>{{ $o->user?->email }}</td><td>{{ $o->admin_commission }}</td><td>{{ $o->distributor_commission }}</td><td>{{ $o->is_active?'Active':'Inactive' }}</td>
                                <td><form method="post" action="{{ route('admin.commissions.override.delete',$o->id) }}">@csrf<button class="btn red">Delete</button></form></td></tr>
                        @empty<tr><td colspan="5">No overrides</td></tr>@endforelse
                    </tbody></table>
                </article>
            </section>
            <section class="panel"><h3>Commission History</h3>
                <table><thead><tr><th>Date</th><th>User</th><th>Type</th><th>Amount</th><th>Ref</th></tr></thead><tbody>
                    @forelse($recentCommissions as $c)<tr><td>{{ $c->created_at?->format('d-m H:i') }}</td><td>{{ $c->user?->email }}</td><td>{{ ucfirst($c->commission_type) }}</td><td>₹{{ number_format((float)$c->commission_amount,2) }}</td><td>{{ $c->reference }}</td></tr>@empty<tr><td colspan="5">No commissions</td></tr>@endforelse
                </tbody></table>
            </section>
        @endif

        @if($tab === 'withdrawals')
            <section class="panel">
                <h3>Withdraw Settings</h3>
                <form class="form-grid" method="post" action="{{ route('admin.withdrawals.settings') }}">
                    @csrf
                    <select name="withdraw_approval_mode"><option value="auto" {{ $withdrawConfig['withdraw_approval_mode']==='auto'?'selected':'' }}>Auto Approval</option><option value="manual" {{ $withdrawConfig['withdraw_approval_mode']==='manual'?'selected':'' }}>Manual Approval</option></select>
                    <input type="number" step="0.01" min="0" name="withdraw_min_amount" value="{{ $withdrawConfig['withdraw_min_amount'] }}" required>
                    <input type="number" step="0.01" min="0" name="withdraw_max_per_tx" value="{{ $withdrawConfig['withdraw_max_per_tx'] }}" required>
                    <button class="btn" type="submit">Save Withdraw Settings</button>
                </form>
            </section>
            <section class="panel"><h3>Withdraw Requests</h3>
                <table><thead><tr><th>Date</th><th>User</th><th>Amount</th><th>Net</th><th>Status</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>
                    @forelse($withdrawRequests as $wr)
                        <tr>
                            <td>{{ $wr->created_at?->format('d-m H:i') }}</td><td>{{ $wr->user?->email }}</td><td>₹{{ number_format((float)$wr->amount,2) }}</td><td>₹{{ number_format((float)$wr->net_amount,2) }}</td><td>{{ ucfirst($wr->status) }}</td><td>{{ $wr->remarks }}</td>
                            <td>
                                @if(in_array($wr->status,['pending','approved']))
                                    <div class="inline">
                                        <form method="post" action="{{ route('admin.withdrawals.approve',$wr->id) }}">@csrf<input name="remarks" placeholder="Remark"><button class="btn green">Approve</button></form>
                                        <form method="post" action="{{ route('admin.withdrawals.reject',$wr->id) }}">@csrf<input name="remarks" placeholder="Remark"><button class="btn red">Reject</button></form>
                                    </div>
                                @else
                                    -
                                @endif
                            </td>
                        </tr>
                    @empty<tr><td colspan="7">No withdraw requests</td></tr>@endforelse
                </tbody></table>
            </section>
        @endif

        @if($tab === 'transactions')
            <section class="panel">
                <form class="inline" method="get" action="{{ route('admin.transactions') }}">
                    <input name="q" value="{{ $search }}" placeholder="Search by user/reference/description">
                    <select name="type"><option value="">All commission types</option><option value="admin" {{ $typeFilter==='admin'?'selected':'' }}>Admin</option><option value="master_distributor" {{ $typeFilter==='master_distributor'?'selected':'' }}>Master Distributor</option><option value="super_distributor" {{ $typeFilter==='super_distributor'?'selected':'' }}>Super Distributor</option><option value="distributor" {{ $typeFilter==='distributor'?'selected':'' }}>Distributor</option></select>
                    <button class="btn" type="submit">Apply</button>
                    <a class="btn green" href="{{ route('admin.transactions.export') }}" style="text-decoration:none;display:inline-block;">Export CSV</a>
                </form>
            </section>
            <section class="row2">
                <article class="panel"><h3>Withdraw Transactions</h3><table><thead><tr><th>Date</th><th>User</th><th>Amount</th><th>Status</th><th>Ref</th></tr></thead><tbody>
                    @forelse($recentWithdrawals as $w)<tr><td>{{ $w->created_at?->format('d-m H:i') }}</td><td>{{ $w->user?->email }}</td><td>₹{{ number_format((float)$w->amount,2) }}</td><td>{{ ucfirst($w->status) }}</td><td>{{ $w->reference }}</td></tr>@empty<tr><td colspan="5">No transactions</td></tr>@endforelse
                </tbody></table></article>
                <article class="panel"><h3>Commission Transactions</h3><table><thead><tr><th>Date</th><th>User</th><th>Type</th><th>Amount</th><th>Ref</th></tr></thead><tbody>
                    @forelse($recentCommissions as $c)<tr><td>{{ $c->created_at?->format('d-m H:i') }}</td><td>{{ $c->user?->email }}</td><td>{{ ucwords(str_replace('_', ' ', $c->commission_type)) }}</td><td>₹{{ number_format((float)$c->commission_amount,2) }}</td><td>{{ $c->reference }}</td></tr>@empty<tr><td colspan="5">No commissions</td></tr>@endforelse
                </tbody></table></article>
            </section>
        @endif

        @if($tab === 'reports')
            <section class="cards">
                <article class="card c1"><span>Total Withdraw Today</span><strong>₹{{ number_format($stats['total_withdraw_today'],2) }}</strong></article>
                <article class="card c2"><span>Total Commission Today</span><strong>₹{{ number_format($stats['total_commission_today'],2) }}</strong></article>
                <article class="card c5"><span>Active Users</span><strong>{{ $stats['active_users_count'] }}</strong></article>
                <article class="card c3"><span>Export</span><strong><a href="{{ route('admin.transactions.export') }}" style="color:#fff;text-decoration:underline;">CSV</a> / PDF*</strong></article>
            </section>
            <section class="panel">
                <h3>Monthly Revenue (Commission)</h3>
                <table><thead><tr><th>Month</th><th>Revenue</th></tr></thead><tbody>
                    @foreach($monthlyRevenue as $month => $value)<tr><td>{{ $month }}</td><td>₹{{ number_format($value,2) }}</td></tr>@endforeach
                </tbody></table>
                <p class="tiny">*PDF can be generated using browser print to PDF.</p>
            </section>
        @endif

        @if($tab === 'logs')
            <section class="row2">
                <article class="panel"><h3>Admin Action Logs</h3>
                    <table><thead><tr><th>Date</th><th>Admin</th><th>Action</th><th>Target</th><th>IP</th></tr></thead><tbody>
                        @forelse($adminLogs as $l)<tr><td>{{ $l->created_at?->format('d-m H:i') }}</td><td>{{ $l->admin?->email }}</td><td>{{ $l->action }}</td><td>{{ $l->target_type }}#{{ $l->target_id }}</td><td>{{ $l->ip_address }}</td></tr>@empty<tr><td colspan="5">No admin logs</td></tr>@endforelse
                    </tbody></table>
                </article>
                <article class="panel"><h3>Login Activity (Recent)</h3>
                    <table><thead><tr><th>Date</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>
                        @foreach(\App\Models\User::orderBy('updated_at','desc')->limit(30)->get() as $u)<tr><td>{{ $u->updated_at?->format('d-m H:i') }}</td><td>{{ $u->email }}</td><td>{{ $u->role }}</td><td>{{ $u->is_active?'Active':'Inactive' }}</td></tr>@endforeach
                    </tbody></table>
                </article>
            </section>
        @endif

        @if($tab === 'security')
            <section class="panel">
                <h3>Security Controls</h3>
                <form class="form-grid" method="post" action="{{ route('admin.security.settings') }}">
                    @csrf
                    <select name="security_2fa_enforced"><option value="0" {{ $security['security_2fa_enforced']=='0'?'selected':'' }}>2FA Optional</option><option value="1" {{ $security['security_2fa_enforced']=='1'?'selected':'' }}>2FA Enforced</option></select>
                    <input name="security_ip_restriction" value="{{ $security['security_ip_restriction'] }}" placeholder="Allowed IPs comma separated">
                    <input type="number" min="10" max="10000" name="security_rate_limit_per_minute" value="{{ $security['security_rate_limit_per_minute'] }}" placeholder="Rate limit per minute">
                    <input type="number" min="8" max="64" name="security_min_password_length" value="{{ $security['security_min_password_length'] }}" placeholder="Min password length">
                    <button class="btn" type="submit">Save Security Settings</button>
                </form>
            </section>
            <section class="panel"><h3>Current Security Policy</h3>
                <ul>
                    <li>2FA Enforcement: {{ $security['security_2fa_enforced']=='1' ? 'Enabled' : 'Disabled' }}</li>
                    <li>IP Restriction: {{ $security['security_ip_restriction'] ?: 'Not configured' }}</li>
                    <li>Rate Limit Per Minute: {{ $security['security_rate_limit_per_minute'] }}</li>
                    <li>Password Minimum Length: {{ $security['security_min_password_length'] }}</li>
                </ul>
            </section>
        @endif

        @if($tab === 'profile')
            <section class="panel">
                <h3>Profile Photo</h3>
                <div class="admin-photo-card">
                    <div class="admin-photo-left">
                        <div class="admin-photo-preview">
                            @if($adminPhotoUrl)
                                <img src="{{ $adminPhotoUrl }}" alt="Admin profile photo">
                            @else
                                <span>{{ $adminInitials }}</span>
                            @endif
                        </div>
                        <div class="tiny">Upload JPG, JPEG, PNG, or WEBP (max 5MB)</div>
                    </div>
                    <form class="admin-photo-form" method="post" action="{{ route('admin.profile.photo') }}" enctype="multipart/form-data">
                        @csrf
                        <input type="file" name="profile_photo" accept=".jpg,.jpeg,.png,.webp" required>
                        <button class="btn" type="submit">Update Photo</button>
                    </form>
                </div>
            </section>
            <section class="row3">
                <article class="panel"><h3>Name</h3><p>{{ $admin?->name }}</p></article>
                <article class="panel"><h3>Email</h3><p>{{ $admin?->email }}</p></article>
                <article class="panel"><h3>Phone</h3><p>{{ $admin?->phone ?: '-' }}</p></article>
                <article class="panel"><h3>DOB</h3><p>{{ $admin?->date_of_birth ? $admin->date_of_birth->format('d-m-Y') : '-' }}</p></article>
                <article class="panel"><h3>Main Wallet</h3><p>₹{{ number_format((float)($adminMainWallet?->balance ?? 0),2) }}</p></article>
                <article class="panel"><h3>Status</h3><p>{{ $admin?->is_active ? 'Active' : 'Inactive' }}</p></article>
            </section>
        @endif

        @if($tab === 'users' && $userSection === 'users')
            <script>
                (function () {
                    const tableBody = document.getElementById('users-table-body');
                    if (!tableBody) return;

                    const searchInput = document.getElementById('users-search');
                    const pageSizeSelect = document.getElementById('users-page-size');
                    const prevBtn = document.getElementById('users-prev');
                    const nextBtn = document.getElementById('users-next');
                    const info = document.getElementById('users-page-info');
                    const exportBtn = document.getElementById('users-export-btn');
                    const exportMenu = document.getElementById('users-export-menu');
                    const exportCsvBtn = document.getElementById('users-export-csv');

                    const rows = Array.from(tableBody.querySelectorAll('tr')).filter((row) => !row.classList.contains('user-row-details'));
                    const detailsRows = new Map();
                    rows.forEach((row) => {
                        const viewBtn = row.querySelector('.js-view-user');
                        if (viewBtn?.dataset.target) {
                            const details = document.getElementById(viewBtn.dataset.target);
                            if (details) detailsRows.set(row, details);
                        }
                    });

                    let currentPage = 1;
                    let pageSize = Number(pageSizeSelect.value || 25);

                    const normalizedText = (value) => (value || '').toLowerCase();

                    const getFilteredRows = () => {
                        const q = normalizedText(searchInput.value.trim());
                        if (!q) return rows;
                        return rows.filter((row) => {
                            const explicitSearch = normalizedText(row.dataset.search || '');
                            if (explicitSearch.includes(q)) return true;
                            return normalizedText(row.textContent).includes(q);
                        });
                    };

                    const render = () => {
                        const filtered = getFilteredRows();
                        const total = filtered.length;
                        const totalPages = Math.max(1, Math.ceil(total / pageSize));
                        if (currentPage > totalPages) currentPage = totalPages;

                        const start = (currentPage - 1) * pageSize;
                        const end = Math.min(start + pageSize, total);

                        rows.forEach((row) => {
                            row.style.display = 'none';
                            const details = detailsRows.get(row);
                            if (details) details.style.display = 'none';
                        });

                        filtered.slice(start, end).forEach((row, idx) => {
                            row.style.display = '';
                            const serialCell = row.querySelector('.js-serial');
                            if (serialCell) serialCell.textContent = String(start + idx + 1);
                        });

                        const from = total === 0 ? 0 : start + 1;
                        info.textContent = 'Showing ' + from + ' to ' + end + ' of ' + total + ' entries';
                        prevBtn.disabled = currentPage <= 1;
                        nextBtn.disabled = currentPage >= totalPages;
                    };

                    searchInput.addEventListener('input', () => {
                        currentPage = 1;
                        render();
                    });

                    pageSizeSelect.addEventListener('change', () => {
                        pageSize = Number(pageSizeSelect.value || 25);
                        currentPage = 1;
                        render();
                    });

                    prevBtn.addEventListener('click', () => {
                        if (currentPage > 1) {
                            currentPage -= 1;
                            render();
                        }
                    });

                    nextBtn.addEventListener('click', () => {
                        const totalPages = Math.max(1, Math.ceil(getFilteredRows().length / pageSize));
                        if (currentPage < totalPages) {
                            currentPage += 1;
                            render();
                        }
                    });

                    document.querySelectorAll('.js-view-user').forEach((button) => {
                        button.addEventListener('click', () => {
                            const targetId = button.dataset.target;
                            if (!targetId) return;
                            const details = document.getElementById(targetId);
                            if (!details) return;
                            details.style.display = details.style.display === 'none' ? '' : 'none';
                        });
                    });

                    const passwordBackdrop = document.getElementById('password-modal-backdrop');
                    const passwordTitle = document.getElementById('password-modal-title');
                    const passwordForm = document.getElementById('password-change-form');
                    const passwordCancel = document.getElementById('password-cancel');
                    const editUserName = document.getElementById('edit-user-name');
                    const editUserEmail = document.getElementById('edit-user-email');
                    const editUserPhone = document.getElementById('edit-user-phone');

                    const closePasswordModal = () => {
                        passwordBackdrop.style.display = 'none';
                        passwordForm.reset();
                    };

                    document.querySelectorAll('.js-edit-user').forEach((button) => {
                        button.addEventListener('click', () => {
                            const userId = button.dataset.userId;
                            const userName = button.dataset.userName || 'User';
                            const userEmail = button.dataset.userEmail || '';
                            const userPhone = button.dataset.userPhone || '';
                            if (!userId) return;
                            passwordTitle.textContent = 'Edit User - ' + userName;
                            passwordForm.action = '/admin/users/' + userId + '/update';
                            editUserName.value = userName;
                            editUserEmail.value = userEmail;
                            editUserPhone.value = userPhone;
                            passwordBackdrop.style.display = 'flex';
                        });
                    });

                    passwordCancel.addEventListener('click', closePasswordModal);
                    passwordBackdrop.addEventListener('click', (event) => {
                        if (event.target === passwordBackdrop) closePasswordModal();
                    });

                    exportBtn.addEventListener('click', () => {
                        exportMenu.style.display = exportMenu.style.display === 'block' ? 'none' : 'block';
                    });

                    document.addEventListener('click', (event) => {
                        const inside = exportBtn.contains(event.target) || exportMenu.contains(event.target);
                        if (!inside) exportMenu.style.display = 'none';
                    });

                    const csvEscape = (value) => {
                        const text = String(value ?? '');
                        return '"' + text.replaceAll('"', '""') + '"';
                    };

                    exportCsvBtn.addEventListener('click', () => {
                        const filtered = getFilteredRows();
                        const csvRows = [];
                        csvRows.push(['S.No', 'Name', 'Email', 'Agent ID', 'Role', 'Mobile', 'Status']);

                        filtered.forEach((row, idx) => {
                            const cells = row.querySelectorAll('td');
                            csvRows.push([
                                String(idx + 1),
                                cells[2]?.innerText.trim() || '',
                                cells[3]?.innerText.trim() || '',
                                cells[4]?.innerText.trim() || '',
                                cells[5]?.innerText.trim() || '',
                                cells[6]?.innerText.trim() || '',
                                cells[7]?.innerText.trim() || '',
                            ]);
                        });

                        const csvContent = csvRows
                            .map((row) => row.map((value) => csvEscape(value)).join(','))
                            .join('\n');

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'users-export.csv';
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        URL.revokeObjectURL(link.href);
                        link.remove();
                        exportMenu.style.display = 'none';
                    });

                    render();
                })();
            </script>
        @endif

        @if($tab === 'users' && $userSection === 'add-user')
            <script>
                (function () {
                    const form = document.getElementById('add-user-wizard-form');
                    if (!form) return;

                    const sections = Array.from(form.querySelectorAll('.wizard-section[data-step]'));
                    const stepPills = Array.from(document.querySelectorAll('#add-user-steps .wizard-step'));
                    let currentStep = {{ $errors->any() ? 1 : 1 }};

                    const showStep = (step) => {
                        currentStep = step;
                        sections.forEach((section) => {
                            const sectionStep = Number(section.dataset.step || 1);
                            section.classList.toggle('hidden-step', sectionStep !== step);
                        });
                        stepPills.forEach((pill) => {
                            const pillStep = Number(pill.dataset.step || 1);
                            pill.classList.toggle('active', pillStep === step);
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    };

                    const validateStep = (step) => {
                        const section = sections.find((item) => Number(item.dataset.step || 1) === step);
                        if (!section) return true;

                        const requiredFields = Array.from(section.querySelectorAll('[required]'));
                        for (const field of requiredFields) {
                            if (!field.checkValidity()) {
                                field.reportValidity();
                                return false;
                            }
                        }
                        return true;
                    };

                    form.querySelectorAll('[data-next-step]').forEach((button) => {
                        button.addEventListener('click', () => {
                            const next = Number(button.getAttribute('data-next-step') || currentStep + 1);
                            if (!validateStep(currentStep)) return;
                            showStep(next);
                        });
                    });

                    form.querySelectorAll('[data-prev-step]').forEach((button) => {
                        button.addEventListener('click', () => {
                            const prev = Number(button.getAttribute('data-prev-step') || currentStep - 1);
                            showStep(prev);
                        });
                    });

                    stepPills.forEach((pill) => {
                        pill.addEventListener('click', () => {
                            const target = Number(pill.dataset.step || 1);
                            if (target > currentStep && !validateStep(currentStep)) return;
                            showStep(target);
                        });
                    });

                    showStep(currentStep);
                })();
            </script>
        @endif
    </main>
</div>
<script>
    (function () {
        const wrap = document.getElementById('profile-wrap');
        const toggle = document.getElementById('profile-toggle');
        if (!wrap || !toggle) return;

        const close = () => {
            wrap.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = wrap.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', (event) => {
            if (!wrap.contains(event.target)) close();
        });
    })();
</script>
</body>
</html>
