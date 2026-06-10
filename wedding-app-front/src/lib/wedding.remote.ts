import { query, command } from '$app/server';
import * as v from 'valibot';
import { getWedding, getGifts, lockGift, confirmRsvpByToken as apiConfirmRsvpByToken } from '$lib/server/api';

export const fetchWedding = query(v.string(), async (slug) => {
	return getWedding(slug);
});

export const fetchGifts = query(
	v.object({
		slug: v.string(),
		page: v.optional(v.number()),
		limit: v.optional(v.number())
	}),
	async ({ slug, page, limit }) => {
		return getGifts(slug, { page, limit });
	}
);

export const lockGiftRemote = command(
	v.object({
		slug: v.string(),
		giftId: v.string(),
		buyerName: v.string(),
		buyerEmail: v.pipe(v.string(), v.email())
	}),
	async ({ slug, giftId, buyerName, buyerEmail }) => {
		return lockGift(slug, giftId, { buyerName, buyerEmail });
	}
);

export const confirmRsvpByToken = command(
	v.object({
		token: v.string(),
		rsvp: v.picklist(['confirmed', 'declined'] as const)
	}),
	async ({ token, rsvp }) => {
		return apiConfirmRsvpByToken(token, rsvp);
	}
);
