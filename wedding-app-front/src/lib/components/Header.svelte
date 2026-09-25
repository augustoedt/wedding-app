<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getToken } from '$lib/rsvp-store';

	let { dark = false }: { dark?: boolean } = $props();

	let rsvpToken = $state<string | null>(null);
	onMount(() => {
		rsvpToken = getToken();
	});

	let scrollY = $state(0);
	let mobileOpen = $state(false);
	let menuOpen = $state(false);

	let isScrolled = $derived(dark || scrollY > 60);
	let onLight = $derived(isScrolled || mobileOpen);

	const navItems = [
		{ label: 'Página Inicial', href: '/' },
		{ label: 'Cerimônia & Festa', href: '/cerimonia' },
		{ label: 'Mensagens', href: '/mensagens' }
	];
</script>

<svelte:window bind:scrollY />

<header class="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
	<div
		class="w-full max-w-xl rounded-3xl transition-[background-color,box-shadow] duration-500 ease-out-expo md:w-max md:max-w-none md:rounded-full {onLight
			? 'bg-white/85 shadow-soft ring-1 ring-stone-900/5 backdrop-blur-xl'
			: 'bg-transparent'}"
	>
		<div class="flex items-center justify-end px-5 py-2.5">
			<!-- Desktop nav -->
			<nav class="hidden items-center gap-7 md:flex">
				<div class="relative">
					<button
						class="flex items-center gap-1.5 text-[13px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 {onLight
							? 'text-stone-700 hover:text-stone-900'
							: 'text-white/90 hover:text-white'}"
						onclick={() => (menuOpen = !menuOpen)}
					>
						Menu
						<svg
							class="h-3 w-3 transition-transform duration-300 ease-out-expo"
							class:rotate-180={menuOpen}
							viewBox="0 0 11 6"
							fill="none"
						>
							<path
								d="M1 1l4.5 4L10 1"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>

					{#if menuOpen}
						<ul
							transition:fly={{ y: -8, duration: 250, easing: (t) => 1 - Math.pow(1 - t, 3) }}
							class="absolute top-full left-1/2 mt-3 min-w-52 -translate-x-1/2 rounded-2xl bg-white/95 py-1.5 shadow-lift ring-1 ring-stone-900/5 backdrop-blur-xl"
							onmouseleave={() => (menuOpen = false)}
						>
							{#each navItems as item (item.href)}
								<li>
									<a
										href={item.href}
										class="block px-5 py-2.5 text-sm transition-colors duration-200 hover:bg-cream-100 {page
											.url.pathname === item.href
											? 'font-medium text-blush-600'
											: 'text-stone-600'}"
										onclick={() => (menuOpen = false)}
									>
										{item.label}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<a
					href={resolve('/presentes')}
					class="text-[13px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 {onLight
						? page.url.pathname === '/presentes'
							? 'text-blush-600'
							: 'text-stone-700 hover:text-stone-900'
						: 'text-white/90 hover:text-white'}"
				>
					Presentes
				</a>

				{#if rsvpToken}
					<a
						href={resolve(`/confirmacao/${rsvpToken}`)}
						class="text-[13px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 {onLight
							? 'text-stone-700 hover:text-stone-900'
							: 'text-white/90 hover:text-white'}"
					>
						Minha confirmação
					</a>
				{/if}
			</nav>

			<!-- Mobile hamburger (morphs into X) -->
			<button
				class="relative flex h-9 w-9 items-center justify-center md:hidden {onLight
					? 'text-stone-800'
					: 'text-white'}"
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-label="Menu"
				aria-expanded={mobileOpen}
			>
				<span
					class="absolute h-px w-5 bg-current transition-all duration-300 ease-out-expo {mobileOpen
						? 'rotate-45'
						: '-translate-y-[3.5px]'}"
				></span>
				<span
					class="absolute h-px w-5 bg-current transition-all duration-300 ease-out-expo {mobileOpen
						? '-rotate-45'
						: 'translate-y-[3.5px]'}"
				></span>
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileOpen}
			<nav transition:fade={{ duration: 200 }} class="px-3 pb-3 md:hidden">
				<ul>
					{#each navItems as item, i (item.href)}
						<li in:fly={{ y: 12, duration: 300, delay: 60 + i * 60 }}>
							<a
								href={item.href}
								class="block rounded-xl px-4 py-3 text-sm transition-colors duration-200 hover:bg-cream-100 {page
									.url.pathname === item.href
									? 'font-medium text-blush-600'
									: 'text-stone-700'}"
								onclick={() => (mobileOpen = false)}
							>
								{item.label}
							</a>
						</li>
					{/each}
					<li in:fly={{ y: 12, duration: 300, delay: 60 + navItems.length * 60 }}>
						<a
							href={resolve('/presentes')}
							class="block rounded-xl px-4 py-3 text-sm transition-colors duration-200 hover:bg-cream-100 {page
								.url.pathname === '/presentes'
								? 'font-medium text-blush-600'
								: 'text-stone-700'}"
							onclick={() => (mobileOpen = false)}
						>
							Presentes
						</a>
					</li>
					{#if rsvpToken}
						<li in:fly={{ y: 12, duration: 300, delay: 120 + navItems.length * 60 }}>
							<a
								href={resolve(`/confirmacao/${rsvpToken}`)}
								class="block rounded-xl px-4 py-3 text-sm text-stone-700 transition-colors duration-200 hover:bg-cream-100"
								onclick={() => (mobileOpen = false)}
							>
								Minha confirmação de presença
							</a>
						</li>
					{/if}
				</ul>
			</nav>
		{/if}
	</div>
</header>
