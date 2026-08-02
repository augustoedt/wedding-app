import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
import { getWedding, getGifts } from '$lib/server/api';
import type { PageServerLoad } from './$types';

const LIMIT = 20;

export const load: PageServerLoad = async () => {
	const [wedding, giftsPage] = await Promise.all([
		getWedding(PUBLIC_WEDDING_SLUG),
		getGifts(PUBLIC_WEDDING_SLUG, { page: 1, limit: LIMIT })
	]);
	return { wedding, giftsPage };
};
