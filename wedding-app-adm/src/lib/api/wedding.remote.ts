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
		coverImage: v.optional(v.string())
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
		isPublished: v.optional(v.boolean())
	}),
	async ({ id, ...body }) => apiPut<Wedding>(`/admin/wedding/${id}`, body)
);
