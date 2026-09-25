<script lang="ts">
	import type { Gallery } from '$lib/server/api';
	import { reveal } from '$lib/actions/reveal';
	import { tick } from 'svelte';

	let { gallery }: { gallery: Gallery } = $props();

	const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
	const EASE_IN = 'cubic-bezier(0.5, 0, 0.75, 0)';

	let selectedIndex = $state<number | null>(null);
	const selectedImage = $derived(selectedIndex !== null ? gallery.images[selectedIndex] : null);

	let gridEl = $state<HTMLDivElement | null>(null);
	let modalCard = $state<HTMLDivElement | null>(null);
	let modalImg = $state<HTMLImageElement | null>(null);
	let settled = $state(false);
	let cardStyle = $state('opacity: 0;');
	let closing = false;
	let originRect: DOMRect | null = null;

	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function thumbRect(index: number): DOMRect | null {
		return gridEl?.querySelectorAll('button')[index]?.getBoundingClientRect() ?? null;
	}

	/* FLIP: transform that moves `to` rect back onto `from` rect */
	function flyTransform(from: DOMRect, to: DOMRect) {
		const dx = from.left + from.width / 2 - (to.left + to.width / 2);
		const dy = from.top + from.height / 2 - (to.top + to.height / 2);
		return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`;
	}

	/* Wait until the modal image is decoded so the card has its final size before measuring */
	async function waitForImage(img: HTMLImageElement | null) {
		if (!img || img.complete) return;
		try {
			await Promise.race([img.decode(), new Promise((r) => setTimeout(r, 800))]);
		} catch {
			/* decode rejects on broken images — proceed anyway */
		}
	}

	async function open(index: number) {
		if (closing) return;
		originRect = thumbRect(index);
		settled = false;
		cardStyle = 'opacity: 0;';
		selectedIndex = index;
		await tick();

		const card = modalCard;
		if (!card) return;

		await waitForImage(modalImg);
		if (closing) return;

		if (originRect && !reduceMotion) {
			const target = card.getBoundingClientRect();
			cardStyle = `opacity: 1; transform: ${flyTransform(originRect, target)}; transition: none;`;
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
			cardStyle = `opacity: 1; transform: none; transition: transform 0.5s ${EASE_OUT}, opacity 0.3s ease;`;
		} else {
			cardStyle = 'opacity: 1; transition: opacity 0.3s ease;';
		}
		settled = true;
	}

	function close() {
		if (closing || selectedIndex === null) return;
		closing = true;
		settled = false;

		const card = modalCard;
		const target = thumbRect(selectedIndex);
		const canFly = !!(card && target && !reduceMotion);

		if (canFly && card && target) {
			const from = card.getBoundingClientRect();
			cardStyle = `opacity: 0; transform: ${flyTransform(target, from)}; transition: transform 0.35s ${EASE_IN}, opacity 0.35s ease;`;
		} else {
			cardStyle = 'opacity: 0; transition: opacity 0.25s ease;';
		}

		setTimeout(
			() => {
				selectedIndex = null;
				closing = false;
			},
			canFly ? 380 : 260
		);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<section class="py-24 md:py-32">
	<div class="mx-auto max-w-5xl px-6" use:reveal data-reveal>
		<div class="mb-14 text-center">
			<h2 class="font-serif text-3xl font-light text-stone-800 md:text-4xl">{gallery.title}</h2>
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

		<div
			bind:this={gridEl}
			class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4"
		>
			{#each gallery.images as image, i (image.id)}
				<button
					onclick={() => open(i)}
					class="group rounded-sm bg-white p-2 shadow-soft transition duration-500 ease-out-expo hover:-translate-y-1 hover:rotate-0 hover:shadow-lift active:scale-[0.98] sm:odd:-rotate-1 sm:even:rotate-1"
				>
					<div class="aspect-square overflow-hidden bg-cream-100">
						<img
							src={image.url}
							alt={image.description ?? gallery.title}
							class="h-full w-full object-cover transition duration-700 ease-out-expo group-hover:scale-[1.06]"
							loading="lazy"
						/>
					</div>
					<div class="flex h-9 items-center justify-center px-1">
						{#if image.description}
							<span class="truncate font-script text-lg text-stone-500">
								{image.description}
							</span>
						{/if}
					</div>
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
		class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-6 backdrop-blur-sm transition-opacity duration-300"
		class:opacity-0={!settled}
		onclick={close}
		onkeydown={onKeydown}
	>
		<div
			bind:this={modalCard}
			role="presentation"
			class="relative max-w-2xl rounded-sm bg-white p-3 shadow-lift will-change-transform"
			style={cardStyle}
			onclick={(e) => e.stopPropagation()}
		>
			<button
				onclick={close}
				aria-label="Fechar"
				class="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-600 shadow-soft ring-1 ring-stone-900/5 transition duration-300 hover:text-stone-900 hover:shadow-lift active:scale-90"
			>
				<svg
					class="h-5 w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" />
				</svg>
			</button>

			<img
				bind:this={modalImg}
				src={selectedImage.url}
				alt={selectedImage.description ?? gallery.title}
				class="max-h-[70vh] max-w-full object-contain"
			/>

			<div class="flex h-12 items-center justify-center px-2">
				{#if selectedImage.description}
					<span class="truncate font-script text-2xl text-stone-500">
						{selectedImage.description}
					</span>
				{/if}
			</div>
		</div>
	</div>
{/if}
