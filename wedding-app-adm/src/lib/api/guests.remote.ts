import * as v from 'valibot';
import { query, command } from '$app/server';
import { apiGet, apiPost, apiPut, apiDelete } from '$lib/server/api';

export type RsvpStatus = 'pending' | 'confirmed' | 'declined';

export type Guest = {
	id: string;
	weddingId: string;
	name: string;
	email?: string | null;
	phone?: string | null;
	rsvp: RsvpStatus;
	plusOne: number;
	inviteSent: boolean;
	rsvpToken?: string | null;
	createdAt: string;
	updatedAt: string;
};

export const getGuests = query(async () => {
	return apiGet<Guest[]>('/admin/guests');
});

export const getGuest = query(v.string(), async (id) => {
	return apiGet<Guest>(`/admin/guests/${id}`);
});

export const addGuest = command(
	v.object({
		name: v.string(),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		plusOne: v.optional(v.number())
	}),
	async (data) => apiPost<Guest>('/admin/guests', data)
);

export const updateGuest = command(
	v.object({
		id: v.string(),
		name: v.optional(v.string()),
		email: v.optional(v.nullable(v.string())),
		phone: v.optional(v.nullable(v.string())),
		rsvp: v.optional(v.picklist(['pending', 'confirmed', 'declined'])),
		plusOne: v.optional(v.number()),
		inviteSent: v.optional(v.boolean())
	}),
	async ({ id, ...body }) => apiPut<Guest>(`/admin/guests/${id}`, body)
);

export const deleteGuest = command(
	v.string(),
	async (id) => apiDelete(`/admin/guests/${id}`)
);
