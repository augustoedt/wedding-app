import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiPostForm } from '$lib/server/api';
import type { Image } from '$lib/api/images.remote';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const formData = await request.formData();
	const image = await apiPostForm<Image>('/admin/images', formData);
	return json(image, { status: 201 });
};
