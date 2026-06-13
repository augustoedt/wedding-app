<script lang="ts">
	import type { Wedding } from '$lib/api';
	import { parseDateOnly } from '$lib/utils/date';

	let { wedding }: { wedding: Wedding } = $props();

	function formatDate(dateStr: string) {
		const d = parseDateOnly(dateStr);
		return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
	}

	function coupleName(title: string) {
		return title.replace(/\s*\|\s*.*$/, '').trim();
	}
</script>

<section class="relative flex h-screen w-full items-center justify-center overflow-hidden">
	{#if wedding.coverImage}
		<img
			src={wedding.coverImage}
			alt={wedding.title}
			class="absolute inset-0 h-full w-full object-cover"
		/>
	{:else}
		<div class="absolute inset-0 bg-stone-700"></div>
	{/if}

	<!-- Overlay -->
	<div class="absolute inset-0 bg-black/40"></div>

	<!-- Content -->
	<div class="relative z-10 flex flex-col items-center gap-4 px-6 text-center text-white">
		{#if wedding.date}
			<p class="text-xs font-medium tracking-[0.3em] uppercase opacity-80">
				CASARAM EM &mdash; {formatDate(wedding.date)}
			</p>
		{/if}

		<h1 class="font-serif text-6xl font-light leading-tight md:text-8xl">
			{coupleName(wedding.title)}
		</h1>
	</div>

	<!-- Scroll hint -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
		<svg class="h-6 w-6 text-white/60" viewBox="0 0 24 24" fill="none">
			<path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	</div>
</section>
