import { query } from '$app/server';
import { apiGet } from '$lib/server/api';

export type Image = {
	id: string;
	weddingId: string;
	url: string;
	description?: string | null;
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
