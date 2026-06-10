import type { PageServerLoad } from './$types';
import { apiGet } from '$lib/server/api';
import type { Wedding } from '$lib/api/wedding.remote';

export const load: PageServerLoad = async () => {
	try {
		const wedding = await apiGet<Wedding>('/admin/wedding/me');
		return { wedding };
	} catch {
		return { wedding: null as Wedding | null };
	}
};
