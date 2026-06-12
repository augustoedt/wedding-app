<script lang="ts">
	import { fetchWedding, fetchGifts } from '$lib/wedding.remote';
	import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
	import type { Gift } from '$lib/server/api';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';
	import GiftCard from '$lib/components/GiftCard.svelte';
	import GiftModal from '$lib/components/GiftModal.svelte';

	const LIMIT = 20;

	const wedding = await fetchWedding(PUBLIC_WEDDING_SLUG);
	const initialResult = await fetchGifts({ slug: PUBLIC_WEDDING_SLUG, page: 1, limit: LIMIT });
	let gifts = $state<Gift[]>(initialResult.items.filter((g) => g.paymentType !== null));
	let total = $state(initialResult.total);
	let currentPage = $state(1);
	let loadingMore = $state(false);

	const hasMore = $derived(currentPage * LIMIT < total);

	async function loadMore() {
		loadingMore = true;
		try {
			const result = await fetchGifts({ slug: PUBLIC_WEDDING_SLUG, page: currentPage + 1, limit: LIMIT });
			gifts = [...gifts, ...result.items.filter((g) => g.paymentType !== null)];
			currentPage += 1;
		} finally {
			loadingMore = false;
		}
	}

	let selectedGift = $state<Gift | null>(null);

	function onGiftPurchased(giftId: string) {
		gifts = gifts.map((g) =>
			g.id === giftId ? { ...g, isActive: false, lockedAt: new Date().toISOString() } : g
		);
	}

	function onGiftTaken(giftId: string) {
		gifts = gifts.map((g) =>
			g.id === giftId ? { ...g, isActive: false, lockedAt: null } : g
		);
		selectedGift = null;
	}
</script>

<svelte:head>
	<title>Lista de Presentes</title>
</svelte:head>

<WeddingLayout {wedding} dark>
	<main class="flex-1 pt-20">
		<div class="mx-auto max-w-6xl px-6 py-12">
			<div class="mb-10 text-center">
				<h1 class="font-serif text-4xl font-light text-stone-800">Lista de Presentes</h1>
				<div class="mt-4 flex items-center justify-center gap-3">
					<div class="h-px w-16 bg-stone-200"></div>
					<svg class="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M20 7h-1.26A4 4 0 0 0 15 4a4 4 0 0 0-3 1.35A4 4 0 0 0 9 4a4 4 0 0 0-3.74 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
						/>
					</svg>
					<div class="h-px w-16 bg-stone-200"></div>
				</div>
				<p class="mt-4 text-sm text-stone-500">
					Sua presença é o nosso maior presente. Mas se quiser nos presentear, escolha abaixo.
				</p>
			</div>

			{#if gifts.length === 0}
				<div class="py-20 text-center text-stone-400">
					<svg class="mx-auto mb-4 h-12 w-12" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
						<path
							d="M20 7h-1.26A4 4 0 0 0 15 4a4 4 0 0 0-3 1.35A4 4 0 0 0 9 4a4 4 0 0 0-3.74 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
						/>
					</svg>
					<p>Nenhum presente disponível no momento.</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
					{#each gifts as gift (gift.id)}
						<GiftCard {gift} onBuy={(g) => (selectedGift = g)} />
					{/each}
				</div>

				{#if hasMore}
					<div class="mt-10 flex justify-center">
						<button
							onclick={loadMore}
							disabled={loadingMore}
							class="rounded-lg border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
						>
							{loadingMore ? 'Carregando...' : 'Carregar mais'}
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</main>
</WeddingLayout>

{#if selectedGift}
	<GiftModal
		gift={selectedGift}
		slug={PUBLIC_WEDDING_SLUG}
		onPurchased={onGiftPurchased}
		onAlreadyTaken={onGiftTaken}
		onClose={() => (selectedGift = null)}
	/>
{/if}
