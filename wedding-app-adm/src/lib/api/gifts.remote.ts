import * as v from 'valibot';
import { query, command } from '$app/server';
import { apiGet, apiPost, apiPut, apiDelete } from '$lib/server/api';

export type GiftStatus = 'available' | 'locked' | 'purchased';

export type Gift = {
	id: string;
	weddingId: string;
	name: string;
	description?: string | null;
	price: number;
	imageUrl?: string | null;
	paymentType?: 'url' | 'pix' | null;
	paymentValue?: string | null;
	isActive: boolean;
	lockedAt?: string | null;
	createdAt: string;
	updatedAt: string;
};

export const getGifts = query(async () => {
	return apiGet<Gift[]>('/admin/gifts');
});

export const addGift = command(
	v.object({
		name: v.string(),
		description: v.optional(v.string()),
		price: v.pipe(v.number(), v.integer(), v.minValue(1)),
		imageUrl: v.optional(v.string()),
		paymentType: v.optional(v.picklist(['url', 'pix'])),
		paymentValue: v.optional(v.string())
	}),
	async (data) => apiPost<Gift>('/admin/gifts', data)
);

export const updateGift = command(
	v.object({
		id: v.string(),
		name: v.optional(v.string()),
		description: v.optional(v.nullable(v.string())),
		price: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
		imageUrl: v.optional(v.nullable(v.string())),
		paymentType: v.optional(v.nullable(v.picklist(['url', 'pix']))),
		paymentValue: v.optional(v.nullable(v.string())),
		isActive: v.optional(v.boolean()),
		status: v.optional(v.picklist(['available', 'locked', 'purchased']))
	}),
	async ({ id, ...body }) => apiPut<Gift>(`/admin/gifts/${id}`, body)
);

export const deleteGift = command(
	v.string(),
	async (id) => apiDelete(`/admin/gifts/${id}`)
);
