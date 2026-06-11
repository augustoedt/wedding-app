import * as v from 'valibot';
import { command } from '$app/server';
import { signInWithEmail, signOut as endSession } from '$lib/server/auth';

export const signIn = command(
	v.object({ email: v.string(), password: v.string() }),
	async ({ email, password }) => signInWithEmail(email, password)
);

export const signOut = command(async () => {
	await endSession();
});
