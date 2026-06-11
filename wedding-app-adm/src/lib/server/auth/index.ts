import { API_URL } from '$env/static/private';
import { getRequestEvent } from '$app/server';
import { parseSetCookieHeader, toCookieOptions } from 'better-auth/cookies';

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

function forwardSetCookies(res: Response) {
	const { cookies } = getRequestEvent();
	for (const header of res.headers.getSetCookie()) {
		for (const [name, attrs] of parseSetCookieHeader(header)) {
			const { domain, path, ...options } = toCookieOptions(attrs);
			cookies.set(name, attrs.value, { ...options, path: path ?? '/' });
		}
	}
}

export async function signInWithEmail(email: string, password: string) {
	const { url } = getRequestEvent();
	const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', origin: url.origin },
		body: JSON.stringify({ email, password })
	});

	if (!res.ok) {
		const data = await res.json().catch(() => null);
		return { success: false as const, error: data?.message ?? 'Credenciais inválidas' };
	}

	forwardSetCookies(res);
	return { success: true as const };
}

export async function signOut() {
	const { request, url } = getRequestEvent();
	const res = await fetch(`${API_URL}/api/auth/sign-out`, {
		method: 'POST',
		headers: { cookie: request.headers.get('cookie') ?? '', origin: url.origin }
	});
	forwardSetCookies(res);
}
