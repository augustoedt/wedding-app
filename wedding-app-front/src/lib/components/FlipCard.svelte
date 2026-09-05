<script lang="ts">
	let { value = 0, label = '' }: { value: number; label: string } = $props();

	let display = $derived(String(value).padStart(2, '0'));
</script>

<div class="flex min-w-16 flex-col items-center gap-2 md:min-w-24">
	{#key value}
		<span
			class="tick font-serif text-5xl font-light tabular-nums text-stone-800 md:text-6xl"
		>
			{display}
		</span>
	{/key}
	<span class="text-[10px] font-medium tracking-[0.3em] uppercase text-stone-400 md:text-[11px]">
		{label}
	</span>
</div>

<style>
	.tick {
		animation: tick-in 0.45s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes tick-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tick {
			animation: none;
		}
	}
</style>
