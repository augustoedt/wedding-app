import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
import { getWedding, getGuestRsvp } from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [wedding, guestRsvp] = await Promise.all([
		getWedding(PUBLIC_WEDDING_SLUG),
		getGuestRsvp(params.token)
	]);
	return { token: params.token, wedding, guestRsvp };
};
