<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') — Kavuri Estates Admin</title>
    <style>
        :root {
            --bg: #f5f7fb;
            --surface: #ffffff;
            --surface-alt: #f0f3f8;
            --border: #e5e9f0;
            --text: #101828;
            --muted: #667085;
            --faint: #98a2b3;

            --navy: #0d1b33;
            --navy-soft: #16305b;
            --navy-tint: #e8edf7;
            --gold: #c9a961;

            --primary: #16305b;
            --primary-bg: #e8edf7;
            --success: #17803d;
            --success-bg: #e8f5ec;
            --danger: #b42318;
            --danger-bg: #fdeceb;
            --warning: #a15c07;
            --warning-bg: #fdf3e3;
            --info: #175cd3;
            --info-bg: #eaf1fe;
            --purple: #6d3fc0;
            --purple-bg: #f1ecfd;

            --sidebar-w: 248px;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            font-size: 14px;
            line-height: 1.5;
        }
        a { color: var(--primary); text-decoration: none; }
        a:hover { text-decoration: none; }

        /* ---- Layout shell ---- */
        .layout { display: flex; min-height: 100vh; }

        /* ---- Sidebar ---- */
        .sidebar {
            width: var(--sidebar-w);
            background: var(--navy);
            color: rgba(255,255,255,0.72);
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
        }
        .sidebar::-webkit-scrollbar { width: 6px; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
        .brand {
            display: flex; align-items: center; gap: 10px;
            padding: 20px 20px 18px;
        }
        .brand-mark {
            width: 34px; height: 34px; border-radius: 9px;
            border: 1.5px solid var(--gold);
            display: flex; align-items: center; justify-content: center;
            font-size: 16px;
        }
        .brand-name { font-weight: 800; font-size: 15px; color: #fff; letter-spacing: 1.5px; line-height: 1.1; }
        .brand-sub { font-size: 8.5px; color: var(--gold); letter-spacing: 3px; font-weight: 700; }
        .nav-group { padding: 6px 0 2px; }
        .nav-group-label {
            padding: 12px 20px 6px;
            font-size: 10px; font-weight: 700; letter-spacing: 1.1px;
            color: rgba(255,255,255,0.35); text-transform: uppercase;
        }
        .sidebar nav a {
            display: flex; align-items: center; gap: 11px;
            padding: 9px 20px;
            color: rgba(255,255,255,0.72);
            font-size: 13.5px;
        }
        .sidebar nav a .ico { width: 18px; text-align: center; font-size: 14px; opacity: .9; }
        .sidebar nav a .label { flex: 1; }
        .sidebar nav a:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .sidebar nav a.active { background: var(--navy-soft); color: #fff; font-weight: 600; }
        .sidebar nav a.active .ico { opacity: 1; }
        .nav-count {
            background: rgba(255,255,255,0.14); color: #fff;
            font-size: 10.5px; font-weight: 700;
            padding: 1px 7px; border-radius: 20px;
        }
        .nav-count.hot { background: var(--gold); color: var(--navy); }
        .sidebar-foot { margin-top: auto; padding: 16px; }
        .promo {
            background: linear-gradient(160deg, var(--navy-soft), #1e3f76);
            border-radius: 12px; padding: 14px; text-align: center;
        }
        .promo h4 { margin: 6px 0 4px; font-size: 13px; color: #fff; }
        .promo p { margin: 0 0 10px; font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.4; }
        .promo .btn-promo {
            display: block; background: var(--gold); color: var(--navy);
            font-weight: 700; font-size: 12px; padding: 8px; border-radius: 8px;
        }

        /* ---- Main column ---- */
        .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .topbar {
            display: flex; align-items: center; gap: 16px;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 12px 24px;
            position: sticky; top: 0; z-index: 20;
        }
        .topbar-search {
            flex: 1; max-width: 520px; position: relative;
        }
        .topbar-search input {
            width: 100%; border: 1px solid var(--border); background: var(--bg);
            border-radius: 24px; padding: 9px 14px 9px 38px;
            font-size: 13.5px; font-family: inherit; color: var(--text);
        }
        .topbar-search input:focus { outline: none; border-color: var(--primary); background: #fff; }
        .topbar-search .search-ico {
            position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
            font-size: 13px; color: var(--faint);
        }
        .topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .icon-btn {
            position: relative; width: 36px; height: 36px; border-radius: 50%;
            border: none; background: transparent; cursor: pointer;
            display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .icon-btn:hover { background: var(--surface-alt); }
        .icon-btn .dot {
            position: absolute; top: 2px; right: 2px;
            min-width: 16px; height: 16px; padding: 0 4px;
            background: var(--danger); color: #fff;
            border-radius: 9px; font-size: 9.5px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
        }
        .admin-chip { display: flex; align-items: center; gap: 9px; padding-left: 10px; margin-left: 4px; border-left: 1px solid var(--border); }
        .admin-avatar {
            width: 36px; height: 36px; border-radius: 50%;
            background: var(--navy-soft); color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 14px;
        }
        .admin-meta strong { display: block; font-size: 13px; line-height: 1.2; }
        .admin-meta small { color: var(--muted); font-size: 11px; }
        .content { padding: 24px; flex: 1; }

        /* ---- Page header ---- */
        .page-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .page-head h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
        .page-head p { margin: 3px 0 0; color: var(--muted); font-size: 13.5px; }
        .page-head .spacer { margin-left: auto; }

        /* ---- Cards ---- */
        .card {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 14px; margin-bottom: 18px; overflow: hidden;
        }
        .card-header {
            padding: 15px 18px; border-bottom: 1px solid var(--border);
            font-weight: 700; font-size: 14.5px;
            display: flex; align-items: center; gap: 12px;
        }
        .card-header .spacer { margin-left: auto; }
        .card-header a { font-size: 12.5px; font-weight: 600; }
        .card-body { padding: 18px; }

        /* ---- Grid ---- */
        .grid { display: grid; gap: 18px; margin-bottom: 18px; }
        .grid-5 { grid-template-columns: repeat(5, 1fr); }
        .grid-4 { grid-template-columns: repeat(4, 1fr); }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-2-1 { grid-template-columns: 2fr 1fr; }
        .grid-3-1 { grid-template-columns: 3fr 1.15fr; }

        /* ---- KPI ---- */
        .kpi {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 14px; padding: 16px;
            display: flex; align-items: flex-start; gap: 13px;
        }
        .kpi-ico {
            width: 44px; height: 44px; border-radius: 11px;
            display: flex; align-items: center; justify-content: center;
            font-size: 19px; flex-shrink: 0;
        }
        .kpi-label { font-size: 12.5px; color: var(--muted); font-weight: 600; }
        .kpi-value { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-top: 1px; }
        .kpi-delta { font-size: 11.5px; font-weight: 700; margin-top: 3px; }
        .kpi-delta.up { color: var(--success); }
        .kpi-delta.down { color: var(--danger); }
        .kpi-delta span { color: var(--faint); font-weight: 500; }

        /* ---- Tables ---- */
        table { width: 100%; border-collapse: collapse; }
        th {
            text-align: left; padding: 11px 18px;
            font-size: 11px; font-weight: 700; color: var(--muted);
            text-transform: uppercase; letter-spacing: .5px;
            border-bottom: 1px solid var(--border); background: var(--surface-alt);
        }
        td { padding: 12px 18px; border-bottom: 1px solid var(--border); font-size: 13.5px; vertical-align: middle; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover { background: var(--surface-alt); }
        .thumb { width: 42px; height: 42px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border); display: block; }
        .thumb-empty {
            display: flex; align-items: center; justify-content: center;
            background: var(--surface-alt); color: var(--faint); font-size: 14px;
        }
        .cell-strong { font-weight: 600; }
        .cell-sub { color: var(--muted); font-size: 12px; }

        /* ---- Buttons ---- */
        .btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 7px 13px; border-radius: 8px;
            border: 1px solid var(--border); background: var(--surface);
            font-size: 13px; cursor: pointer; font-family: inherit; color: var(--text);
        }
        .btn:hover { background: var(--surface-alt); }
        .btn-primary { background: var(--primary); border-color: var(--primary); color: #fff; }
        .btn-primary:hover { background: var(--navy); color: #fff; }
        .btn-gold { background: var(--gold); border-color: var(--gold); color: var(--navy); font-weight: 700; }
        .btn-success { background: var(--success); border-color: var(--success); color: #fff; }
        .btn-danger { background: var(--danger); border-color: var(--danger); color: #fff; }
        .btn-sm { padding: 5px 9px; font-size: 12px; }
        .btn-icon { padding: 5px 8px; }

        /* ---- Badges ---- */
        .badge-status {
            display: inline-block; padding: 3px 10px; border-radius: 20px;
            font-size: 11.5px; font-weight: 600;
        }
        .st-published, .st-active, .st-confirmed, .st-completed, .st-verified { background: var(--success-bg); color: var(--success); }
        .st-pending_review, .st-pending, .st-quoted { background: var(--warning-bg); color: var(--warning); }
        .st-rejected, .st-suspended, .st-archived, .st-failed, .st-cancelled { background: var(--danger-bg); color: var(--danger); }
        .st-draft, .st-dismissed, .st-reviewed, .st-expired, .st-open { background: var(--surface-alt); color: var(--muted); }

        /* ---- Charts (pure CSS/SVG, no JS libraries) ---- */
        .legend { display: flex; flex-direction: column; gap: 9px; }
        .legend-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
        .legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .legend-name { color: var(--muted); }
        .legend-val { margin-left: auto; font-weight: 700; font-size: 12.5px; }
        .donut-wrap { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .donut { position: relative; width: 168px; height: 168px; flex-shrink: 0; }
        .donut-center {
            position: absolute; inset: 0; display: flex; flex-direction: column;
            align-items: center; justify-content: center; pointer-events: none;
        }
        .donut-total { font-size: 21px; font-weight: 800; letter-spacing: -0.5px; }
        .donut-caption { font-size: 11px; color: var(--muted); }

        .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 11px; font-size: 13px; }
        .bar-name { width: 108px; color: var(--muted); flex-shrink: 0; }
        .bar-track { flex: 1; height: 9px; background: var(--surface-alt); border-radius: 5px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 5px; }
        .bar-val { width: 52px; text-align: right; font-weight: 700; font-size: 12.5px; }

        /* ---- Activity / alerts ---- */
        .feed { display: flex; flex-direction: column; }
        .feed-item { display: flex; gap: 11px; padding: 11px 18px; border-bottom: 1px solid var(--border); }
        .feed-item:last-child { border-bottom: none; }
        .feed-ico {
            width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; font-size: 14px;
        }
        .feed-text { flex: 1; font-size: 13px; line-height: 1.45; }
        .feed-text small { display: block; color: var(--muted); font-size: 11.5px; }
        .feed-time { color: var(--faint); font-size: 11px; white-space: nowrap; }

        /* ---- Quick actions ---- */
        .qa-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 11px; }
        .qa {
            border: 1px solid var(--border); border-radius: 11px;
            padding: 14px 8px; text-align: center; color: var(--text);
            display: flex; flex-direction: column; align-items: center; gap: 7px;
        }
        .qa:hover { border-color: var(--primary); background: var(--primary-bg); }
        .qa .qa-ico { font-size: 18px; }
        .qa span { font-size: 11.5px; font-weight: 600; line-height: 1.25; }

        /* ---- Misc ---- */
        .filters { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
        .field label { display: block; font-size: 11.5px; font-weight: 600; color: var(--muted); margin-bottom: 4px; }
        .field input, .field select {
            padding: 8px 11px; border: 1px solid var(--border); border-radius: 8px;
            font-size: 13px; font-family: inherit; background: var(--surface); color: var(--text); min-width: 160px;
        }
        .alert { padding: 11px 15px; border-radius: 9px; margin-bottom: 18px; font-size: 13.5px; }
        .alert-success { background: var(--success-bg); color: var(--success); }
        .alert-danger { background: var(--danger-bg); color: var(--danger); }
        .muted { color: var(--muted); }
        .empty { padding: 44px 18px; text-align: center; color: var(--muted); }
        .pagination { padding: 14px 18px; }
        .pagination svg { display: none; }
        .pagination a, .pagination span { padding: 5px 9px; font-size: 12.5px; }
        .rank { width: 22px; color: var(--faint); font-weight: 700; font-size: 12px; }
        .avatar-sm {
            width: 30px; height: 30px; border-radius: 50%;
            background: var(--navy-tint); color: var(--primary);
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 700; flex-shrink: 0;
        }

        @media (max-width: 1280px) {
            .grid-5 { grid-template-columns: repeat(3, 1fr); }
            .grid-3-1, .grid-2-1 { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
            .sidebar { display: none; }
            .grid-5, .grid-4, .grid-3, .grid-2 { grid-template-columns: repeat(2, 1fr); }
            .content { padding: 16px; }
        }
        @media (max-width: 640px) {
            .grid-5, .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
            .admin-meta { display: none; }
        }
    </style>
    @stack('styles')
</head>
<body>
@php
    $navSections = [
        ['label' => null, 'items' => [
            ['route' => 'admin.dashboard', 'icon' => '▦', 'label' => 'Dashboard'],
        ]],
        ['label' => 'Manage', 'items' => [
            ['route' => 'admin.users.index', 'icon' => '👤', 'label' => 'Users'],
            ['route' => 'admin.properties.index', 'icon' => '🏠', 'label' => 'Properties'],
            ['route' => 'admin.partners.index', 'icon' => '🤝', 'label' => 'Partners', 'count' => $pendingPartnerCount ?? 0],
            ['route' => 'admin.services.index', 'icon' => '🛠', 'label' => 'Services'],
        ]],
        ['label' => 'Transactions', 'items' => [
            ['route' => 'admin.inquiries.index', 'icon' => '💬', 'label' => 'Inquiries', 'count' => $newLeadCount ?? 0],
            ['route' => 'admin.visits.index', 'icon' => '📅', 'label' => 'Visit Requests', 'count' => $pendingVisitCount ?? 0],
            ['route' => 'admin.payments.index', 'icon' => '₹', 'label' => 'Payments'],
        ]],
        ['label' => 'Verification', 'items' => [
            ['route' => 'admin.verifications.index', 'icon' => '✔', 'label' => 'Verifications', 'count' => $pendingPropertyCount ?? 0],
            ['route' => 'admin.reports.index', 'icon' => '🚩', 'label' => 'Reports', 'count' => $openReportCount ?? 0],
            ['route' => 'admin.duplicates.index', 'icon' => '⧉', 'label' => 'Duplicates'],
        ]],
        ['label' => 'Marketing', 'items' => [
            ['route' => 'admin.banners.index', 'icon' => '🖼', 'label' => 'Banners'],
        ]],
        ['label' => 'Reports', 'items' => [
            ['route' => 'admin.analytics.index', 'icon' => '📊', 'label' => 'Analytics'],
        ]],
        ['label' => 'System', 'items' => [
            ['route' => 'admin.logs.index', 'icon' => '🕘', 'label' => 'System Logs'],
        ]],
    ];
@endphp
<div class="layout">
    <aside class="sidebar">
        <div class="brand">
            <div class="brand-mark">🏛</div>
            <div>
                <div class="brand-name">KAVURI</div>
                <div class="brand-sub">ESTATES</div>
            </div>
        </div>

        <nav>
            @foreach($navSections as $section)
                <div class="nav-group">
                    @if($section['label'])
                        <div class="nav-group-label">{{ $section['label'] }}</div>
                    @endif
                    @foreach($section['items'] as $item)
                        @continue(! Route::has($item['route']))
                        <a href="{{ route($item['route']) }}"
                           class="{{ request()->routeIs($item['route']) || request()->routeIs(str_replace('.index', '.*', $item['route'])) ? 'active' : '' }}">
                            <span class="ico">{{ $item['icon'] }}</span>
                            <span class="label">{{ $item['label'] }}</span>
                            @if(! empty($item['count']))
                                <span class="nav-count hot">{{ $item['count'] }}</span>
                            @endif
                        </a>
                    @endforeach
                </div>
            @endforeach
        </nav>

        <div class="sidebar-foot">
            <div class="promo">
                <div style="font-size:19px">💎</div>
                <h4>Kavuri Admin</h4>
                <p>Managing the mobile app and web platform.</p>
                <form method="POST" action="{{ route('admin.logout') }}">
                    @csrf
                    <button type="submit" class="btn-promo" style="width:100%;border:none;cursor:pointer;font-family:inherit">
                        Sign out
                    </button>
                </form>
            </div>
        </div>
    </aside>

    <div class="main">
        <header class="topbar">
            <form class="topbar-search" method="GET" action="{{ route('admin.properties.index') }}">
                <span class="search-ico">🔍</span>
                <input type="text" name="q" value="{{ request('q') }}"
                       placeholder="Search by property, user, phone number, or location…">
            </form>

            <div class="topbar-actions">
                <a href="{{ route('admin.reports.index') }}" class="icon-btn" title="Open reports">
                    🔔
                    @if(! empty($openReportCount))
                        <span class="dot">{{ $openReportCount }}</span>
                    @endif
                </a>
                <a href="{{ route('admin.inquiries.index') }}" class="icon-btn" title="Inquiries">
                    💬
                    @if(! empty($newLeadCount))
                        <span class="dot">{{ $newLeadCount }}</span>
                    @endif
                </a>

                <div class="admin-chip">
                    <div class="admin-avatar">{{ strtoupper(substr(auth()->user()->name ?? 'A', 0, 1)) }}</div>
                    <div class="admin-meta">
                        <strong>{{ auth()->user()->name ?? 'Admin' }}</strong>
                        <small>Super Admin</small>
                    </div>
                </div>
            </div>
        </header>

        <main class="content">
            @if(session('status'))
                <div class="alert alert-success">{{ session('status') }}</div>
            @endif
            @if(session('error'))
                <div class="alert alert-danger">{{ session('error') }}</div>
            @endif

            @yield('content')
        </main>
    </div>
</div>
@stack('scripts')
</body>
</html>
