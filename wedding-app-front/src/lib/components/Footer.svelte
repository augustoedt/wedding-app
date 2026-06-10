<script lang="ts">
	let { title }: { title: string } = $props();

	function shareWhatsApp() {
		const url = encodeURIComponent(window.location.href);
		const text = encodeURIComponent(`Confira o site do casamento: ${title}`);
		window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
	}
</script>

<footer class="border-t border-stone-100 bg-white py-10">
	<div class="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center">
		<button
			onclick={shareWhatsApp}
			class="flex items-center gap-2 rounded-full border border-stone-200 px-6 py-2.5 text-sm font-medium text-stone-600 transition hover:border-green-400 hover:text-green-600"
		>
			<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
				/>
				<path
					d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.843L.057 23.999l6.304-1.454A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.896 9.896 0 01-5.022-1.367l-.36-.214-3.742.862.893-3.622-.235-.373A9.863 9.863 0 012.106 12C2.106 6.53 6.53 2.106 12 2.106c5.47 0 9.894 4.424 9.894 9.894 0 5.47-4.424 9.894-9.894 9.894z"
				/>
			</svg>
			Compartilhar no WhatsApp
		</button>

		<p class="text-xs text-stone-300">{title}</p>
	</div>
</footer>
