<script lang="ts">
	import { untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { createWedding, updateWedding } from '$lib/api/wedding.remote';
	import type { Image } from '$lib/api/images.remote';

	let { data } = $props();
	const isNew = $derived(!data.wedding);

	let form = $state(
		untrack(() => ({
			title: data.wedding?.title ?? '',
			slug: data.wedding?.slug ?? '',
			siteUrl: data.wedding?.siteUrl ?? '',
			inviteMessage: data.wedding?.inviteMessage ?? '',
			date: data.wedding?.date ? data.wedding.date.slice(0, 10) : '',
			description: data.wedding?.description ?? '',
			coverImage: data.wedding?.coverImage ?? ''
		}))
	);

	const previewUrl = $derived(
		form.siteUrl && form.slug ? `${form.siteUrl.replace(/\/$/, '')}/${form.slug}` : null
	);

	let loading = $state(false);
	let formError = $state('');
	let saved = $state(false);
	let copied = $state(false);

	let uploadingCover = $state(false);
	let coverUploadError = $state('');
	let coverFormEl: HTMLFormElement;

	async function handleCoverUpload(e: SubmitEvent) {
		e.preventDefault();
		uploadingCover = true;
		coverUploadError = '';
		try {
			const formData = new FormData(coverFormEl);
			const res = await fetch('/admin/images', { method: 'POST', body: formData });
			if (!res.ok) throw new Error('Não foi possível enviar a imagem. Verifique o formato e o tamanho do arquivo.');
			const image: Image = await res.json();
			form.coverImage = image.url;
			coverFormEl.reset();
		} catch (e) {
			coverUploadError = e instanceof Error ? e.message : 'Erro ao enviar imagem';
		} finally {
			uploadingCover = false;
		}
	}

	async function submit() {
		loading = true;
		formError = '';
		try {
			if (isNew) {
				await createWedding({
					title: form.title,
					slug: form.slug,
					siteUrl: form.siteUrl || undefined,
					inviteMessage: form.inviteMessage || undefined,
					date: form.date || undefined,
					description: form.description || undefined,
					coverImage: form.coverImage || undefined
				});
			} else {
				await updateWedding({
					id: data.wedding!.id,
					title: form.title,
					slug: form.slug,
					siteUrl: form.siteUrl || null,
					inviteMessage: form.inviteMessage || null,
					date: form.date || null,
					description: form.description || null,
					coverImage: form.coverImage || null
				});
			}
			saved = true;
			setTimeout(() => (saved = false), 2500);
			await invalidateAll();
		} catch (e) {
			formError = e instanceof Error ? e.message : 'Erro ao salvar';
		} finally {
			loading = false;
		}
	}

	async function togglePublish() {
		if (!data.wedding) return;
		await updateWedding({ id: data.wedding.id, isPublished: !data.wedding.isPublished });
		await invalidateAll();
	}

	function copyUrl() {
		if (!previewUrl) return;
		navigator.clipboard.writeText(previewUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="p-8 max-w-2xl">
	<h1 class="mb-8 text-2xl font-semibold text-slate-800">Configurações do Casamento</h1>

	{#if !isNew && data.wedding}
		<!-- URL do site -->
		<div class="mb-8 rounded-xl border border-rose-100 bg-rose-50 p-5">
			<div class="mb-2 flex items-center justify-between">
				<p class="text-xs font-medium uppercase tracking-wide text-rose-500">URL do Site</p>
				<span
					class="rounded-full px-2.5 py-0.5 text-xs font-medium
					{data.wedding.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}"
				>
					{data.wedding.isPublished ? 'Publicado' : 'Rascunho'}
				</span>
			</div>

			{#if previewUrl}
				<div class="flex items-center gap-2">
					<a
						href={previewUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 truncate rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-slate-700 hover:underline"
					>
						{previewUrl}
					</a>
					<button
						onclick={copyUrl}
						class="shrink-0 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
					>
						{copied ? '✓ Copiado' : 'Copiar'}
					</button>
				</div>
			{:else}
				<p class="text-sm text-slate-400">Preencha a URL base e o slug para ver o link.</p>
			{/if}

			{#if !data.wedding.isPublished}
				<p class="mt-2 text-xs text-rose-400">
					O casamento ainda não está publicado. O link não é acessível ao público.
				</p>
			{/if}
			<div class="mt-3">
				<button
					onclick={togglePublish}
					class="text-sm font-medium
					{data.wedding.isPublished
						? 'text-slate-500 hover:text-slate-700'
						: 'text-emerald-600 hover:text-emerald-800'}"
				>
					{data.wedding.isPublished ? 'Despublicar' : '→ Publicar agora'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Formulário -->
	<div class="rounded-xl bg-white p-6 shadow-sm">
		<h2 class="mb-5 text-base font-semibold text-slate-700">
			{isNew ? 'Cadastrar Casamento' : 'Dados do Casamento'}
		</h2>

		<div class="space-y-4">
			<div>
				<label for="s-title" class="block text-sm font-medium text-slate-700">Título *</label>
				<input
					id="s-title"
					bind:value={form.title}
					required
					class="input mt-1"
					placeholder="Casamento da Ana e do Bruno"
				/>
			</div>

			<div>
				<label for="s-site-url" class="block text-sm font-medium text-slate-700">
					URL base do site *
				</label>
				<input
					id="s-site-url"
					bind:value={form.siteUrl}
					type="url"
					class="input mt-1"
					placeholder="https://mayraeduardo.com.br"
				/>
				<p class="mt-1 text-xs text-slate-400">Domínio do site de convidados (sem barra no final).</p>
			</div>

			<div>
				<label for="s-slug" class="block text-sm font-medium text-slate-700">Slug</label>
				<div class="mt-1 flex items-center gap-1.5">
					<span class="shrink-0 text-sm text-slate-400">{form.siteUrl || 'https://...'}/</span>
					<input
						id="s-slug"
						bind:value={form.slug}
						required
						class="input flex-1"
						placeholder="ana-e-bruno"
					/>
				</div>
				<p class="mt-1 text-xs text-slate-400">Apenas letras minúsculas, números e hífen.</p>
			</div>

			<div>
				<label for="s-date" class="block text-sm font-medium text-slate-700">Data do casamento</label>
				<input id="s-date" bind:value={form.date} type="date" class="input mt-1 w-48" />
			</div>

			<div>
				<label for="s-desc" class="block text-sm font-medium text-slate-700">Mensagem de boas-vindas</label>
				<textarea
					id="s-desc"
					bind:value={form.description}
					class="input mt-1"
					rows="3"
					placeholder="Uma mensagem especial para os convidados..."
				></textarea>
			</div>

			<div>
				<label for="s-invite" class="block text-sm font-medium text-slate-700">Mensagem de convite (WhatsApp)</label>
				<textarea
					id="s-invite"
					bind:value={form.inviteMessage}
					class="input mt-1"
					rows="4"
					placeholder={"Olá {nome}! Você está convidado para o nosso casamento. Confirme sua presença: {link}"}
				></textarea>
				<p class="mt-1 text-xs text-slate-400">Use <code class="rounded bg-slate-100 px-1">{"{"+"nome}"}</code> para o nome do convidado e <code class="rounded bg-slate-100 px-1">{"{"+"link}"}</code> para o link de RSVP.</p>
			</div>

			<div>
				<label for="s-cover" class="block text-sm font-medium text-slate-700">Imagem de capa (URL)</label>
				<input
					id="s-cover"
					bind:value={form.coverImage}
					type="url"
					class="input mt-1"
					placeholder="https://..."
				/>

				<div class="mt-2 flex items-center gap-2">
					<span class="text-xs text-slate-400">ou</span>
					<form bind:this={coverFormEl} onsubmit={handleCoverUpload} enctype="multipart/form-data" class="flex items-center gap-2">
						<input
							type="file"
							name="file"
							accept="image/jpeg,image/png,image/webp,image/gif"
							class="text-sm text-slate-500"
						/>
						<button type="submit" class="btn-ghost" disabled={uploadingCover}>
							{uploadingCover ? 'Enviando...' : 'Enviar imagem'}
						</button>
					</form>
				</div>
				{#if coverUploadError}
					<p class="mt-1 text-sm text-red-600">{coverUploadError}</p>
				{/if}

				{#if form.coverImage}
					<img
						src={form.coverImage}
						alt="Preview da capa"
						class="mt-2 h-32 w-full rounded-lg object-cover"
						onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
					/>
				{/if}
			</div>
		</div>

		{#if formError}
			<p class="mt-4 text-sm text-red-600">{formError}</p>
		{/if}

		<div class="mt-6 flex items-center gap-3">
			<button onclick={submit} disabled={loading} class="btn-primary">
				{loading ? 'Salvando...' : isNew ? 'Criar Casamento' : 'Salvar Alterações'}
			</button>
			{#if saved}
				<span class="text-sm text-emerald-600">✓ Salvo com sucesso</span>
			{/if}
		</div>
	</div>
</div>
