<script lang="ts">
	import { untrack } from 'svelte';
	import { fetchWedding } from '$lib/wedding.remote';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';

	let { data, children } = $props();

	const slug = $derived(data.slug);
	const wedding = await fetchWedding(untrack(() => data.slug));
</script>

<WeddingLayout {wedding} {slug}>
	<main class="flex-1">
		{@render children()}
	</main>
</WeddingLayout>
