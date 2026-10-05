'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authPost, ApiError } from '@/lib/auth-api';
import type { PropertyDetail } from '@/lib/types';

const PROPERTY_TYPES = [
  'apartment', 'villa', 'plot', 'land', 'farmhouse', 'resort', 'wedding_venue',
  'hostel', 'pg', 'office_space', 'co_working_space', 'shop', 'commercial', 'warehouse',
];

const FACING_OPTIONS = [
  'east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west',
  'ocean_facing', 'park_facing', 'road_facing', 'garden_facing',
];
const FURNISHING_OPTIONS = ['unfurnished', 'semi_furnished', 'fully_furnished'];
const PLOT_PURPOSES = ['residential', 'commercial', 'industrial', 'agricultural', 'farmhouse', 'venture_layout'];
const PLOT_APPROVALS = ['hmda', 'dtcp', 'municipal', 'gram_panchayat', 'non_approved'];
const PLOT_FEATURES = ['gated_community', 'corner', 'highway_facing', 'villa_plot', 'land_parcel'];
const PG_OCCUPANCIES = ['single', 'double', 'triple', 'four_plus'];
const PG_TENANT_TYPES = ['gents', 'ladies', 'students', 'professionals', 'unisex', 'couples'];
const PG_ACCOMMODATION_TYPES = ['pg_rooms', 'coliving_apartment', 'hostel', 'private_room', 'studio_apartment'];
const PG_TIERS = ['standard', 'premium_luxury'];
const PG_RENT_MODELS = ['monthly', 'daily_weekly', 'long_term_lease'];
const PG_AMENITIES = ['ac', 'attached_washroom', 'washing_machine', 'wifi', 'food', 'housekeeping', 'gaming_zone'];

