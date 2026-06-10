import { getRequestEvent } from '$app/server';
import { API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';

function cookieHeader() {
	const { request } = getRequestEvent();
	return request.headers.get('cookie') ?? '';
}

export async function apiGet<T>(path: string): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		headers: { cookie: cookieHeader() }
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({ message: 'Request failed' }));
		error(res.status, body.message ?? 'Request failed');
	}
	return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', cookie: cookieHeader() },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		const b = await res.json().catch(() => ({ message: 'Request failed' }));
		error(res.status, b.message ?? 'Request failed');
	}
	return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', cookie: cookieHeader() },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		const b = await res.json().catch(() => ({ message: 'Request failed' }));
		error(res.status, b.message ?? 'Request failed');
	}
	return res.json();
}

export async function apiDelete(path: string): Promise<void> {
	const res = await fetch(`${API_URL}${path}`, {
		method: 'DELETE',
		headers: { cookie: cookieHeader() }
	});
	if (!res.ok) {
		const b = await res.json().catch(() => ({ message: 'Request failed' }));
		error(res.status, b.message ?? 'Request failed');
	}
}
