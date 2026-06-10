import * as v from 'valibot';
import { query, command } from '$app/server';
import { apiGet, apiPut } from '$lib/server/api';


export type PaymentStatus = 'pending_confirmation' | 'approved' | 'expired';

export type GiftPayment = {
	id: string;
	giftId: string;
	weddingId: string;
	buyerName: string;
	buyerEmail: string;
	amount: number;
	status: PaymentStatus;
	mercadoPagoId?: string | null;
	mercadoPagoPreferenceId?: string | null;
	createdAt: string;
	updatedAt: string;
};

export const getPayments = query(async () => {
	return apiGet<GiftPayment[]>('/admin/payments');
});

export const confirmPayment = command(
	v.string(),
	async (id) => apiPut<{ id: string; status: 'approved' }>(`/admin/payments/${id}/confirm`, {})
);
