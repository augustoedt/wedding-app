<script lang="ts">
	import type { Gift } from '$lib/server/api';

	let {
		gift,
		onBuy
	}: {
		gift: Gift;
		onBuy: (gift: Gift) => void;
	} = $props();

	function formatPrice(cents: number) {
		return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
			cents / 100
		);
	}

	const isBought = $derived(!gift.isActive && !gift.lockedAt);
	const isLocked = $derived(!gift.isActive && !!gift.lockedAt);
</script>

<div
	class="flex flex-col overflow-hidden rounded-xl border border-stone-100 bg-white shadow-sm transition"
	class:grayscale={isBought}
	class:opacity-60={isBought}
	class:opacity-75={isLocked}
>
	<!-- Image -->
	<div class="relative aspect-square bg-stone-100">
		{#if gift.imageUrl}
			<img src={gift.imageUrl} alt={gift.name} class="h-full w-full object-cover" loading="lazy" />
		{:else}
			<div class="flex h-full w-full items-center justify-center">
				<svg class="h-16 w-16 text-stone-300" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M20 7h-1.26A4 4 0 0 0 15 4a4 4 0 0 0-3 1.35A4 4 0 0 0 9 4a4 4 0 0 0-3.74 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 6a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2zM9 6a2 2 0 0 1 1.26.5A4 4 0 0 0 8 10H6V9a2 2 0 0 1 2-2zm11 13H4V11h16z"
					/>
				</svg>
			</div>
		{/if}

		{#if isBought}
			<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
				<svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path
						d="M20 7h-1.26A4 4 0 0 0 15 4a4 4 0 0 0-3 1.35A4 4 0 0 0 9 4a4 4 0 0 0-3.74 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
					/>
				</svg>
				<span class="text-sm font-semibold tracking-widest uppercase text-white drop-shadow">
					Presenteado
				</span>
			</div>
		{/if}
	</div>

	<!-- Info -->
	<div class="flex flex-1 flex-col gap-2 p-4">
		<p class="line-clamp-2 text-sm font-medium text-stone-800">{gift.name}</p>
		{#if gift.description}
			<p class="line-clamp-2 text-xs text-stone-500">{gift.description}</p>
		{/if}
		<p class="mt-auto text-base font-semibold text-stone-700">{formatPrice(gift.price)}</p>

		{#if isBought}
			<span class="rounded-lg bg-stone-100 py-2.5 text-center text-xs font-medium text-stone-400">
				Já presenteado
			</span>
		{:else if isLocked}
			<span class="rounded-lg bg-amber-50 py-2.5 text-center text-sm font-medium text-amber-600">
				Reservado
			</span>
		{:else}
			<button
				onclick={() => onBuy(gift)}
				class="rounded-lg bg-stone-800 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
			>
				Comprar
			</button>
		{/if}
	</div>
</div>
