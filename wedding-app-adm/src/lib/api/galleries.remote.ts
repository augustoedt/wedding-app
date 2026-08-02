import * as v from 'valibot';
import { query, command } from '$app/server';
import { apiGet, apiPost, apiPut, apiDelete } from '$lib/server/api';

export type Gallery = {
	id: string;
	weddingId: string;
	title: string;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
};

export const getGalleries = query(async () => {
	try {
		return await apiGet<Gallery[]>('/admin/galleries');
	} catch (e: unknown) {
		const err = e as { status?: number };
		if (err.status === 404) return [];
		throw e;
	}
});

export const addGallery = command(v.object({ title: v.string() }), async (data) =>
	apiPost<Gallery>('/admin/galleries', data)
);

export const updateGallery = command(
	v.object({ id: v.string(), title: v.optional(v.string()) }),
	async ({ id, ...body }) => apiPut<Gallery>(`/admin/galleries/${id}`, body)
);

export const deleteGallery = command(v.string(), async (id) => apiDelete(`/admin/galleries/${id}`));

export const reorderGallery = command(
	v.object({
		id: v.string(),
		beforeId: v.optional(v.string()),
		afterId: v.optional(v.string())
	}),
	async ({ id, beforeId, afterId }) =>
		apiPost<Gallery[]>(`/admin/galleries/${id}/reorder`, { beforeId, afterId })
);
