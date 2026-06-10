<script lang="ts">
	import { untrack } from 'svelte';
	import { fetchWedding } from '$lib/wedding.remote';
	import Hero from '$lib/components/Hero.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import WelcomeText from '$lib/components/WelcomeText.svelte';

	let { data } = $props();

	const slug = $derived(data.slug);
	const wedding = await fetchWedding(untrack(() => data.slug));
</script>

<svelte:head>
	<title>{wedding.title}</title>
	<meta name="description" content={wedding.description ?? wedding.title} />
</svelte:head>

<Hero {wedding} />

{#if wedding.date}
	<Countdown date={wedding.date} />
{/if}

{#if wedding.description}
	<WelcomeText description={wedding.description} />
{/if}
