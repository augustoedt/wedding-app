<script lang="ts">
	import { untrack } from 'svelte';
	import { fetchWedding } from '$lib/wedding.remote';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';

	let { data, children } = $props();

	const wedding = await fetchWedding(untrack(() => data.slug));
</script>

<WeddingLayout {wedding} dark>
	<main class="flex-1 pt-20">
		{@render children()}
	</main>
</WeddingLayout>
