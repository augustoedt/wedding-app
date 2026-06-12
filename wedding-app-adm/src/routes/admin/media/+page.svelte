<script lang="ts">
	import { getImages, uploadImage } from '$lib/api/images.remote';

	const images = getImages();

	let uploading = $state(false);
	let uploadError = $state('');
	let copiedId = $state<string | null>(null);

	const uploadForm = uploadImage.enhance(async (instance) => {
		uploading = true;
		uploadError = '';
		try {
			await instance.submit();
			if (instance.result?.url) {
				instance.element.reset();
				images.refresh();
			} else {
				uploadError = 'Não foi possível enviar a imagem. Verifique o formato e o tamanho do arquivo.';
			}
		} catch (e) {
			uploadError = e instanceof Error ? e.message : 'Erro ao enviar imagem';
		} finally {
			uploading = false;
		}
	});

	function copyUrl(image: { id: string; url: string }) {
		navigator.clipboard.writeText(image.url);
		copiedId = image.id;
		setTimeout(() => (copiedId = null), 2000);
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('pt-BR');
	}
</script>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-slate-800">Mídia</h1>
	</div>

	<div class="mb-6 rounded-xl bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-base font-semibold text-slate-700">Enviar imagem</h2>
		<form {...uploadForm} enctype="multipart/form-data" class="flex flex-wrap items-end gap-3">
			<div class="min-w-48 flex-1">
				<label for="md-file" class="block text-sm font-medium text-slate-700">Arquivo *</label>
				<input
					id="md-file"
					type="file"
					name="file"
					accept="image/jpeg,image/png,image/webp,image/gif"
					required
					class="input mt-1"
				/>
			</div>
			<div class="min-w-48 flex-1">
				<label for="md-desc" class="block text-sm font-medium text-slate-700">Descrição</label>
				<input id="md-desc" type="text" name="description" class="input mt-1" placeholder="Opcional" />
			</div>
			<button type="submit" class="btn-primary" disabled={uploading}>
				{uploading ? 'Enviando...' : 'Enviar'}
			</button>
		</form>
		{#if uploadError}
			<p class="mt-2 text-sm text-red-600">{uploadError}</p>
		{/if}
	</div>

	{#if images.loading}
		<div class="h-40 animate-pulse rounded-xl bg-slate-200"></div>
	{:else if images.error}
		<div class="rounded-xl bg-red-50 p-4 text-red-600">Erro ao carregar imagens.</div>
	{:else if !images.current?.length}
		<div
			class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-16 text-center"
		>
			<p class="text-slate-500">Nenhuma imagem enviada ainda.</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{#each images.current as image (image.id)}
				<div class="overflow-hidden rounded-xl bg-white shadow-sm">
					<img src={image.url} alt={image.description ?? ''} class="h-32 w-full object-cover" />
					<div class="p-3">
						{#if image.description}
							<p class="truncate text-sm text-slate-700">{image.description}</p>
						{/if}
						<p class="mt-0.5 text-xs text-slate-400">{formatDate(image.createdAt)}</p>
						<button
							onclick={() => copyUrl(image)}
							class="mt-2 text-xs font-medium text-rose-500 hover:text-rose-700"
						>
							{copiedId === image.id ? '✓ URL copiada' : 'Copiar URL'}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
