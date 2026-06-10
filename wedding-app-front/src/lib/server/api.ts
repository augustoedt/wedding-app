import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL;

export interface Wedding {
	id: string;
	title: string;
	date: string | null;
	description: string | null;
	coverImage: string | null;
}

export interface Guest {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	rsvp: 'pending' | 'confirmed' | 'declined';
	plusOne: number;
}

export interface Gift {
	id: string;
	name: string;
	description: string | null;
	price: number;
	imageUrl: string | null;
	paymentType: 'url' | 'pix' | null;
	paymentValue: string | null;
	isActive: boolean;
	lockedAt: string | null;
}

export interface LockResult {
	paymentId: string;
	paymentType: 'url' | 'pix' | null;
	paymentValue: string | null;
}

export async function getWedding(slug: string, fetchFn: typeof fetch = fetch): Promise<Wedding> {
	const res = await fetchFn(`${API_URL}/public/weddings/${slug}`);
	if (!res.ok) throw new Error(`Wedding not found: ${res.status}`);
	return res.json();
}

export interface GiftPage {
	items: Gift[];
	total: number;
	page: number;
	limit: number;
}

export async function getGifts(
	slug: string,
	params?: { page?: number; limit?: number },
	fetchFn: typeof fetch = fetch
): Promise<GiftPage> {
	const qs = new URLSearchParams();
	if (params?.page) qs.set('page', String(params.page));
	if (params?.limit) qs.set('limit', String(params.limit));
	const query = qs.toString();
	const res = await fetchFn(
		`${API_URL}/public/weddings/${slug}/gifts${query ? `?${query}` : ''}`
	);
	if (!res.ok) throw new Error(`Gifts fetch failed: ${res.status}`);
	return res.json();
}

export async function lockGift(
	slug: string,
	giftId: string,
	payload: { buyerName: string; buyerEmail: string }
): Promise<LockResult> {
	const res = await fetch(`${API_URL}/public/weddings/${slug}/gifts/${giftId}/lock`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!res.ok) throw new Error(`Lock failed: ${res.status}`);
	return res.json();
}

export async function confirmRsvpByToken(
	token: string,
	rsvp: 'confirmed' | 'declined'
): Promise<Guest> {
	const res = await fetch(`${API_URL}/public/rsvp/${token}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ rsvp })
	});
	if (!res.ok) throw new Error(`Token RSVP failed: ${res.status}`);
	return res.json();
}
