// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				name: string;
				email: string;
				image?: string | null;
			};
			session?: {
				id: string;
				expiresAt: Date;
				token: string;
				createdAt: Date;
				updatedAt: Date;
				userId: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
