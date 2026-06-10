import { browser } from '$app/environment';

const KEY = 'rsvp_token';

export function saveToken(token: string): void {
	if (!browser) return;
	localStorage.setItem(KEY, token);
}

export function getToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(KEY);
}
