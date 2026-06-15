import * as v from 'valibot';
import { query, command } from '$app/server';
import { apiGet, apiPut } from '$lib/server/api';

export type GuestMessage = {
	id: string;
	weddingId: string;
	paymentId: string;
	senderName: string;
	message: string;
	isVisible: boolean;
	createdAt: string;
	updatedAt: string;
};

export const getMessages = query(async () => {
	return apiGet<GuestMessage[]>('/admin/messages');
});

export const setMessageVisibility = command(
	v.object({
		id: v.string(),
		isVisible: v.boolean()
	}),
	async ({ id, isVisible }) => apiPut<GuestMessage>(`/admin/messages/${id}/visibility`, { isVisible })
);
