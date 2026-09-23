'use client';

import { useState } from 'react';
import Link from 'next/link';
import { submitPropertyRequirement } from '@/lib/api';

const PROPERTY_TYPES = [
  { value: '', label: 'Any property type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'land', label: 'Land' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'pg', label: 'PG / Co-living' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'co_working_space', label: 'Co-working / Plug & Play' },
  { value: 'office_space', label: 'Office Space' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
];

export default function PropertyRequirementPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await submitPropertyRequirement({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        property_type: propertyType || undefined,
        listing_type: listingType,
        budget_min: budgetMin ? Number(budgetMin) : undefined,
        budget_max: budgetMax ? Number(budgetMax) : undefined,
        message: message.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your requirement.');
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-4xl">✓</p>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground">Got it — thanks!</h1>
        <p className="mt-2 text-sm text-muted">
          We've received your requirement and our team will get in touch shortly with matching properties.
        </p>
        <Link
          href="/properties"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Browse properties meanwhile
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Tell Us What You Need</p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
          Can't find the right property? We'll find it for you.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Share what you're looking for — no listing to browse, no login needed. Our team will follow up directly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4 rounded-2xl border border-border bg-surface p-6">
        {!!error && <div className="rounded-lg bg-danger-bg px-4 py-2.5 text-sm font-medium text-danger">{error}</div>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={150}
              placeholder="Full name"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={20}
              placeholder="+91…"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={150}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Looking to</label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as 'sale' | 'rent')}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="sale">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Property type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              maxLength={100}
              placeholder="e.g. Hyderabad"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
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

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Tell us more (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Any specific requirements — locality, amenities, move-in timeline…"
            className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim() || !phone.trim()}
          className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-white shadow-[var(--shadow-gold)] transition hover:bg-gold-deep disabled:opacity-50"
        >
          {saving ? 'Submitting…' : 'Submit my requirement'}
        </button>
      </form>
    </div>
  );
}
