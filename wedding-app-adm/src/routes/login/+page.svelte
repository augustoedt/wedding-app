<script lang="ts">
	import { goto } from '$app/navigation';
	import { signIn } from '$lib/api/auth.remote';

	let email = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		errorMsg = '';

		const result = await signIn({ email, password });

		if (!result.success) {
			errorMsg = result.error;
			loading = false;
		} else {
			goto('/admin');
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-rose-50">
	<div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
		<div class="mb-8 text-center">
			<h1 class="text-2xl font-semibold text-slate-800">Painel Administrativo</h1>
			<p class="mt-1 text-sm text-slate-500">Entre com sua conta para continuar</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-slate-700">E-mail</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					autocomplete="email"
					class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
					placeholder="seu@email.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-slate-700">Senha</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					autocomplete="current-password"
					class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
					placeholder="••••••••"
				/>
			</div>

			{#if errorMsg}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-60"
			>
				{loading ? 'Entrando…' : 'Entrar'}
			</button>
		</form>
	</div>
</div>
