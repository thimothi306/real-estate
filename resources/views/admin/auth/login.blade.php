<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sign in — Kavuri Estates Admin</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #12161d; color: #1a1d23; font-size: 14px;
        }
        .box { width: 100%; max-width: 380px; padding: 20px; }
        .brand { text-align: center; color: #fff; margin-bottom: 22px; }
        .brand h1 { margin: 0; font-size: 21px; }
        .brand p { margin: 4px 0 0; color: #7d8798; font-size: 13px; }
        .card { background: #fff; border-radius: 10px; padding: 26px; }
        label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; }
        input {
            width: 100%; padding: 9px 12px; border: 1px solid #e2e5ea;
            border-radius: 6px; font-size: 14px; font-family: inherit; margin-bottom: 15px;
        }
        input:focus { outline: 2px solid #1f6feb; outline-offset: -1px; border-color: #1f6feb; }
        button {
            width: 100%; padding: 10px; background: #1f6feb; color: #fff;
            border: none; border-radius: 6px; font-size: 14px; font-weight: 600;
            cursor: pointer; font-family: inherit;
        }
        button:hover { background: #1a5bc4; }
        .error { background: #fdeceb; color: #b42318; padding: 10px 13px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }
        .remember { display: flex; align-items: center; gap: 7px; margin-bottom: 17px; font-size: 13px; }
        .remember input { width: auto; margin: 0; }
    </style>
</head>
<body>
<div class="box">
    <div class="brand">
        <h1>Kavuri Estates</h1>
        <p>Administrator sign in</p>
    </div>
    <div class="card">
        @if($errors->any())
            <div class="error">{{ $errors->first() }}</div>
        @endif
        <form method="POST" action="{{ route('admin.login.submit') }}">
            @csrf
            <label for="email">Email address</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="username">

            <label for="password">Password</label>
            <input id="password" type="password" name="password" required autocomplete="current-password">

            <div class="remember">
                <input id="remember" type="checkbox" name="remember" value="1">
                <label for="remember" style="margin:0;font-weight:400">Keep me signed in</label>
            </div>

            <button type="submit">Sign in</button>
        </form>
    </div>
</div>
</body>
</html>
