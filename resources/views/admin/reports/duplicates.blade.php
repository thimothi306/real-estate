@extends('admin.layouts.app')
@section('title', 'Duplicate photo flags')

@section('content')
    <div class="card">
        <div class="card-header">
            {{ number_format($flags->total()) }} pending flag{{ $flags->total() === 1 ? '' : 's' }}
        </div>
        <div class="card-body" style="border-bottom:1px solid var(--border)">
            <p class="muted" style="margin:0">
                A flag is raised when a photo uploaded to one listing is byte-identical to a photo on a different
                listing. Confirming archives the newer listing; dismissing keeps both.
            </p>
        </div>

        @if($flags->isEmpty())
            <div class="empty">No pending duplicate flags.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>Newer listing</th>
                    <th>Matches</th>
                    <th>Detected</th>
                    <th style="width:200px">Action</th>
                </tr>
                </thead>
                <tbody>
                @foreach($flags as $flag)
                    <tr>
                        <td>
                            @if($flag->property)
                                <a href="{{ route('admin.properties.show', $flag->property) }}">{{ $flag->property->title }}</a>
                                <div class="muted" style="font-size:12px">
                                    {{ $flag->property->city }} · {{ $flag->property->owner?->name ?? 'Unknown owner' }}
                                </div>
                            @else
                                <span class="muted">Deleted listing</span>
                            @endif
                        </td>
                        <td>
                            @if($flag->matchedProperty)
                                <a href="{{ route('admin.properties.show', $flag->matchedProperty) }}">{{ $flag->matchedProperty->title }}</a>
                                <div class="muted" style="font-size:12px">
                                    {{ $flag->matchedProperty->city }} · {{ $flag->matchedProperty->owner?->name ?? 'Unknown owner' }}
                                </div>
                            @else
                                <span class="muted">Deleted listing</span>
                            @endif
                        </td>
                        <td class="muted">{{ $flag->created_at->diffForHumans() }}</td>
                        <td>
                            <form method="POST" action="{{ route('admin.duplicates.resolve', $flag) }}">
                                @csrf
                                <div class="actions">
                                    <button type="submit" name="status" value="confirmed" class="btn btn-sm btn-danger"
                                            onclick="return confirm('Confirm as duplicate? The newer listing will be archived.')">
                                        Confirm
                                    </button>
                                    <button type="submit" name="status" value="dismissed" class="btn btn-sm">Dismiss</button>
                                </div>
                            </form>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $flags->links() }}</div>
        @endif
    </div>
@endsection
