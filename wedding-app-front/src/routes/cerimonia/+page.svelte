<script lang="ts">
	import { untrack } from 'svelte';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';
	import type { Wedding } from '$lib/api';

	let { data } = $props();
	const wedding = untrack(() => data.wedding);

	function addressLines(w: Wedding): string[] {
		const street = [w.venueAddress, w.venueNumber].filter(Boolean).join(', ');
		const line1 = [street, w.venueNeighborhood].filter(Boolean).join(' - ');

		const cityState = [w.venueCity, w.venueState].filter(Boolean).join(' - ');
		const line2 = [cityState, w.venueCep].filter(Boolean).join(', ');

		return [line1, line2].filter(Boolean);
	}

	const hasVenue = $derived(
		!!(wedding.venueName || wedding.venueAddress || wedding.venueImage || wedding.venueTime)
	);
	const hasDressCode = $derived(!!(wedding.dressCodeGuests || wedding.dressCodeGroomsmen));

	const mapsQuery = $derived(
		[
			wedding.venueAddress,
			wedding.venueNumber,
			wedding.venueNeighborhood,
			wedding.venueCity,
			wedding.venueState
		]
			.filter(Boolean)
			.join(', ')
	);

	const mapsEmbedUrl = $derived(
		mapsQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed` : null
	);

	const mapsUrl = $derived(
		mapsQuery
			? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
			: null
	);
</script>

<svelte:head>
	<title>Cerimônia & Festa | {wedding.title}</title>
</svelte:head>

<WeddingLayout {wedding} dark>
	<main class="flex-1 pt-20">
		<div class="mx-auto max-w-3xl px-6 py-12">
			<div class="mb-12 text-center">
				<h1 class="font-serif text-4xl font-light text-stone-800">Cerimônia & Festa</h1>
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

			<!-- Local -->
			<section class="mb-16">
				<h2 class="mb-6 text-center text-sm font-medium tracking-[0.3em] text-stone-500 uppercase">
					Local
				</h2>

				{#if hasVenue}
					{#if wedding.venueImage}
						<img
							src={wedding.venueImage}
							alt={wedding.venueName ?? 'Local da cerimônia'}
							class="mb-6 h-64 w-full rounded-2xl object-cover md:h-80"
						/>
					{/if}

					{#if wedding.venueName}
						<p class="text-center font-serif text-3xl font-light text-stone-800">
							{wedding.venueName}
						</p>
					{/if}

					{#each addressLines(wedding) as line (line)}
						<p class="mt-1 text-center text-sm text-stone-500">{line}</p>
					{/each}

					{#if wedding.venueTime}
						<p
							class="mt-4 text-center text-sm font-medium tracking-widest text-stone-600 uppercase"
						>
							{wedding.venueTime}
						</p>
					{/if}

					{#if mapsEmbedUrl}
						<div class="mt-6 overflow-hidden rounded-2xl border border-stone-100">
							<iframe
								src={mapsEmbedUrl}
								title="Mapa do local da cerimônia"
								class="h-64 w-full md:h-80"
								style="border:0"
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
							></iframe>
						</div>
					{/if}

					{#if mapsUrl}
						<div class="mt-4 text-center">
							<a
								href={mapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 rounded-full border border-stone-200 px-6 py-2.5 text-sm font-medium text-stone-600 transition hover:border-stone-400 hover:text-stone-800"
							>
								<svg
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path
										d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11z"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<circle cx="12" cy="10" r="2.5" />
								</svg>
								Ver no mapa
							</a>
						</div>
					{/if}
				{:else}
					<p class="text-center text-sm text-stone-400">Em breve, mais detalhes sobre o local.</p>
				{/if}
			</section>

			<!-- Divider -->
			<div class="mb-16 flex items-center justify-center gap-4">
				<div class="h-px flex-1 bg-stone-200"></div>
				<svg class="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 2C9.38 2 7.25 4.13 7.25 6.75c0 2.57 2 4.66 4.56 4.73C11.87 11.48 12 11.5 12 11.5s.13-.02.19-.02c2.56-.07 4.56-2.16 4.56-4.73C16.75 4.13 14.62 2 12 2zm0 7.5c-1.52 0-2.75-1.23-2.75-2.75S10.48 4 12 4s2.75 1.23 2.75 2.75S13.52 9.5 12 9.5z"
					/>
				</svg>
				<div class="h-px flex-1 bg-stone-200"></div>
			</div>

			<!-- Dress code -->
			<section>
				<h2 class="mb-6 text-center text-sm font-medium tracking-[0.3em] text-stone-500 uppercase">
					Dress Code
				</h2>

				{#if hasDressCode}
					<div class="space-y-8">
						{#if wedding.dressCodeGuests}
							<div class="space-y-3 text-center font-mono text-sm leading-relaxed text-stone-600">
								{#each wedding.dressCodeGuests.split('\n\n') as paragraph (paragraph)}
									<p>{paragraph}</p>
								{/each}
							</div>
						{/if}

						{#if wedding.dressCodeGroomsmen}
							<div>
								<p
									class="mb-2 text-center text-xs font-medium tracking-widest text-stone-400 uppercase"
								>
									Padrinhos e madrinhas
								</p>
								<div class="space-y-3 text-center font-mono text-sm leading-relaxed text-stone-600">
									{#each wedding.dressCodeGroomsmen.split('\n\n') as paragraph (paragraph)}
										<p>{paragraph}</p>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<p class="text-center text-sm text-stone-400">Em breve, mais detalhes sobre o traje.</p>
				{/if}
			</section>
		</div>
	</main>
</WeddingLayout>
