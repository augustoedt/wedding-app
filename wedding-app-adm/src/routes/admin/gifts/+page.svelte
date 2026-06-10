<script lang="ts">
	import { getGifts, addGift, updateGift, deleteGift, type Gift } from '$lib/api/gifts.remote';

	const gifts = getGifts();

	let showForm = $state(false);
	let editingGift = $state<Gift | null>(null);

	let form = $state({ name: '', description: '', price: '', imageUrl: '', paymentType: '', paymentValue: '' });

	function openAdd() {
		editingGift = null;
		form = { name: '', description: '', price: '', imageUrl: '', paymentType: '', paymentValue: '' };
		showForm = true;
	}

	function openEdit(g: Gift) {
		editingGift = g;
		form = {
			name: g.name,
			description: g.description ?? '',
			price: String(g.price),
			imageUrl: g.imageUrl ?? '',
			paymentType: g.paymentType ?? '',
			paymentValue: g.paymentValue ?? ''
		};
		showForm = true;
	}

	async function submitForm() {
		const price = parseInt(form.price);
		const paymentType = form.paymentType as 'url' | 'pix' | '' || undefined;
		if (editingGift) {
			await updateGift({
				id: editingGift.id,
				name: form.name,
				description: form.description || null,
				price,
				imageUrl: form.imageUrl || null,
				paymentType: paymentType || null,
				paymentValue: form.paymentValue || null
			});
		} else {
			await addGift({
				name: form.name,
				description: form.description || undefined,
				price,
				imageUrl: form.imageUrl || undefined,
				paymentType: paymentType || undefined,
				paymentValue: form.paymentValue || undefined
			});
		}
		showForm = false;
		gifts.refresh();
	}

	async function toggleActive(g: Gift) {
		await updateGift({ id: g.id, isActive: !g.isActive });
		gifts.refresh();
	}

	async function remove(id: string) {
		if (!confirm('Remover este presente?')) return;
		await deleteGift(id);
		gifts.refresh();
	}

	function formatPrice(cents: number) {
		return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}
</script>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-slate-800">Presentes</h1>
		<button onclick={openAdd} class="btn-primary">+ Adicionar</button>
	</div>

	{#if showForm}
		<div class="mb-6 rounded-xl bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-base font-semibold text-slate-700">
				{editingGift ? 'Editar Presente' : 'Novo Presente'}
			</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="sm:col-span-2">
					<label for="gf-name" class="block text-sm font-medium text-slate-700">Nome *</label>
					<input id="gf-name" bind:value={form.name} required class="input mt-1" placeholder="Ex: Jogo de panelas" />
				</div>
				<div>
					<label for="gf-price" class="block text-sm font-medium text-slate-700">Preço (centavos) *</label>
					<input id="gf-price" bind:value={form.price} required type="number" min="1" class="input mt-1" placeholder="15000" />
					<p class="mt-1 text-xs text-slate-400">Em centavos: R$150,00 = 15000</p>
				</div>
				<div>
					<label for="gf-image" class="block text-sm font-medium text-slate-700">URL da Imagem</label>
					<input id="gf-image" bind:value={form.imageUrl} type="url" class="input mt-1" />
				</div>
				<div class="sm:col-span-2">
					<label for="gf-desc" class="block text-sm font-medium text-slate-700">Descrição</label>
					<textarea id="gf-desc" bind:value={form.description} class="input mt-1" rows="2"></textarea>
				</div>
				<div>
					<label for="gf-payment-type" class="block text-sm font-medium text-slate-700">Tipo de pagamento</label>
					<select id="gf-payment-type" bind:value={form.paymentType} class="input mt-1">
						<option value="">Nenhum</option>
						<option value="url">Link externo</option>
						<option value="pix">PIX</option>
					</select>
				</div>
				{#if form.paymentType}
					<div>
						<label for="gf-payment-value" class="block text-sm font-medium text-slate-700">
							{form.paymentType === 'url' ? 'URL de pagamento' : 'Chave PIX'}
						</label>
						<input
							id="gf-payment-value"
							bind:value={form.paymentValue}
							type={form.paymentType === 'url' ? 'url' : 'text'}
							class="input mt-1"
							placeholder={form.paymentType === 'url' ? 'https://...' : 'email@pix.com'}
						/>
					</div>
				{/if}
			</div>
			<div class="mt-4 flex gap-3">
				<button onclick={submitForm} class="btn-primary">Salvar</button>
				<button onclick={() => (showForm = false)} class="btn-ghost">Cancelar</button>
			</div>
		</div>
	{/if}

	{#if gifts.loading}
		<div class="h-40 animate-pulse rounded-xl bg-slate-200"></div>
	{:else if gifts.error}
		<div class="rounded-xl bg-red-50 p-4 text-red-600">Erro ao carregar presentes.</div>
	{:else if !gifts.current?.length}
		<div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-16 text-center">
			<p class="text-slate-500">Nenhum presente cadastrado ainda.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl bg-white shadow-sm">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
						<th class="px-4 py-3">Presente</th>
						<th class="px-4 py-3">Preço</th>
						<th class="px-4 py-3">Pagamento</th>
						<th class="px-4 py-3">Status</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each gifts.current as g (g.id)}
						{@const isLocked = !g.isActive && !!g.lockedAt}
						{@const isBought = !g.isActive && !g.lockedAt}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3">
								<div class="flex items-center gap-3">
									{#if g.imageUrl}
										<img src={g.imageUrl} alt={g.name} class="h-10 w-10 rounded-lg object-cover" />
									{:else}
										<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl">🎁</div>
									{/if}
									<div>
										<p class="font-medium text-slate-800">{g.name}</p>
										{#if g.description}
											<p class="truncate text-xs text-slate-400 max-w-48">{g.description}</p>
										{/if}
									</div>
								</div>
							</td>
							<td class="px-4 py-3 font-medium text-slate-700">{formatPrice(g.price)}</td>
							<td class="px-4 py-3 text-xs text-slate-500">
								{#if g.paymentType === 'url'}
									<span class="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">Link</span>
								{:else if g.paymentType === 'pix'}
									<span class="rounded-full bg-teal-100 px-2 py-0.5 text-teal-700">PIX</span>
								{:else}
									<span class="text-slate-300">—</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								{#if isLocked}
									<span class="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">Travado</span>
								{:else if isBought}
									<span class="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">Comprado</span>
								{:else}
									<button
										onclick={() => toggleActive(g)}
										class="rounded-full px-2.5 py-1 text-xs font-medium transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
									>
										Ativo
									</button>
								{/if}
							</td>
							<td class="px-4 py-3 text-right">
								<button onclick={() => openEdit(g)} class="mr-2 text-slate-400 hover:text-slate-700">Editar</button>
								<button onclick={() => remove(g.id)} class="text-rose-400 hover:text-rose-600">Remover</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
