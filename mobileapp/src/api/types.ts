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
  | 'service_provider'
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

/** Types where date-range booking (not just a one-time visit) makes sense. */
export const BOOKABLE_PROPERTY_TYPES: PropertyType[] = ['farmhouse', 'resort', 'wedding_venue', 'pg', 'hostel'];

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
  /** Whether the signed-in user has saved this property; false for guests. */
  is_favorited: boolean;
  owner?: User;
  media?: PropertyMedia[];
  amenities?: string[];
  lifestyle_tags?: string[];
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

export type LifestyleTag = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
};

export type PropertyHistoryEvent = {
  id: number;
  event_type: 'created' | 'price_changed' | 'status_changed' | 'ownership_changed' | 'renovated';
  meta: { from?: string | number; to?: string | number } | null;
  caused_by?: { id: number; name: string; role: Role } | null;
  created_at: string;
};

export type AvailabilityBlock = {
  id: number;
  start_date: string;
  end_date: string;
  status: 'blocked' | 'pending' | 'confirmed' | 'cancelled';
};

/** A scheduled site visit — distinct from a date-range Booking. */
export type Visit = {
  id: number;
  property_id: number;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  note: string | null;
  created_at: string;
  property?: { id: number; title: string; slug: string; city: string };
};

export type Booking = AvailabilityBlock & {
  note: string | null;
  property?: { id: number; title: string; slug: string; city: string };
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
  lifestyle_tag?: string;
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

// ---- Chat ----

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  /** Server-computed so the client can render bubbles without comparing ids. */
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

// ---- Property insights ----

export type PropertyInsight = {
  sunlight_rating: 'poor' | 'average' | 'good' | 'excellent' | null;
  noise_level: 'low' | 'moderate' | 'high' | null;
  commute_minutes: number | null;
  commute_landmark: string | null;
  future_infrastructure: string | null;
  rental_yield_percent: number | null;
  investment_score: number | null;
  rental_score: number | null;
  growth_score: number | null;
  risk_percent: number | null;
  demand_level: 'low' | 'medium' | 'high' | 'very_high' | null;
  liquidity_level: 'low' | 'medium' | 'high' | 'very_high' | null;
  estimated_market_price: number | null;
  estimated_rental_value: number | null;
  expected_selling_days: number | null;
};

// ---- Community reviews ----

export type ReviewCategory =
  | 'water_supply'
  | 'internet'
  | 'traffic'
  | 'safety'
  | 'schools'
  | 'hospitals'
  | 'maintenance';

export type Review = {
  id: number;
  city: string;
  locality: string | null;
  category: ReviewCategory;
  rating: number;
  comment: string | null;
  created_at: string;
  user?: { id: number; name: string; avatar_url: string | null };
};

export type CommunityReviewSummary = {
  category: ReviewCategory;
  /** MySQL AVG() comes back as a string — parse before doing math on it. */
  avg_rating: string | number;
  total: number;
};

// ---- Home loans ----

export type LoanOffer = {
  id: number;
  lender_name: string;
  logo_url: string | null;
  interest_rate_from: number;
  max_amount: number;
  max_tenure_years: number;
  processing_fee_percent: number | null;
  highlight: string | null;
  apply_url: string | null;
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
