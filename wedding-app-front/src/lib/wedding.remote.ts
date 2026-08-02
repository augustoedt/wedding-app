import { query, command } from '$app/server';
import * as v from 'valibot';
import { lockGift, confirmRsvpByToken as apiConfirmRsvpByToken } from '$lib/server/api';

export const lockGiftRemote = command(
	v.object({
		slug: v.string(),
		giftId: v.string(),
		buyerName: v.string(),
		buyerEmail: v.pipe(v.string(), v.email()),
		message: v.optional(v.string())
	}),
	async ({ slug, giftId, buyerName, buyerEmail, message }) => {
		return lockGift(slug, giftId, { buyerName, buyerEmail, message });
	}
);

export const confirmRsvpByToken = command(
	v.object({
		token: v.string(),
		rsvp: v.picklist(['confirmed', 'declined'] as const),
		companions: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)))
	}),
	async ({ token, rsvp, companions }) => {
		return apiConfirmRsvpByToken(token, rsvp, companions);
	}
);
