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
</script>

<div class="flex min-h-screen flex-col font-sans">
	<Header {wedding} {dark} />
	{@render children()}
	<Footer title={wedding.title} />
</div>
