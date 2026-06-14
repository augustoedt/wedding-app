<script lang="ts">
	import { untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { createWedding, updateWedding } from '$lib/api/wedding.remote';
	import { fetchAddressByCep } from '$lib/utils/viacep';
	import ImageUploadField from '$lib/components/ImageUploadField.svelte';

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
			coverImage: data.wedding?.coverImage ?? '',
			venueName: data.wedding?.venueName ?? '',
			venueCep: data.wedding?.venueCep ?? '',
			venueAddress: data.wedding?.venueAddress ?? '',
			venueNumber: data.wedding?.venueNumber ?? '',
			venueNeighborhood: data.wedding?.venueNeighborhood ?? '',
			venueCity: data.wedding?.venueCity ?? '',
			venueState: data.wedding?.venueState ?? '',
			venueTime: data.wedding?.venueTime ?? '',
			venueImage: data.wedding?.venueImage ?? '',
			dressCodeGuests: data.wedding?.dressCodeGuests ?? '',
			dressCodeGroomsmen: data.wedding?.dressCodeGroomsmen ?? '',
			ogImage: data.wedding?.ogImage ?? ''
		}))
	);

	const previewUrl = $derived(form.siteUrl ? form.siteUrl.replace(/\/$/, '') : null);

	let loading = $state(false);
	let formError = $state('');
	let saved = $state(false);
	let copied = $state(false);

	const tabs = [
		{ id: 'geral', label: 'Geral' },
		{ id: 'local', label: 'Local da Cerimônia' },
		{ id: 'dress-code', label: 'Dress Code' },
		{ id: 'og', label: 'Compartilhamento' }
	] as const;
	let activeTab = $state<(typeof tabs)[number]['id']>('geral');

	let lookingUpCep = $state(false);
	let cepLookupError = $state('');

	async function handleCepBlur() {
		cepLookupError = '';
		if (form.venueCep.replace(/\D/g, '').length !== 8) return;

		lookingUpCep = true;
		try {
			const address = await fetchAddressByCep(form.venueCep);
			if (!address) {
				cepLookupError = 'CEP não encontrado.';
				return;
			}
			form.venueAddress = address.logradouro;
			form.venueNeighborhood = address.bairro;
			form.venueCity = address.localidade;
			form.venueState = address.uf;
		} finally {
			lookingUpCep = false;
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
					coverImage: form.coverImage || undefined,
					venueName: form.venueName || undefined,
					venueCep: form.venueCep || undefined,
					venueAddress: form.venueAddress || undefined,
					venueNumber: form.venueNumber || undefined,
					venueNeighborhood: form.venueNeighborhood || undefined,
					venueCity: form.venueCity || undefined,
					venueState: form.venueState || undefined,
					venueTime: form.venueTime || undefined,
					venueImage: form.venueImage || undefined,
					dressCodeGuests: form.dressCodeGuests || undefined,
					dressCodeGroomsmen: form.dressCodeGroomsmen || undefined,
					ogImage: form.ogImage || undefined
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
					coverImage: form.coverImage || null,
					venueName: form.venueName || null,
					venueCep: form.venueCep || null,
					venueAddress: form.venueAddress || null,
					venueNumber: form.venueNumber || null,
					venueNeighborhood: form.venueNeighborhood || null,
					venueCity: form.venueCity || null,
					venueState: form.venueState || null,
					venueTime: form.venueTime || null,
					venueImage: form.venueImage || null,
					dressCodeGuests: form.dressCodeGuests || null,
					dressCodeGroomsmen: form.dressCodeGroomsmen || null,
					ogImage: form.ogImage || null
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
				<p class="text-sm text-slate-400">Preencha a URL base do site para ver o link.</p>
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

		<div class="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">
			{#each tabs as tab (tab.id)}
				<button
					type="button"
					onclick={() => (activeTab = tab.id)}
					class="shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition
					{activeTab === tab.id
						? 'border-rose-500 text-rose-600'
						: 'border-transparent text-slate-500 hover:text-slate-700'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<div class="space-y-4">
			{#if activeTab === 'geral'}
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
					<input
						id="s-slug"
						bind:value={form.slug}
						required
						class="input mt-1"
						placeholder="ana-e-bruno"
					/>
					<p class="mt-1 text-xs text-slate-400">
						Identificador interno do casamento. Apenas letras minúsculas, números e hífen. Use este
						valor na variável <code class="rounded bg-slate-100 px-1">PUBLIC_WEDDING_SLUG</code> do
						FRONT.
					</p>
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

				<ImageUploadField id="s-cover" label="Imagem de capa (URL)" bind:value={form.coverImage} />
			{:else if activeTab === 'local'}
				<div>
					<label for="s-venue-name" class="block text-sm font-medium text-slate-700">Nome do local</label>
					<input
						id="s-venue-name"
						bind:value={form.venueName}
						class="input mt-1"
						placeholder="Espaço Jardim das Rosas"
					/>
				</div>

				<div>
					<label for="s-venue-cep" class="block text-sm font-medium text-slate-700">CEP</label>
					<input
						id="s-venue-cep"
						bind:value={form.venueCep}
						onblur={handleCepBlur}
						class="input mt-1 w-40"
						placeholder="00000-000"
						maxlength="9"
					/>
					{#if lookingUpCep}
						<p class="mt-1 text-xs text-slate-400">Buscando endereço...</p>
					{/if}
					{#if cepLookupError}
						<p class="mt-1 text-sm text-red-600">{cepLookupError}</p>
					{/if}
				</div>

				<div>
					<label for="s-venue-address" class="block text-sm font-medium text-slate-700">Endereço</label>
					<input
						id="s-venue-address"
						bind:value={form.venueAddress}
						class="input mt-1"
						placeholder="Rua das Flores"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="s-venue-number" class="block text-sm font-medium text-slate-700">Número</label>
						<input
							id="s-venue-number"
							bind:value={form.venueNumber}
							class="input mt-1"
							placeholder="123"
						/>
					</div>
					<div>
						<label for="s-venue-neighborhood" class="block text-sm font-medium text-slate-700">Bairro</label>
						<input
							id="s-venue-neighborhood"
							bind:value={form.venueNeighborhood}
							class="input mt-1"
							placeholder="Centro"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="s-venue-city" class="block text-sm font-medium text-slate-700">Cidade</label>
						<input
							id="s-venue-city"
							bind:value={form.venueCity}
							class="input mt-1"
							placeholder="São Paulo"
						/>
					</div>
					<div>
						<label for="s-venue-state" class="block text-sm font-medium text-slate-700">UF</label>
						<input
							id="s-venue-state"
							bind:value={form.venueState}
							class="input mt-1"
							placeholder="SP"
							maxlength="2"
						/>
					</div>
				</div>

				<div>
					<label for="s-venue-time" class="block text-sm font-medium text-slate-700">Horário</label>
					<input
						id="s-venue-time"
						bind:value={form.venueTime}
						class="input mt-1"
						placeholder="Cerimônia às 16h"
					/>
				</div>

				<ImageUploadField
					id="s-venue-image"
					label="Imagem do local (URL)"
					bind:value={form.venueImage}
				/>
			{:else if activeTab === 'dress-code'}
				<div>
					<label for="s-dress-guests" class="block text-sm font-medium text-slate-700">
						Traje para os convidados
					</label>
					<textarea
						id="s-dress-guests"
						bind:value={form.dressCodeGuests}
						class="input mt-1"
						rows="2"
						placeholder="Traje social esporte fino. Evite branco e tons de verde."
					></textarea>
				</div>
				<div>
					<label for="s-dress-groomsmen" class="block text-sm font-medium text-slate-700">
						Traje para os padrinhos
					</label>
					<textarea
						id="s-dress-groomsmen"
						bind:value={form.dressCodeGroomsmen}
						class="input mt-1"
						rows="2"
						placeholder="Terno azul-marinho / Vestido longo dourado"
					></textarea>
				</div>
			{:else if activeTab === 'og'}
				<ImageUploadField
					id="s-og-image"
					label="Imagem para compartilhamento (Open Graph)"
					bind:value={form.ogImage}
					help="Recomendado: imagem horizontal (1200x630px). Aparece quando o link do site é compartilhado no WhatsApp/redes sociais."
				/>
			{/if}
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
