<script lang="ts">
	import { fetchWedding } from '$lib/wedding.remote';
	import { PUBLIC_WEDDING_SLUG } from '$env/static/public';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import WelcomeText from '$lib/components/WelcomeText.svelte';

	const wedding = await fetchWedding(PUBLIC_WEDDING_SLUG);
</script>

<svelte:head>
	<title>{wedding.title}</title>
	<meta name="description" content={wedding.description ?? wedding.title} />
</svelte:head>

<WeddingLayout {wedding}>
	<main class="flex-1">
		<Hero {wedding} />
		{#if wedding.date}
			<Countdown date={wedding.date} />
		{/if}
		{#if wedding.description}
			<WelcomeText description={wedding.description} />
		{/if}
	</main>
</WeddingLayout>
