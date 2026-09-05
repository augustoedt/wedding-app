<script lang="ts">
	import FlipCard from './FlipCard.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { parseDateOnly } from '$lib/utils/date';

	let { date }: { date: string } = $props();

	const weddingDate = $derived(parseDateOnly(date));
	const isPast = $derived(weddingDate < new Date());

	let days = $state(0);
	let hours = $state(0);
	let minutes = $state(0);
	let seconds = $state(0);

	function tick() {
		const now = new Date();
		const diff = Math.abs(now.getTime() - weddingDate.getTime());

		days = Math.floor(diff / (1000 * 60 * 60 * 24));
		hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		seconds = Math.floor((diff % (1000 * 60)) / 1000);
	}

	tick();

	$effect(() => {
		const interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	});
</script>

<section class="py-24 md:py-32">
	<div class="mx-auto max-w-3xl px-6 text-center" use:reveal data-reveal>
		<h2 class="mb-12 text-[11px] font-medium tracking-[0.35em] text-stone-400 uppercase">
			{isPast ? 'Já se passaram' : 'Faltam'}
		</h2>

		<div class="flex items-start justify-center gap-5 md:gap-12">
			<FlipCard value={days} label="dias" />
			<div class="h-16 w-px self-start bg-stone-200 md:h-20"></div>
			<FlipCard value={hours} label="horas" />
			<div class="h-16 w-px self-start bg-stone-200 md:h-20"></div>
			<FlipCard value={minutes} label="minutos" />
			<div class="h-16 w-px self-start bg-stone-200 md:h-20"></div>
			<FlipCard value={seconds} label="segundos" />
		</div>
	</div>
</section>
