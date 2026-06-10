import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { sequence } from '@sveltejs/kit/hooks';
import { API_URL } from '$env/static/private';

const authHandler: Handle = async ({ event, resolve }) => {
	const cookie = event.request.headers.get('cookie') ?? '';
	if (cookie) {
		try {
			const res = await fetch(`${API_URL}/api/auth/get-session`, {
				headers: { cookie }
			});
			if (res.ok) {
				const data = await res.json();
				if (data?.user) {
					event.locals.user = data.user;
					event.locals.session = data.session;
				}
			}
		} catch {
			// session fetch failed — continue unauthenticated
		}
	}
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(authHandler, handleParaglide);
