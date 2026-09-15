'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authGet, authPut, ApiError } from '@/lib/auth-api';
import { getServiceCategories } from '@/lib/api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import type { PartnerProfile, ServiceCategory } from '@/lib/types';

export default function ProviderProfilePage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [profession, setProfession] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [citiesServed, setCitiesServed] = useState('');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const [cats, existing] = await Promise.all([
        getServiceCategories(),
        authGet<PartnerProfile | null>('/my/partner-profile', token),
      ]);
      setCategories(cats);
      setProfile(existing);
      if (existing) {
        setProfession(existing.profession ?? '');
        setBusinessName(existing.business_name);
        setBio(existing.bio ?? '');
        setYearsExperience(existing.years_experience ?? '');
        setCitiesServed((existing.cities_served ?? []).join(', '));
        setCategoryIds((existing.categories ?? []).map((c) => c.id));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your provider profile.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!initialising && !user) router.replace('/login');
  }, [initialising, user, router]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleCategory(id: number) {
    setCategoryIds((current) => (current.includes(id) ? current.filter((c) => c !== id) : [...current, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const updated = await authPut<PartnerProfile>('/my/partner-profile', token, {
        profession: profession.trim(),
        business_name: businessName.trim(),
        bio: bio.trim() || undefined,
        years_experience: yearsExperience.trim() || undefined,
        cities_served: citiesServed
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        category_ids: categoryIds,
      });
      setProfile(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (initialising || !user) {
    return <div className="px-4 py-24 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar counts={{}} />

      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                {profile ? 'My Provider Profile' : 'Become a Verified Professional'}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {profile
                  ? 'Keep your professional details up to date.'
                  : 'Fill out your professional details to start receiving service requests.'}
              </p>
            </div>
            {profile && (
              <Link href="/dashboard/provider/queue" className="text-sm font-semibold text-primary hover:underline">
                View open requests →
              </Link>
            )}
          </div>

          {profile && !profile.is_verified && (
            <div className="mb-6 rounded-lg bg-warning-bg px-4 py-3 text-sm font-medium text-warning">
              Your profile is saved and awaiting verification before it's shown in the public directory.
            </div>
          )}

          {!!error && (
            <div className="mb-6 rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>
          )}
          {saved && (
            <div className="mb-6 rounded-lg bg-success-bg px-4 py-3 text-sm font-medium text-success">
              ✓ Profile saved.
            </div>
          )}

          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading…</p>
          ) : (
            <form onSubmit={handleSubmit} className="card-lift space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Primary profession</label>
                <input
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="e.g. Plumber, Electrician, House Maid"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Display name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  maxLength={150}
                  placeholder="e.g. Ramesh Kumar or Ramesh Plumbing Services"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">About</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="What do you specialize in?"
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Years of experience</label>
                  <input
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    maxLength={20}
                    placeholder="e.g. 12"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Cities served</label>
                  <input
                    value={citiesServed}
                    onChange={(e) => setCitiesServed(e.target.value)}
                    placeholder="Hyderabad, Secunderabad"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Services you offer</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="accent-primary"
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !profession.trim() || !businessName.trim()}
                className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-white shadow-[var(--shadow-gold)] transition hover:bg-gold-deep disabled:opacity-50"
              >
                {saving ? 'Saving…' : profile ? 'Save changes' : 'Become a provider'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
