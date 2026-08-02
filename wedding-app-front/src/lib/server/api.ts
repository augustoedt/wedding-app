import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL;

export interface Wedding {
	id: string;
	title: string;
	date: string | null;
	description: string | null;
	coverImage: string | null;
	venueName: string | null;
	venueCep: string | null;
	venueAddress: string | null;
	venueNumber: string | null;
	venueNeighborhood: string | null;
	venueCity: string | null;
	venueState: string | null;
	venueTime: string | null;
	venueImage: string | null;
	dressCodeGuests: string | null;
	dressCodeGroomsmen: string | null;
	ogImage: string | null;
}

export interface Guest {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	rsvp: 'pending' | 'confirmed' | 'declined';
	plusOne: number;
	confirmedCompanions: number;
}

export interface GuestRsvpStatus {
	name: string;
	rsvp: 'pending' | 'confirmed' | 'declined';
	allowedCompanions: number;
	confirmedCompanions: number;
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

export interface GuestMessage {
	senderName: string;
	message: string;
	createdAt: string;
}

export interface GalleryImage {
	id: string;
	url: string;
	description: string | null;
}

export interface Gallery {
	id: string;
	title: string;
	images: GalleryImage[];
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
	const res = await fetchFn(`${API_URL}/public/weddings/${slug}/gifts${query ? `?${query}` : ''}`);
	if (!res.ok) throw new Error(`Gifts fetch failed: ${res.status}`);
	return res.json();
}

export async function lockGift(
	slug: string,
	giftId: string,
	payload: { buyerName: string; buyerEmail: string; message?: string }
): Promise<LockResult> {
	const res = await fetch(`${API_URL}/public/weddings/${slug}/gifts/${giftId}/lock`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!res.ok) throw new Error(`Lock failed: ${res.status}`);
	return res.json();
}

export async function getGalleries(
	slug: string,
	fetchFn: typeof fetch = fetch
): Promise<Gallery[]> {
	const res = await fetchFn(`${API_URL}/public/weddings/${slug}/galleries`);
	if (!res.ok) throw new Error(`Galleries fetch failed: ${res.status}`);
	return res.json();
}

export async function getMessages(
	slug: string,
	fetchFn: typeof fetch = fetch
): Promise<GuestMessage[]> {
	const res = await fetchFn(`${API_URL}/public/weddings/${slug}/messages`);
	if (!res.ok) throw new Error(`Messages fetch failed: ${res.status}`);
	return res.json();
}

export async function getGuestRsvp(
	token: string,
	fetchFn: typeof fetch = fetch
): Promise<GuestRsvpStatus | null> {
	const res = await fetchFn(`${API_URL}/public/rsvp/${token}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`RSVP lookup failed: ${res.status}`);
	return res.json();
}

export async function confirmRsvpByToken(
	token: string,
	rsvp: 'confirmed' | 'declined',
	companions?: number
): Promise<Guest> {
	const res = await fetch(`${API_URL}/public/rsvp/${token}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ rsvp, companions })
	});
	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(body?.message ?? `Token RSVP failed: ${res.status}`);
	}
	return res.json();
}
