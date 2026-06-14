import * as v from 'valibot';
import { query, command } from '$app/server';
import { apiGet, apiPost, apiPut } from '$lib/server/api';

export type Wedding = {
	id: string;
	userId: string;
	title: string;
	slug: string;
	siteUrl?: string | null;
	inviteMessage?: string | null;
	date?: string | null;
	description?: string | null;
	coverImage?: string | null;
	venueName?: string | null;
	venueCep?: string | null;
	venueAddress?: string | null;
	venueNumber?: string | null;
	venueNeighborhood?: string | null;
	venueCity?: string | null;
	venueState?: string | null;
	venueTime?: string | null;
	venueImage?: string | null;
	dressCodeGuests?: string | null;
	dressCodeGroomsmen?: string | null;
	ogImage?: string | null;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
};

export const getWedding = query(async () => {
	try {
		return await apiGet<Wedding>('/admin/wedding/me');
	} catch (e: unknown) {
		const err = e as { status?: number };
		if (err.status === 404) return null;
		throw e;
	}
});

export const createWedding = command(
	v.object({
		title: v.string(),
		slug: v.pipe(v.string(), v.regex(/^[a-z0-9-]+$/)),
		siteUrl: v.optional(v.string()),
		inviteMessage: v.optional(v.string()),
		date: v.optional(v.string()),
		description: v.optional(v.string()),
		coverImage: v.optional(v.string()),
		venueName: v.optional(v.string()),
		venueCep: v.optional(v.string()),
		venueAddress: v.optional(v.string()),
		venueNumber: v.optional(v.string()),
		venueNeighborhood: v.optional(v.string()),
		venueCity: v.optional(v.string()),
		venueState: v.optional(v.string()),
		venueTime: v.optional(v.string()),
		venueImage: v.optional(v.string()),
		dressCodeGuests: v.optional(v.string()),
		dressCodeGroomsmen: v.optional(v.string()),
		ogImage: v.optional(v.string())
	}),
	async (data) => apiPost<Wedding>('/admin/wedding', data)
);

export const updateWedding = command(
	v.object({
		id: v.string(),
		title: v.optional(v.string()),
		slug: v.optional(v.pipe(v.string(), v.regex(/^[a-z0-9-]+$/))),
		siteUrl: v.optional(v.nullable(v.string())),
		inviteMessage: v.optional(v.nullable(v.string())),
		date: v.optional(v.nullable(v.string())),
		description: v.optional(v.nullable(v.string())),
		coverImage: v.optional(v.nullable(v.string())),
		venueName: v.optional(v.nullable(v.string())),
		venueCep: v.optional(v.nullable(v.string())),
		venueAddress: v.optional(v.nullable(v.string())),
		venueNumber: v.optional(v.nullable(v.string())),
		venueNeighborhood: v.optional(v.nullable(v.string())),
		venueCity: v.optional(v.nullable(v.string())),
		venueState: v.optional(v.nullable(v.string())),
		venueTime: v.optional(v.nullable(v.string())),
		venueImage: v.optional(v.nullable(v.string())),
		dressCodeGuests: v.optional(v.nullable(v.string())),
		dressCodeGroomsmen: v.optional(v.nullable(v.string())),
		ogImage: v.optional(v.nullable(v.string())),
		isPublished: v.optional(v.boolean())
	}),
	async ({ id, ...body }) => apiPut<Wedding>(`/admin/wedding/${id}`, body)
);
