'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authPost, ApiError } from '@/lib/auth-api';
import type { ServiceCategory } from '@/lib/types';

export function PostServiceRequestForm({ categories }: { categories: ServiceCategory[] }) {
  const { user, token } = useAuth();
  const router = useRouter();

  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [urgency, setUrgency] = useState('this_week');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm font-semibold text-foreground">Sign in to post a service request</p>
        <p className="mt-1 text-sm text-muted">Verified partners will start quoting within hours.</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Log in
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);

    try {
      await authPost('/service-requests', token, {
        service_category_id: categoryId,
        title: title.trim(),
        description: description.trim() || undefined,
        budget_min: budgetMin ? Number(budgetMin) : undefined,
        budget_max: budgetMax ? Number(budgetMax) : undefined,
        urgency,
        location: location.trim() || undefined,
      });
      setSuccess(true);
      setTitle('');
      setDescription('');
      setBudgetMin('');
      setBudgetMax('');
      setUrgency('this_week');
      setLocation('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your request.');
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success-bg p-8 text-center">
        <p className="text-2xl">✓</p>
        <p className="mt-2 text-sm font-semibold text-success">Request posted successfully</p>
        <p className="mt-1 text-sm text-success/80">Verified partners will start sending quotes shortly.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm font-semibold text-primary hover:underline"
        >
          Post another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-lg font-bold text-foreground">Post a service request</h2>

      {!!error && <div className="rounded-lg bg-danger-bg px-4 py-2.5 text-sm font-medium text-danger">{error}</div>}

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">Service category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">What do you need?</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={150}
          placeholder="e.g. Full interior design for a 3 BHK"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground">Describe your requirement</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Share any details that help a partner quote accurately…"
          className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Budget min (₹)</label>
          <input
            type="number"
            min={0}
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Budget max (₹)</label>
          <input
            type="number"
            min={0}
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="immediate">Immediate</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This week</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={255}
            placeholder="e.g. Kondapur, Hyderabad"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {saving ? 'Posting…' : 'Post request'}
      </button>
    </form>
  );
}
