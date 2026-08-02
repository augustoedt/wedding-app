import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
import { getWedding } from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const wedding = await getWedding(PUBLIC_WEDDING_SLUG);
	return { wedding };
};
