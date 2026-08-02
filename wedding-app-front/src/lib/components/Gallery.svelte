<script lang="ts">
	import type { Gallery } from '$lib/server/api';

	let { gallery }: { gallery: Gallery } = $props();

	let selectedIndex = $state<number | null>(null);
	const selectedImage = $derived(selectedIndex !== null ? gallery.images[selectedIndex] : null);

	function open(index: number) {
		selectedIndex = index;
	}

	function close() {
		selectedIndex = null;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<section class="bg-white py-16">
	<div class="mx-auto max-w-5xl px-6">
		<div class="mb-10 text-center">
			<h2 class="font-serif text-3xl font-light text-stone-800">{gallery.title}</h2>
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

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
			{#each gallery.images as image, i (image.id)}
				<button
					onclick={() => open(i)}
					class="aspect-square overflow-hidden rounded-xl bg-stone-100 transition hover:opacity-90"
				>
					<img
						src={image.url}
						alt={image.description ?? gallery.title}
						class="h-full w-full object-cover"
						loading="lazy"
					/>
				</button>
			{/each}
		</div>
	</div>
</section>

{#if selectedImage}
	<div
		role="dialog"
		aria-modal="true"
		aria-label={gallery.title}
		tabindex="-1"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
		onclick={close}
		onkeydown={onKeydown}
	>
		<button
			onclick={close}
			aria-label="Fechar"
			class="absolute top-6 right-6 text-white/70 transition hover:text-white"
		>
			<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" />
			</svg>
		</button>

		<div role="presentation" onclick={(e) => e.stopPropagation()}>
			<img
				src={selectedImage.url}
				alt={selectedImage.description ?? gallery.title}
				class="max-h-full max-w-full rounded-lg object-contain"
			/>
		</div>
	</div>
{/if}
