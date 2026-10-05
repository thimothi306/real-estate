// Single source of truth for the Plots / Lands / Commercial / PG sub-type
// dropdowns, shared by the hero search bar and the /properties filter form.
// Backend validation (SearchPropertyRequest / StorePropertyRequest) must be
// kept in sync with these values.
export type SubTypeCategory = 'plot' | 'land' | 'commercial' | 'pg';

export const SUB_TYPE_OPTIONS: Record<SubTypeCategory, { value: string; label: string }[]> = {
  plot: [
    { value: 'residential_plot', label: 'Residential Plot' },
    { value: 'villa_plot', label: 'Villa Plot' },
    { value: 'gated_community_plot', label: 'Gated Community Plot' },
    { value: 'commercial_plot', label: 'Commercial Plot' },
    { value: 'industrial_plot', label: 'Industrial Plot' },
    { value: 'farmhouse_plot', label: 'Farmhouse Plot' },
  ],
  land: [
    { value: 'agricultural_land', label: 'Agricultural Land' },
    { value: 'farm_land', label: 'Farm Land' },
    { value: 'orchard_plantation_land', label: 'Orchard / Plantation Land' },
    { value: 'raw_land', label: 'Raw Land' },
    { value: 'converted_land', label: 'Converted Land' },
    { value: 'industrial_land', label: 'Industrial Land' },
    { value: 'development_land', label: 'Development Land' },
  ],
  commercial: [
    { value: 'shop', label: 'Shop' },
    { value: 'office', label: 'Office' },
    { value: 'showroom', label: 'Showroom' },
    { value: 'commercial_building', label: 'Commercial Building' },
    { value: 'restaurant_cafe', label: 'Restaurant / Café' },
    { value: 'warehouse_godown', label: 'Warehouse / Godown' },
    { value: 'co_working_space', label: 'Co-working Space' },
    { value: 'commercial_complex', label: 'Commercial Complex' },
  ],
  pg: [
    { value: 'mens_pg', label: "Men's PG" },
    { value: 'womens_pg', label: "Women's PG" },
    { value: 'student_pg', label: 'Student PG' },
    { value: 'working_professionals', label: 'Working Professionals' },
    { value: 'shared_rooms', label: 'Shared Rooms' },
    { value: 'private_rooms', label: 'Private Rooms' },
    { value: 'managed_co_living', label: 'Managed Co-living' },
  ],
};

const SUB_TYPE_LABELS: Record<SubTypeCategory, string> = {
  plot: 'Plot type',
  land: 'Land type',
  commercial: 'Commercial type',
  pg: 'PG type',
};

export function subTypeFieldLabel(category: SubTypeCategory): string {
  return SUB_TYPE_LABELS[category];
}

export function asSubTypeCategory(propertyType: string): SubTypeCategory | null {
  return propertyType === 'plot' || propertyType === 'land' || propertyType === 'commercial' || propertyType === 'pg'
    ? propertyType
    : null;
}
