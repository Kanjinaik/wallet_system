<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin {{ $mode === 'login' ? 'Login' : 'Register' }}</title>
    <style>
        body { margin: 0; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background: radial-gradient(circle at top left, #e8eefc, #f6f8ff); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { width: min(460px, 92vw); background: #fff; border-radius: 18px; box-shadow: 0 18px 48px rgba(12, 41, 102, .16); overflow: hidden; }
        .head { padding: 20px 24px; background: linear-gradient(140deg, #1250b3, #2a84f4); color: #fff; }
        .head h1 { margin: 0; font-size: 24px; }
        .head p { margin: 6px 0 0 0; opacity: .9; }
        .body { padding: 20px 24px 24px; }
        .row { display: grid; gap: 10px; margin-bottom: 10px; }
        label { font-size: 13px; color: #495a7a; }
        input { width: 100%; box-sizing: border-box; border: 1px solid #d9e3f4; border-radius: 10px; padding: 11px 12px; font-size: 15px; }
        .btn { width: 100%; border: 0; border-radius: 10px; padding: 12px; font-size: 15px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #1154c6, #2d86f8); cursor: pointer; margin-top: 8px; }
        .switch { margin-top: 12px; text-align: center; font-size: 14px; }
        .switch a { color: #1b64d2; text-decoration: none; }
        .alert { padding: 10px 12px; border-radius: 10px; font-size: 14px; margin-bottom: 12px; }
        .alert.error { background: #ffe7e7; color: #a11f1f; }
        .alert.success { background: #e6f8ed; color: #126539; }
    </style>
</head>
<body>
<div class="card">
    <div class="head">
        <h1>Admin {{ $mode === 'login' ? 'Login' : 'Register' }}</h1>
        <p>Secure backend access for wallet monitoring</p>
    </div>
    <div class="body">
        @if(session('error'))
            <div class="alert error">{{ session('error') }}</div>
        @endif
        @if(session('success'))
            <div class="alert success">{{ session('success') }}</div>
        @endif
        @if($errors->any())
            <div class="alert error">{{ $errors->first() }}</div>
        @endif

        <form method="post" action="{{ $mode === 'login' ? route('admin.login') : route('admin.register') }}">
            @csrf
            @if($mode === 'register')
                <div class="row">
                    <label>Name</label>
                    <input name="name" value="{{ old('name') }}" required>
                </div>
                <div class="row">
                    <label>Phone</label>
                    <input name="phone" value="{{ old('phone') }}">
                </div>
                <div class="row">
                    <label>Date of Birth</label>
                    <input type="date" name="date_of_birth" value="{{ old('date_of_birth') }}">
                </div>
            @endif

            <div class="row">
                <label>Email</label>
                <input type="email" name="email" value="{{ old('email') }}" required>
            </div>
            <div class="row">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            @if($mode === 'register')
                <div class="row">
                    <label>Confirm Password</label>
                    <input type="password" name="password_confirmation" required>
                </div>
            @endif

            <button class="btn" type="submit">{{ $mode === 'login' ? 'Login' : 'Create Admin Account' }}</button>
        </form>

        <div class="switch">
            @if($mode === 'login')
                New admin? <a href="{{ route('admin.register.form') }}">Register</a>
            @else
                Already have admin account? <a href="{{ route('admin.login.form') }}">Login</a>
            @endif
        </div>
    </div>
</div>
</body>
</html>
