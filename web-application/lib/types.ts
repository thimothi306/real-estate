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
  | 'rental_manager'
  | 'packers_movers'
  | 'govt_registration_partner'
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
  | 'pg'
  | 'office_space'
  | 'shop'
  | 'commercial'
  | 'warehouse';

export type ListingType = 'sale' | 'rent';

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
  published_at: string | null;
};

export type PropertyMedia = {
  id: number;
  type: string;
  url: string;
  thumbnail_url: string | null;
  sort_order: number;
};

export type PropertyDetail = PropertySummary & {
  description: string | null;
  status: string;
  plot_size_sqft: number | null;
  floor_no: number | null;
  total_floors: number | null;
  facing: string | null;
  furnishing_status: string | null;
  has_balcony: boolean;
  has_swimming_pool: boolean;
  has_garden: boolean;
  has_parking: boolean;
  address_line: string | null;
  state: string;
  country: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  rera_number: string | null;
  is_rera_approved: boolean;
  views_count: number;
  owner?: { id: number; name: string; phone: string };
  media?: PropertyMedia[];
  amenities?: string[];
  lifestyle_tags?: string[];
  verifications?: string[];
};

export type SearchFilters = {
  q?: string;
  city?: string;
  property_type?: PropertyType;
  listing_type?: ListingType;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  per_page?: number;
};

export type Paginated<T> = {
  items: T[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export type Visit = {
  id: number;
  property_id: number;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  note: string | null;
  created_at: string;
  property?: { id: number; title: string; slug: string; city: string };
};

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  is_mine: boolean;
  read_at: string | null;
  created_at: string;
};

export type Conversation = {
  id: number;
  property?: {
    id: number;
    title: string;
    slug: string;
    city: string;
    price: number;
    cover_image: string | null;
  };
  counterpart: { id: number; name: string; avatar_url: string | null } | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  messages?: Message[];
};

export type ServiceCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_property_specific: boolean;
};

export type SubscriptionPlan = {
  id: number;
  name: string;
  slug: string;
  target_role: Role;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
};
