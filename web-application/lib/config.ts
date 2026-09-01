const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

/** The Laravel app's origin, for assets served outside the /api/v1 prefix (storage, images). */
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
