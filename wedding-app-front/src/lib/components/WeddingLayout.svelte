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

<div class="flex min-h-dvh flex-col font-sans">
	<div class="grain" aria-hidden="true"></div>
	<Header {dark} />
	{@render children()}
	<Footer title={wedding.title} />
</div>
