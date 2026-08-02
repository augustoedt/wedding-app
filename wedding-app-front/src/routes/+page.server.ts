import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
import { getWedding, getGalleries } from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [wedding, galleries] = await Promise.all([
		getWedding(PUBLIC_WEDDING_SLUG),
		getGalleries(PUBLIC_WEDDING_SLUG)
	]);
	const gallery = galleries[0] ?? null;
	return { wedding, gallery };
};
