@extends('admin.layouts.app')
@section('title', 'Users')

@section('content')
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('admin.users.index') }}" class="filters">
                <div class="field">
                    <label for="role">Role</label>
                    <select id="role" name="role">
                        <option value="">All roles</option>
                        @foreach(['buyer', 'owner', 'tenant', 'landlord', 'builder', 'agent', 'interior_designer', 'loan_partner', 'legal_consultant', 'property_manager', 'admin'] as $role)
                            <option value="{{ $role }}" @selected(($filters['role'] ?? '') === $role)>
                                {{ ucwords(str_replace('_', ' ', $role)) }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="">All statuses</option>
                        @foreach(['active', 'pending', 'suspended'] as $status)
                            <option value="{{ $status }}" @selected(($filters['status'] ?? '') === $status)>{{ ucfirst($status) }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="q">Search</label>
                    <input id="q" type="text" name="q" value="{{ $filters['q'] ?? '' }}" placeholder="Name, email or phone…">
                </div>
                <div>
                    <button type="submit" class="btn btn-primary">Filter</button>
                    <a href="{{ route('admin.users.index') }}" class="btn">Reset</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($users->total()) }} user{{ $users->total() === 1 ? '' : 's' }}</div>

        @if($users->isEmpty())
            <div class="empty">No users match these filters.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Listings</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                @foreach($users as $user)
                    <tr>
                        <td>{{ $user->name }}</td>
                        <td class="muted">
                            {{ $user->email }}<br>
                            <span style="font-size:12px">{{ $user->phone }}{{ $user->phone_verified_at ? ' ✓' : '' }}</span>
                        </td>
                        <td class="muted">{{ ucwords(str_replace('_', ' ', $user->role)) }}</td>
                        <td>{{ $user->properties_count }}</td>
                        <td><span class="badge-status st-{{ $user->status }}">{{ ucfirst($user->status) }}</span></td>
                        <td class="muted">{{ $user->created_at->format('d M Y') }}</td>
                        <td>
                            @if($user->isAdmin())
                                <span class="muted" style="font-size:12px">—</span>
                            @elseif($user->status === 'suspended')
                                <form method="POST" action="{{ route('admin.users.reactivate', $user) }}" class="inline">
                                    @csrf
                                    <button type="submit" class="btn btn-sm btn-success">Reactivate</button>
                                </form>
                            @else
                                <form method="POST" action="{{ route('admin.users.suspend', $user) }}" class="inline"
                                      onsubmit="return confirm('Suspend {{ $user->name }}? They will be signed out of all devices.')">
                                    @csrf
                                    <button type="submit" class="btn btn-sm btn-danger">Suspend</button>
                                </form>
                            @endif
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $users->links() }}</div>
        @endif
    </div>
@endsection
