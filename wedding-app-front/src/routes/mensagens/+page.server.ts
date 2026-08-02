import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
import { getWedding, getMessages } from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [wedding, messages] = await Promise.all([
		getWedding(PUBLIC_WEDDING_SLUG),
		getMessages(PUBLIC_WEDDING_SLUG)
	]);
	return { wedding, messages };
};
