import * as v from 'valibot';
import { query, form } from '$app/server';
import { apiGet, apiPostForm } from '$lib/server/api';

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

export const uploadImage = form(
	v.object({
		file: v.pipe(
			v.file(),
			v.mimeType(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
			v.maxSize(8 * 1024 * 1024)
		),
		description: v.optional(v.string())
	}),
	async (data) => {
		console.log(
			`[uploadImage] file=${data.file.name} size=${data.file.size} type=${data.file.type}`
		);
		const formData = new FormData();
		formData.append('file', data.file);
		if (data.description) formData.append('description', data.description);
		return apiPostForm<Image>('/admin/images', formData);
	}
);
