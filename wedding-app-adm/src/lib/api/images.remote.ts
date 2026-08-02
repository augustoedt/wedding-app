import * as v from 'valibot';
import { query, command } from '$app/server';
import { apiGet, apiDelete, apiPut, apiPost } from '$lib/server/api';

export type Image = {
	id: string;
	weddingId: string;
	galleryId?: string | null;
	url: string;
	description?: string | null;
	sortOrder: number;
	createdAt: string;
};

export const getImages = query(async () => {
	try {
		return await apiGet<Image[]>('/admin/images');
	} catch (e: unknown) {
		const err = e as { status?: number };
		if (err.status === 404) return [];
		throw e;
	}
});

export const deleteImage = command(v.string(), async (id) => apiDelete(`/admin/images/${id}`));

export const updateImage = command(
	v.object({
		id: v.string(),
		description: v.optional(v.nullable(v.string())),
		galleryId: v.optional(v.nullable(v.string()))
	}),
	async ({ id, ...body }) => apiPut<Image>(`/admin/images/${id}`, body)
);

export const reorderImage = command(
	v.object({
		id: v.string(),
		beforeId: v.optional(v.string()),
		afterId: v.optional(v.string())
	}),
	async ({ id, beforeId, afterId }) =>
		apiPost<Image[]>(`/admin/images/${id}/reorder`, { beforeId, afterId })
);
