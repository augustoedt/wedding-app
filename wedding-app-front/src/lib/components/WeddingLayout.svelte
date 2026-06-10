<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Wedding } from '$lib/api';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	let {
		wedding,
		slug,
		dark = false,
		children
	}: {
		wedding: Wedding;
		slug: string;
		dark?: boolean;
		children: Snippet;
	} = $props();
</script>

<div class="flex min-h-screen flex-col font-sans">
	<Header {wedding} {slug} {dark} />
	{@render children()}
	<Footer title={wedding.title} />
</div>
