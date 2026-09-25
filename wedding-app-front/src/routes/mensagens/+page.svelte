<script lang="ts">
	import { untrack } from 'svelte';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';
	import { reveal } from '$lib/actions/reveal';

	let { data } = $props();
	const wedding = untrack(() => data.wedding);
	const messages = untrack(() => data.messages);

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
	<main class="flex-1 pt-24">
		<div class="mx-auto max-w-3xl px-6 py-16 md:py-20">
			<div class="mb-16 text-center">
				<h1 class="font-serif text-4xl font-light text-stone-800 md:text-5xl">Mensagens</h1>
				<div class="mt-5 flex items-center justify-center gap-3">
					<div class="h-px w-16 bg-stone-200"></div>
					<svg class="h-4 w-4 text-blush-400" viewBox="0 0 24 24" fill="currentColor">
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
				<div class="space-y-5">
					{#each messages as item (item.createdAt + item.senderName)}
						<div
							use:reveal
							data-reveal
							class="texture-paper rounded-3xl bg-white p-7 shadow-soft transition duration-500 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift"
						>
							<p class="text-[15px] leading-loose font-light whitespace-pre-line text-stone-600">
								{item.message}
							</p>
							<div class="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
								<p class="font-serif text-base font-medium text-stone-800 italic">
									{item.senderName}
								</p>
								<p class="text-xs tracking-wide text-stone-400">{formatDate(item.createdAt)}</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</WeddingLayout>
