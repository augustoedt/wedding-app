<script lang="ts">
	import { untrack } from 'svelte';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import WelcomeText from '$lib/components/WelcomeText.svelte';

	let { data } = $props();
	const wedding = untrack(() => data.wedding);
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