export default function NewPropertyPage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [price, setPrice] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [furnishingStatus, setFurnishingStatus] = useState('');
  const [facing, setFacing] = useState('');
  const [plotPurpose, setPlotPurpose] = useState('');
  const [plotApproval, setPlotApproval] = useState('');
  const [plotTransaction, setPlotTransaction] = useState('');
  const [plotFeatures, setPlotFeatures] = useState<string[]>([]);
  const [pgOccupancy, setPgOccupancy] = useState('');
  const [pgTenantType, setPgTenantType] = useState('');
  const [pgAccommodationType, setPgAccommodationType] = useState('');
  const [pgTier, setPgTier] = useState('');
  const [pgRentModel, setPgRentModel] = useState('');
  const [foodIncluded, setFoodIncluded] = useState('');
  const [pgAmenities, setPgAmenities] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);
  const isPlot = propertyType === 'plot' || propertyType === 'land';
  const isPg = propertyType === 'pg' || propertyType === 'hostel';

  function toggleOption(current: string[], value: string, update: (next: string[]) => void) {
    update(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  useEffect(() => {
    if (!initialising && !user) router.replace('/login?redirect=/properties/new');
  }, [initialising, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      const property = await authPost<PropertyDetail>('/properties', token, {
        title: title.trim(),
        description: description.trim() || undefined,
        property_type: propertyType,
        listing_type: listingType,
        price: Number(price),
        rent_price: listingType === 'rent' && rentPrice ? Number(rentPrice) : undefined,
        area_sqft: areaSqft ? Number(areaSqft) : undefined,
        plot_size_sqft: isPlot && areaSqft ? Number(areaSqft) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        city: city.trim(),
        state: state.trim(),
        address_line: addressLine.trim() || undefined,
        locality: locality.trim() || undefined,
        pincode: pincode.trim() || undefined,
        furnishing_status: furnishingStatus || undefined,
        facing: facing || undefined,
        category_details: isPlot
          ? {
              plot_purpose: plotPurpose || undefined,
              plot_approval: plotApproval || undefined,
              plot_transaction: plotTransaction || undefined,
              plot_features: plotFeatures,
            }
          : isPg
            ? {
                pg_occupancy: pgOccupancy || undefined,
                pg_tenant_type: pgTenantType || undefined,
                pg_accommodation_type: pgAccommodationType || undefined,
                pg_tier: pgTier || undefined,
                pg_rent_model: pgRentModel || undefined,
                food_included: foodIncluded === '' ? undefined : foodIncluded === 'true',
                pg_amenities: pgAmenities,
              }
            : undefined,
      });

      // Not a redirect to /properties/{slug} — that page is rendered
      // server-side without auth, so it can never show an unpublished draft
      // even to its own owner. Confirm here instead; the listing becomes
      // browsable once admin review publishes it.
      setSubmittedTitle(property.title);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors)) mapped[field] = messages[0];
        setFieldErrors(mapped);
        setError('Please fix the highlighted fields.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not create your listing.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (initialising || !user) {
    return <div className="px-4 py-24 text-center text-muted">Loading…</div>;
  }

  if (submittedTitle) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-4xl">✓</p>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground">&quot;{submittedTitle}&quot; submitted!</h1>
        <p className="mt-2 text-sm text-muted">
          Our team will review it and publish it within a few hours. You&apos;ll be able to find it under your account
          once it&apos;s live.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setSubmittedTitle(null);
              setTitle('');
              setDescription('');
              setPrice('');
              setRentPrice('');
            }}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            List another property
          </button>
          <a
            href="/dashboard"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">List Your Property</p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">Post your property for free</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          It&apos;ll be reviewed by our team before it goes live — usually within a few hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-2xl border border-border bg-surface p-6">
        {!!error && <div className="rounded-lg bg-danger-bg px-4 py-2.5 text-sm font-medium text-danger">{error}</div>}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={150}
            placeholder="e.g. Spacious 3BHK Apartment in Gachibowli"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
          {!!fieldErrors.title && <p className="mt-1 text-xs text-danger">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={5000}
            placeholder="Describe the property — layout, condition, nearby landmarks…"
            className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Property type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Listing type</label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as 'sale' | 'rent')}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
            </select>
          </div>
        </div>

        {isPlot && (
          <fieldset className="space-y-4 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-bold text-foreground">Plot details</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm font-semibold text-foreground">Purpose
                <select value={plotPurpose} onChange={(e) => setPlotPurpose(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Not specified</option>{PLOT_PURPOSES.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Approval
                <select value={plotApproval} onChange={(e) => setPlotApproval(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Not specified</option>{PLOT_APPROVALS.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Deal type
                <select value={plotTransaction} onChange={(e) => setPlotTransaction(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Direct sale / rent</option><option value="joint_development">Joint development</option><option value="investment_prelaunch">Investment / pre-launch</option>
                </select>
              </label>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Location features</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {PLOT_FEATURES.map((value) => (
                  <label key={value} className="flex items-center gap-2 text-sm capitalize text-muted">
                    <input type="checkbox" checked={plotFeatures.includes(value)} onChange={() => toggleOption(plotFeatures, value, setPlotFeatures)} />
                    {value.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>
        )}

        {isPg && (
          <fieldset className="space-y-4 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-bold text-foreground">PG / Co-Living details</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold text-foreground">Occupancy
                <select value={pgOccupancy} onChange={(e) => setPgOccupancy(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Not specified</option>{PG_OCCUPANCIES.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Tenant type
                <select value={pgTenantType} onChange={(e) => setPgTenantType(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Not specified</option>{PG_TENANT_TYPES.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Accommodation
                <select value={pgAccommodationType} onChange={(e) => setPgAccommodationType(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Not specified</option>{PG_ACCOMMODATION_TYPES.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Rent model
                <select value={pgRentModel} onChange={(e) => setPgRentModel(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Not specified</option>{PG_RENT_MODELS.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Experience
                <select value={pgTier} onChange={(e) => setPgTier(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Not specified</option>{PG_TIERS.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Food
                <select value={foodIncluded} onChange={(e) => setFoodIncluded(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal">
                  <option value="">Not specified</option><option value="true">Included</option><option value="false">Not included</option>
                </select>
              </label>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Amenities</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {PG_AMENITIES.map((value) => (
                  <label key={value} className="flex items-center gap-2 text-sm capitalize text-muted">
                    <input type="checkbox" checked={pgAmenities.includes(value)} onChange={() => toggleOption(pgAmenities, value, setPgAmenities)} />
                    {value.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              {listingType === 'rent' ? 'Security deposit / price (₹)' : 'Price (₹)'}
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {!!fieldErrors.price && <p className="mt-1 text-xs text-danger">{fieldErrors.price}</p>}
          </div>
          {listingType === 'rent' && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Monthly rent (₹)</label>
              <input
                type="number"
                min={0}
                value={rentPrice}
                onChange={(e) => setRentPrice(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Area (sq ft)</label>
            <input
              type="number"
              min={0}
              value={areaSqft}
              onChange={(e) => setAreaSqft(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Bedrooms</label>
            <input
              type="number"
              min={0}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Bathrooms</label>
            <input
              type="number"
              min={0}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              maxLength={100}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {!!fieldErrors.city && <p className="mt-1 text-xs text-danger">{fieldErrors.city}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">State</label>
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              maxLength={100}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {!!fieldErrors.state && <p className="mt-1 text-xs text-danger">{fieldErrors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Locality</label>
            <input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              maxLength={120}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Pincode</label>
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={10}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Address</label>
          <input
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            maxLength={255}
            placeholder="Street, landmark…"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Furnishing</label>
            <select
              value={furnishingStatus}
              onChange={(e) => setFurnishingStatus(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Not specified</option>
              {FURNISHING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Facing</label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Not specified</option>
              {FACING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !title.trim() || !price || !city.trim() || !state.trim()}
          className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-white shadow-[var(--shadow-gold)] transition hover:bg-gold-deep disabled:opacity-50"
        >
          {saving ? 'Publishing…' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}
