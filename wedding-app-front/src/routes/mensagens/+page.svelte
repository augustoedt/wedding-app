<script lang="ts">
	import { fetchWedding, fetchMessages } from '$lib/wedding.remote';
	import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';

	const wedding = await fetchWedding(PUBLIC_WEDDING_SLUG);
	const messages = await fetchMessages(PUBLIC_WEDDING_SLUG);

	function formatDate(value: string) {
		return new Date(value).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Mensagens | {wedding.title}</title>
</svelte:head>

<WeddingLayout {wedding} dark>
	<main class="flex-1 pt-20">
		<div class="mx-auto max-w-3xl px-6 py-12">
			<div class="mb-12 text-center">
				<h1 class="font-serif text-4xl font-light text-stone-800">Mensagens</h1>
				<div class="mt-4 flex items-center justify-center gap-3">
					<div class="h-px w-16 bg-stone-200"></div>
					<svg class="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 2C9.38 2 7.25 4.13 7.25 6.75c0 2.57 2 4.66 4.56 4.73C11.87 11.48 12 11.5 12 11.5s.13-.02.19-.02c2.56-.07 4.56-2.16 4.56-4.73C16.75 4.13 14.62 2 12 2zm0 7.5c-1.52 0-2.75-1.23-2.75-2.75S10.48 4 12 4s2.75 1.23 2.75 2.75S13.52 9.5 12 9.5z"
						/>
					</svg>
					<div class="h-px w-16 bg-stone-200"></div>
				</div>
			</div>

			{#if messages.length === 0}
				<p class="text-center text-sm text-stone-400">
					Em breve, mensagens dos convidados aparecerão aqui.
				</p>
			{:else}
				<div class="space-y-4">
					{#each messages as item (item.createdAt + item.senderName)}
						<div class="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
							<p class="font-mono text-sm leading-relaxed whitespace-pre-line text-stone-600">
								{item.message}
							</p>
							<div class="mt-4 flex items-center justify-between">
								<p class="text-sm font-medium text-stone-800">{item.senderName}</p>
								<p class="text-xs text-stone-400">{formatDate(item.createdAt)}</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</WeddingLayout>
