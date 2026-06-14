<script lang="ts">
	import type { Image } from '$lib/api/images.remote';

	let {
		id,
		label,
		value = $bindable(''),
		placeholder = 'https://...',
		help
	}: {
		id: string;
		label: string;
		value: string;
		placeholder?: string;
		help?: string;
	} = $props();

	let uploading = $state(false);
	let error = $state('');
	let formEl: HTMLFormElement;

	async function handleUpload(e: SubmitEvent) {
		e.preventDefault();
		uploading = true;
		error = '';
		try {
			const formData = new FormData(formEl);
			const res = await fetch('/admin/images', { method: 'POST', body: formData });
			if (!res.ok)
				throw new Error('Não foi possível enviar a imagem. Verifique o formato e o tamanho do arquivo.');
			const image: Image = await res.json();
			value = image.url;
			formEl.reset();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erro ao enviar imagem';
		} finally {
			uploading = false;
		}
	}
</script>

<div>
	<label for={id} class="block text-sm font-medium text-slate-700">{label}</label>
	<input {id} bind:value type="url" class="input mt-1" {placeholder} />
	{#if help}
		<p class="mt-1 text-xs text-slate-400">{help}</p>
	{/if}

	<div class="mt-2 flex items-center gap-2">
		<span class="text-xs text-slate-400">ou</span>
		<form
			bind:this={formEl}
			onsubmit={handleUpload}
			enctype="multipart/form-data"
			class="flex items-center gap-2"
		>
			<input
				type="file"
				name="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				class="text-sm text-slate-500"
			/>
			<button type="submit" class="btn-ghost" disabled={uploading}>
				{uploading ? 'Enviando...' : 'Enviar imagem'}
			</button>
		</form>
	</div>
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}

	{#if value}
		<img
			src={value}
			alt="Preview"
			class="mt-2 h-32 w-full rounded-lg object-cover"
			onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
		/>
	{/if}
</div>
