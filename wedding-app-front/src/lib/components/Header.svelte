<script lang="ts">
	import { onMount } from 'svelte';
	import type { Wedding } from '$lib/api';
	import { resolve } from '$app/paths';
	import { getToken } from '$lib/rsvp-store';

	let { wedding, slug, dark = false }: { wedding: Wedding; slug: string; dark?: boolean } = $props();

	let rsvpToken = $state<string | null>(null);
	onMount(() => {
		rsvpToken = getToken();
	});

	let scrollY = $state(0);
	let mobileOpen = $state(false);
	let menuOpen = $state(false);

	let isScrolled = $derived(dark || scrollY > 60);

	const navItems = $derived([
		{ label: 'Página Inicial', href: `/${slug}` },
		{ label: 'Cerimônia & Festa', href: `/${slug}/cerimonia` },
		{ label: 'Dicas de Hospedagem', href: `/${slug}/hospedagem` },
		{ label: 'Dress Code', href: `/${slug}/dresscode` },
		{ label: 'Mensagens', href: `/${slug}/mensagens` }
	]);

	function coupleInitials(title: string) {
		const parts = title.split(/[\s&eE]+/).filter(Boolean);
		if (parts.length >= 2) return `${parts[0][0]} & ${parts[parts.length - 1][0]}`;
		return title;
	}
</script>

<svelte:window bind:scrollY />

<header
	class="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
	class:bg-white={isScrolled}
	class:shadow-sm={isScrolled}
	class:bg-transparent={!isScrolled}
>
	<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
		<!-- Couple initials -->
		<a
			href={resolve(`/${slug}`)}
			class="font-serif text-2xl font-light tracking-widest transition-colors"
			class:text-white={!isScrolled}
			class:text-stone-800={isScrolled}
		>
			{coupleInitials(wedding.title)}
		</a>

		<!-- Desktop nav -->
		<nav class="hidden items-center gap-8 md:flex">
			<div class="relative">
				<button
					class="flex items-center gap-1 text-sm font-medium tracking-widest uppercase transition-colors"
					class:text-white={!isScrolled}
					class:text-stone-800={isScrolled}
					onclick={() => (menuOpen = !menuOpen)}
				>
					Menu
					<svg
						class="h-3 w-3 transition-transform"
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
						class="absolute top-full left-0 mt-2 min-w-52 rounded-md bg-white py-1 shadow-lg"
						onmouseleave={() => (menuOpen = false)}
					>
						{#each navItems as item (item.href)}
							<li>
								<a
									href={resolve(`/${slug}`)}
									class="block px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
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
				href={resolve(`/presentes/${slug}`)}
				class="text-sm font-medium tracking-widest uppercase transition-colors"
				class:text-white={!isScrolled}
				class:text-stone-800={isScrolled}
			>
				Presentes
			</a>

			{#if rsvpToken}
				<a
					href={resolve(`/confirmacao/${rsvpToken}`)}
					class="text-sm font-medium tracking-widest uppercase transition-colors"
					class:text-white={!isScrolled}
					class:text-stone-800={isScrolled}
				>
					Minha Confirmação
				</a>
			{/if}
		</nav>

		<!-- Mobile hamburger -->
		<button
			class="flex flex-col gap-1.5 md:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Menu"
		>
			<span class="block h-0.5 w-6 transition-colors" class:bg-white={!isScrolled} class:bg-stone-800={isScrolled}></span>
			<span class="block h-0.5 w-6 transition-colors" class:bg-white={!isScrolled} class:bg-stone-800={isScrolled}></span>
			<span class="block h-0.5 w-6 transition-colors" class:bg-white={!isScrolled} class:bg-stone-800={isScrolled}></span>
		</button>
	</div>

	<!-- Mobile menu -->
	{#if mobileOpen}
		<div class="border-t border-stone-200 bg-white md:hidden">
			<ul class="px-6 py-2">
				{#each navItems as item (item.href)}
					<li>
						<a
							href={resolve(`/${slug}`)}
							class="block border-b border-stone-100 py-3 text-sm text-stone-700"
							onclick={() => (mobileOpen = false)}
						>
							{item.label}
						</a>
					</li>
				{/each}
				<li>
					<a
						href={resolve(`/presentes/${slug}`)}
						class="block border-b border-stone-100 py-3 text-sm text-stone-700"
						onclick={() => (mobileOpen = false)}
					>
						Presentes
					</a>
				</li>
				{#if rsvpToken}
					<li>
						<a
							href={resolve(`/confirmacao/${rsvpToken}`)}
							class="block py-3 text-sm text-stone-700"
							onclick={() => (mobileOpen = false)}
						>
							Minha Confirmação
						</a>
					</li>
				{/if}
			</ul>
		</div>
	{/if}
</header>
