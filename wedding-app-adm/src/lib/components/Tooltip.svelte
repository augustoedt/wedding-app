<script lang="ts">
	import type { Snippet } from 'svelte';

	let { text, children }: { text: string; children: Snippet } = $props();

	let visible = $state(false);
</script>


<div	
	class="relative inline-flex"
	onmouseenter={() => (visible = true)}
	onmouseleave={() => (visible = false)}
	onfocus={() => (visible = true)}
	onblur={() => (visible = false)}
>
	{@render children()}
	{#if visible}
		<div
			role="tooltip"
			class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-md"
		>
			{text}
			<div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
		</div>
	{/if}
</div>
