import { API_URL } from '$env/static/private';
import { getRequestEvent } from '$app/server';

export async function getSession() {
	const { request } = getRequestEvent();
	const cookie = request.headers.get('cookie') ?? '';
	try {
		const res = await fetch(`${API_URL}/api/auth/get-session`, {
			headers: { cookie }
		});
		if (!res.ok) return null;
		return res.json();
	} catch {
		return null;
	}
}
