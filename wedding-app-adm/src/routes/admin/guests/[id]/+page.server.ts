import type { PageServerLoad } from './$types';
import { apiGet } from '$lib/server/api';
import type { Guest } from '$lib/api/guests.remote';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	if (id === 'new') return { id, guest: null as Guest | null };
	const guest = await apiGet<Guest>(`/admin/guests/${id}`);
	return { id, guest };
};
