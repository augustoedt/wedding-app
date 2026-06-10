<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let { data, children } = $props();

	const navLinks = [
		{ href: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
		{ href: '/admin/guests', label: 'Convidados', icon: '👥' },
		{ href: '/admin/gifts', label: 'Presentes', icon: '🎁' },
		{ href: '/admin/payments', label: 'Pagamentos', icon: '💳' },
		{ href: '/admin/settings', label: 'Configurações', icon: '⚙️' }
	];

	async function signOut() {
		await authClient.signOut();
		goto('/login');
	}
</script>

<div class="flex min-h-screen bg-slate-100">
	<aside class="flex w-56 flex-col bg-slate-900 text-white">
		<div class="border-b border-slate-700 px-5 py-5">
			<p class="text-xs font-medium tracking-widest text-rose-400 uppercase">Casamento</p>
			<p class="mt-0.5 truncate text-sm font-semibold">{data.user.name}</p>
		</div>

		<nav class="flex-1 space-y-0.5 px-3 py-4">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
						{page.url.pathname.startsWith(link.href)
						? 'bg-rose-500 text-white'
						: 'text-slate-400 hover:bg-slate-800 hover:text-white'}"
				>
					<span>{link.icon}</span>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="border-t border-slate-700 px-4 py-4">
			<p class="mb-2 truncate text-xs text-slate-500">{data.user.email}</p>
			<button
				onclick={signOut}
				class="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
			>
				Sair
			</button>
		</div>
	</aside>

	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>
</div>
