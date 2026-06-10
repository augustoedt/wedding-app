<script lang="ts">
	let { description }: { description: string } = $props();
</script>

<section class="bg-stone-50 py-16">
	<div class="mx-auto max-w-xl px-6">
		<!-- Decorative divider -->
		<div class="mb-10 flex items-center justify-center gap-4">
			<div class="h-px flex-1 bg-stone-300"></div>
			<svg class="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C9.38 2 7.25 4.13 7.25 6.75c0 2.57 2 4.66 4.56 4.73C11.87 11.48 12 11.5 12 11.5s.13-.02.19-.02c2.56-.07 4.56-2.16 4.56-4.73C16.75 4.13 14.62 2 12 2zm0 7.5c-1.52 0-2.75-1.23-2.75-2.75S10.48 4 12 4s2.75 1.23 2.75 2.75S13.52 9.5 12 9.5z" />
			</svg>
			<div class="h-px flex-1 bg-stone-300"></div>
		</div>

		<div class="space-y-6 text-center font-mono text-sm leading-relaxed text-stone-600">
			{#each description.split('\n\n') as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
		</div>
	</div>
</section>
