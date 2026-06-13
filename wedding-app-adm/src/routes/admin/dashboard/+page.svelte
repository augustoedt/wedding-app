<script lang="ts">
	import { getWedding, createWedding, updateWedding } from '$lib/api/wedding.remote';
	import { getGuests } from '$lib/api/guests.remote';
	import { getGifts } from '$lib/api/gifts.remote';

	const wedding = getWedding();
	const guests = getGuests();
	const gifts = getGifts();

	let creating = $state(false);
	let editing = $state(false);

	let form = $state({ title: '', slug: '', date: '', description: '', coverImage: '' });

	function startCreate() {
		form = { title: '', slug: '', date: '', description: '', coverImage: '' };
		creating = true;
	}

	function startEdit() {
		const w = wedding.current;
		if (!w) return;
		form = {
			title: w.title,
			slug: w.slug,
			date: w.date ? w.date.slice(0, 10) : '',
			description: w.description ?? '',
			coverImage: w.coverImage ?? ''
		};
		editing = true;
	}

	async function submitCreate() {
		await createWedding({
			title: form.title,
			slug: form.slug,
			date: form.date || undefined,
			description: form.description || undefined,
			coverImage: form.coverImage || undefined
		});
		creating = false;
		wedding.refresh();
	}

	async function submitEdit() {
		if (!wedding.current) return;
		await updateWedding({
			id: wedding.current.id,
			title: form.title,
			slug: form.slug,
			date: form.date || null,
			description: form.description || null,
			coverImage: form.coverImage || null
		});
		editing = false;
		wedding.refresh();
	}

	async function togglePublish() {
		if (!wedding.current) return;
		await updateWedding({ id: wedding.current.id, isPublished: !wedding.current.isPublished });
		wedding.refresh();
	}

	const totalGuests = $derived(
		guests.current?.reduce((sum, g) => sum + g.plusOne + 1, 0) ?? 0
	);
	const confirmedCount = $derived(
		guests.current?.filter((g) => g.rsvp === 'confirmed').reduce((sum, g) => sum + g.plusOne + 1, 0) ?? 0
	);
	const declinedCount = $derived(
		guests.current?.filter((g) => g.rsvp === 'declined').reduce((sum, g) => sum + g.plusOne + 1, 0) ?? 0
	);
	const activeGifts = $derived(gifts.current?.filter((g) => g.isActive).length ?? 0);

	let copied = $state(false);

	function copyLink(url: string) {
		navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="p-8">
	<h1 class="mb-6 text-2xl font-semibold text-slate-800">Dashboard</h1>

	{#if wedding.loading}
		<div class="h-32 animate-pulse rounded-xl bg-slate-200"></div>
	{:else if wedding.error}
		<div class="rounded-xl bg-red-50 p-4 text-red-600">
			Erro ao carregar dados do casamento.
		</div>
	{:else if !wedding.current}
		{#if creating}
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-slate-700">Criar Casamento</h2>
				<div class="space-y-4">
					<div>
						<label for="c-title" class="block text-sm font-medium text-slate-700">Título *</label>
						<input id="c-title" bind:value={form.title} required class="input mt-1" placeholder="Casamento da Ana e do Bruno" />
					</div>
					<div>
						<label for="c-slug" class="block text-sm font-medium text-slate-700">Slug *</label>
						<input id="c-slug" bind:value={form.slug} required class="input mt-1" placeholder="ana-e-bruno" />
						<p class="mt-1 text-xs text-slate-400">Apenas letras minúsculas, números e hífen.</p>
					</div>
					<div>
						<label for="c-date" class="block text-sm font-medium text-slate-700">Data</label>
						<input id="c-date" bind:value={form.date} type="date" class="input mt-1" />
					</div>
					<div>
						<label for="c-desc" class="block text-sm font-medium text-slate-700">Descrição</label>
						<textarea id="c-desc" bind:value={form.description} class="input mt-1" rows="3"></textarea>
					</div>
					<div>
						<label for="c-cover" class="block text-sm font-medium text-slate-700">Imagem de capa (URL)</label>
						<input id="c-cover" bind:value={form.coverImage} type="url" class="input mt-1" placeholder="https://..." />
					</div>
					<div class="flex gap-3">
						<button onclick={submitCreate} class="btn-primary">Criar</button>
						<button onclick={() => (creating = false)} class="btn-ghost">Cancelar</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-16 text-center">
				<p class="text-slate-500">Nenhum casamento cadastrado ainda.</p>
				<button onclick={startCreate} class="btn-primary mt-4">Criar Casamento</button>
			</div>
		{/if}
	{:else}
		{@const w = wedding.current}

		<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
			<div class="rounded-xl bg-white p-5 shadow-sm">
				<p class="text-xs uppercase tracking-wide text-slate-500">Total Convidados</p>
				<p class="mt-1 text-3xl font-bold text-slate-800">{guests.loading ? '—' : totalGuests}</p>
			</div>
			<div class="rounded-xl bg-white p-5 shadow-sm">
				<p class="text-xs uppercase tracking-wide text-slate-500">Confirmados</p>
				<p class="mt-1 text-3xl font-bold text-emerald-600">{confirmedCount}</p>
			</div>
			<div class="rounded-xl bg-white p-5 shadow-sm">
				<p class="text-xs uppercase tracking-wide text-slate-500">Recusaram</p>
				<p class="mt-1 text-3xl font-bold text-rose-500">{declinedCount}</p>
			</div>
			<div class="rounded-xl bg-white p-5 shadow-sm">
				<p class="text-xs uppercase tracking-wide text-slate-500">Presentes Ativos</p>
				<p class="mt-1 text-3xl font-bold text-slate-800">{activeGifts}</p>
			</div>
		</div>

		{@const publicUrl = w.siteUrl ? w.siteUrl.replace(/\/$/, '') : null}
		<div class="mb-6 rounded-xl border border-rose-100 bg-rose-50 p-5">
			<p class="mb-2 text-xs font-medium uppercase tracking-wide text-rose-500">
				Link de Compartilhamento
			</p>
			{#if publicUrl}
				<div class="flex items-center gap-2">
					<a
						href={publicUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 truncate rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-slate-700 hover:underline"
					>
						{publicUrl}
					</a>
					<button
						onclick={() => copyLink(publicUrl)}
						class="shrink-0 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
					>
						{copied ? '✓ Copiado' : 'Copiar'}
					</button>
				</div>
				{#if !w.isPublished}
					<p class="mt-2 text-xs text-rose-400">
						⚠ O casamento ainda não foi publicado. Publique para ativar o link.
					</p>
				{/if}
			{:else}
				<p class="text-sm text-slate-400">
					URL não configurada. <a href="/admin/settings" class="text-rose-500 underline">Configure em Configurações</a>.
				</p>
			{/if}
		</div>

		{#if editing}
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-slate-700">Editar Casamento</h2>
				<div class="space-y-4">
					<div>
						<label for="e-title" class="block text-sm font-medium text-slate-700">Título</label>
						<input id="e-title" bind:value={form.title} class="input mt-1" />
					</div>
					<div>
						<label for="e-slug" class="block text-sm font-medium text-slate-700">Slug</label>
						<input id="e-slug" bind:value={form.slug} class="input mt-1" />
					</div>
					<div>
						<label for="e-date" class="block text-sm font-medium text-slate-700">Data</label>
						<input id="e-date" bind:value={form.date} type="date" class="input mt-1" />
					</div>
					<div>
						<label for="e-desc" class="block text-sm font-medium text-slate-700">Descrição</label>
						<textarea id="e-desc" bind:value={form.description} class="input mt-1" rows="3"></textarea>
					</div>
					<div>
						<label for="e-cover" class="block text-sm font-medium text-slate-700">Imagem de capa (URL)</label>
						<input id="e-cover" bind:value={form.coverImage} type="url" class="input mt-1" placeholder="https://..." />
					</div>
					<div class="flex gap-3">
						<button onclick={submitEdit} class="btn-primary">Salvar</button>
						<button onclick={() => (editing = false)} class="btn-ghost">Cancelar</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<h2 class="text-xl font-semibold text-slate-800">{w.title}</h2>
						<p class="mt-0.5 text-sm text-slate-500">/{w.slug}</p>
						{#if w.date}
							<p class="mt-1 text-sm text-slate-600">
								📅 {new Date(w.date).toLocaleDateString('pt-BR')}
							</p>
						{/if}
						{#if w.description}
							<p class="mt-2 text-sm text-slate-600">{w.description}</p>
						{/if}
					</div>
					<span
						class="rounded-full px-3 py-1 text-xs font-medium
							{w.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}"
					>
						{w.isPublished ? 'Publicado' : 'Rascunho'}
					</span>
				</div>

				<div class="mt-5 flex gap-3">
					<button onclick={startEdit} class="btn-primary">Editar</button>
					<button onclick={togglePublish} class="btn-ghost">
						{w.isPublished ? 'Despublicar' : 'Publicar'}
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
