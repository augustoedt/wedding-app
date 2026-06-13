<script lang="ts">
	import FlipCard from './FlipCard.svelte';
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

<section class="bg-white py-14">
	<div class="mx-auto max-w-2xl px-6 text-center">
		<h2 class="mb-8 text-sm font-medium tracking-[0.3em] uppercase text-stone-500">
			{isPast ? 'Já se passaram' : 'Faltam'}
		</h2>

		<div class="flex items-start justify-center gap-4 md:gap-8">
			<FlipCard value={days} label="dias" />
			<FlipCard value={hours} label="horas" />
			<FlipCard value={minutes} label="minutos" />
			<FlipCard value={seconds} label="segundos" />
		</div>
	</div>
</section>
