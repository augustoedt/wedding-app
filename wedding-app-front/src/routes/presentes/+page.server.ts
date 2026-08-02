import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
import { getWedding, getGifts } from '$lib/server/api';
import type { PageServerLoad } from './$types';

const LIMIT = 12;

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const [wedding, giftsPage] = await Promise.all([
		getWedding(PUBLIC_WEDDING_SLUG),
		getGifts(PUBLIC_WEDDING_SLUG, { page, limit: LIMIT })
	]);
	return { wedding, giftsPage, page };
};
