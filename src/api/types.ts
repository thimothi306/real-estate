export type Role =
  | 'buyer'
  | 'owner'
  | 'tenant'
  | 'landlord'
  | 'builder'
  | 'agent'
  | 'interior_designer'
  | 'loan_partner'
  | 'legal_consultant'
  | 'property_manager'
  | 'admin';

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: 'active' | 'suspended' | 'pending' | 'deleted';
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string | null;
};

export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'plot'
  | 'farmhouse'
  | 'resort'
  | 'wedding_venue'
  | 'hostel'
  | 'office_space'
  | 'shop'
  | 'commercial'
  | 'warehouse';

export type ListingType = 'sale' | 'rent';

export type PropertyStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'sold'
  | 'rented'
  | 'archived';

/** Shape returned by PropertyListResource (search results). */
export type PropertySummary = {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  rent_price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  city: string;
  locality: string | null;
  is_featured: boolean;
  cover_image?: string | null;
  investment_score?: number | null;
  published_at: string | null;
  status?: PropertyStatus;
};

export type PropertyMedia = {
  id: number;
  type: string;
  url: string;
  thumbnail_url: string | null;
  sort_order: number;
};

/** Shape returned by PropertyDetailResource. */
export type PropertyDetail = PropertySummary & {
  description: string | null;
  status: PropertyStatus;
  plot_size_sqft: number | null;
  floor_no: number | null;
  total_floors: number | null;
  facing: string | null;
  furnishing_status: string | null;
  has_balcony: boolean;
  has_swimming_pool: boolean;
  has_garden: boolean;
  has_parking: boolean;
  available_from: string | null;
  address_line: string | null;
  state: string;
  country: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  rera_number: string | null;
  is_rera_approved: boolean;
  views_count: number;
  owner?: User;
  media?: PropertyMedia[];
  amenities?: string[];
  verifications?: string[];
  created_at: string | null;
};

export type Amenity = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  category: string | null;
};

export type SearchFilters = {
  q?: string;
  city?: string;
  property_type?: PropertyType;
  listing_type?: ListingType;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  furnishing_status?: string;
  rera_only?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  per_page?: number;
  page?: number;
};

export type Paginated<T> = {
  items: T[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export type AppNotification = {
  id: string;
  data: {
    type: string;
    property_id?: number;
    property_slug?: string;
    title?: string;
    price?: number;
    city?: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
};
