<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Wedding } from '$lib/api';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	let {
		wedding,
		dark = false,
		children
	}: {
		wedding: Wedding;
		dark?: boolean;
		children: Snippet;
	} = $props();

	const socialImage = $derived(wedding.ogImage ?? wedding.coverImage);
	const socialDescription = $derived(
		(wedding.description ?? wedding.title).replace(/\s+/g, ' ').trim().slice(0, 200)
	);
</script>

<svelte:head>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={wedding.title} />
	<meta property="og:title" content={wedding.title} />
	<meta property="og:description" content={socialDescription} />
	<meta name="twitter:title" content={wedding.title} />
	<meta name="twitter:description" content={socialDescription} />
	{#if socialImage}
		<meta property="og:image" content={socialImage} />
		<meta property="og:image:secure_url" content={socialImage} />
		<meta property="og:image:alt" content={`Convite de ${wedding.title}`} />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={socialImage} />
		<meta name="twitter:image:alt" content={`Convite de ${wedding.title}`} />
	{/if}
</svelte:head>

<div class="flex min-h-dvh flex-col font-sans">
	<div class="grain" aria-hidden="true"></div>
	<Header {dark} />
	{@render children()}
	<Footer title={wedding.title} />
</div>
