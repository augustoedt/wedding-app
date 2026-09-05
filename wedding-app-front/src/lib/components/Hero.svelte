<script lang="ts">
	import type { Wedding } from '$lib/api';
	import { parseDateOnly } from '$lib/utils/date';

	let { wedding }: { wedding: Wedding } = $props();

	function formatDate(dateStr: string) {
		const d = parseDateOnly(dateStr);
		return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function coupleName(title: string) {
		return title.replace(/\s*\|\s*.*$/, '').trim();
	}

	function hasPassed(dateStr: string) {
		return parseDateOnly(dateStr) < new Date(new Date().toDateString());
	}
</script>

<section
	class="relative flex min-h-dvh w-full items-start justify-center overflow-hidden"
>
	{#if wedding.coverImage}
		<img
			src={wedding.coverImage}
			alt={wedding.title}
			class="animate-hero-zoom absolute inset-0 h-full w-full object-cover"
		/>
	{:else}
		<div class="absolute inset-0 bg-stone-700"></div>
	{/if}

	<!-- Cinematic warm gradient overlay (single light direction: top) -->
	<div class="absolute inset-0 bg-gradient-to-b from-stone-950/45 via-stone-950/25 to-stone-950/70"></div>

	<!-- Content -->
	<div
		class="relative z-10 flex flex-col items-center gap-6 px-6 pt-24 text-center text-white md:pt-32"
	>
		{#if wedding.date}
			<p
				class="animate-hero-in max-w-xs text-[11px] leading-relaxed font-medium tracking-[0.35em] text-balance uppercase opacity-90 md:max-w-none md:text-xs"
			>
				{hasPassed(wedding.date) ? 'Casaram em' : 'Casamento'} &mdash; {formatDate(wedding.date)}
			</p>
		{/if}

		<h1
			class="animate-hero-in animate-delay-150 font-script text-7xl leading-tight text-balance drop-shadow-[0_2px_24px_rgb(0_0_0/0.35)] md:text-9xl"
		>
			{coupleName(wedding.title)}
		</h1>
	</div>

	<!-- Scroll hint -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
		<svg class="h-6 w-6 text-white/70" viewBox="0 0 24 24" fill="none">
			<path
				d="M12 5v14M5 12l7 7 7-7"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		</svg>
	</div>
</section>
