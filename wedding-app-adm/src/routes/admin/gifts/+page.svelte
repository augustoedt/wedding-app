<script lang="ts">
	import { flip } from 'svelte/animate';
	import { DotsSixVertical } from 'phosphor-svelte';
	import {
		getGifts,
		addGift,
		updateGift,
		deleteGift,
		reorderGift,
		type Gift,
		type GiftStatus
	} from '$lib/api/gifts.remote';

	const gifts = getGifts();

	let items = $state<Gift[]>([]);
	$effect(() => {
		if (gifts.current) items = [...gifts.current];
	});

	let showForm = $state(false);
	let editingGift = $state<Gift | null>(null);

	let form = $state({
		name: '',
		description: '',
		price: '',
		imageUrl: '',
		paymentType: '',
		paymentValue: ''
	});

	function openAdd() {
		editingGift = null;
		form = {
			name: '',
			description: '',
			price: '',
			imageUrl: '',
			paymentType: '',
			paymentValue: ''
		};
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
		const paymentType = (form.paymentType as 'url' | 'pix' | '') || undefined;
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

	function giftStatus(g: Gift): GiftStatus {
		if (!g.isActive && g.lockedAt) return 'locked';
		if (!g.isActive) return 'purchased';
		return 'available';
	}

	const statusLabels: Record<GiftStatus, string> = {
		available: 'Disponível',
		locked: 'Travado',
		purchased: 'Comprado'
	};

	const statusColors: Record<GiftStatus, string> = {
		available: 'bg-emerald-100 text-emerald-700',
		locked: 'bg-yellow-100 text-yellow-700',
		purchased: 'bg-slate-200 text-slate-600'
	};

	async function changeStatus(g: Gift, status: GiftStatus) {
		await updateGift({ id: g.id, status });
		gifts.refresh();
	}

	async function remove(id: string) {
		if (!confirm('Remover este presente?')) return;
		await deleteGift(id);
		gifts.refresh();
	}

	let dragIndex = $state<number | null>(null);

	function handleDragStart(i: number) {
		dragIndex = i;
	}

	function handleDragEnter(i: number) {
		if (dragIndex === null || dragIndex === i) return;
		const moved = items[dragIndex];
		if (!moved) return;
		items.splice(dragIndex, 1);
		items.splice(i, 0, moved);
		dragIndex = i;
	}

	async function handleDragEnd() {
		if (dragIndex === null) return;
		const i = dragIndex;
		dragIndex = null;
		const target = items[i];
		if (!target) return;
		await reorderGift({ id: target.id, beforeId: items[i - 1]?.id, afterId: items[i + 1]?.id });
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
					<input
						id="gf-name"
						bind:value={form.name}
						required
						class="input mt-1"
						placeholder="Ex: Jogo de panelas"
					/>
				</div>
				<div>
					<label for="gf-price" class="block text-sm font-medium text-slate-700"
						>Preço (centavos) *</label
					>
					<input
						id="gf-price"
						bind:value={form.price}
						required
						type="number"
						min="1"
						class="input mt-1"
						placeholder="15000"
					/>
					<p class="mt-1 text-xs text-slate-400">Em centavos: R$150,00 = 15000</p>
				</div>
				<div>
					<label for="gf-image" class="block text-sm font-medium text-slate-700"
						>URL da Imagem</label
					>
					<input id="gf-image" bind:value={form.imageUrl} type="url" class="input mt-1" />
				</div>
				<div class="sm:col-span-2">
					<label for="gf-desc" class="block text-sm font-medium text-slate-700">Descrição</label>
					<textarea id="gf-desc" bind:value={form.description} class="input mt-1" rows="2"
					></textarea>
				</div>
				<div>
					<label for="gf-payment-type" class="block text-sm font-medium text-slate-700"
						>Tipo de pagamento</label
					>
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
	{:else if !items.length}
		<div
			class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-16 text-center"
		>
			<p class="text-slate-500">Nenhum presente cadastrado ainda.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl bg-white shadow-sm">
			<table class="w-full text-sm">
				<thead>
					<tr
						class="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium tracking-wide text-slate-500 uppercase"
					>
						<th class="w-10 px-4 py-3">#</th>
						<th class="px-4 py-3">Presente</th>
						<th class="px-4 py-3">Preço</th>
						<th class="px-4 py-3">Pagamento</th>
						<th class="px-4 py-3">Status</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each items as g, i (g.id)}
						<tr
							class="hover:bg-slate-50"
							animate:flip={{ duration: 200 }}
							ondragover={(e) => e.preventDefault()}
							ondragenter={() => handleDragEnter(i)}
						>
							<td class="px-4 py-3 text-sm text-slate-400 select-none">
								<span
									role="button"
									tabindex="0"
									aria-label="Arraste para reordenar"
									draggable="true"
									ondragstart={() => handleDragStart(i)}
									ondragend={handleDragEnd}
									class="inline-flex cursor-grab items-center gap-1.5 active:cursor-grabbing"
								>
									<DotsSixVertical size={16} class="text-slate-300" />
									{i + 1}
								</span>
							</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-3">
									{#if g.imageUrl}
										<img src={g.imageUrl} alt={g.name} class="h-10 w-10 rounded-lg object-cover" />
									{:else}
										<div
											class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl"
										>
											🎁
										</div>
									{/if}
									<div>
										<p class="font-medium text-slate-800">{g.name}</p>
										{#if g.description}
											<p class="max-w-48 truncate text-xs text-slate-400">{g.description}</p>
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
								<select
									value={giftStatus(g)}
									onchange={(e) =>
										changeStatus(g, (e.target as HTMLSelectElement).value as GiftStatus)}
									class="cursor-pointer rounded-full border-0 px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-rose-400 {statusColors[
										giftStatus(g)
									]}"
								>
									<option value="available">{statusLabels.available}</option>
									<option value="locked">{statusLabels.locked}</option>
									<option value="purchased">{statusLabels.purchased}</option>
								</select>
							</td>
							<td class="px-4 py-3 text-right">
								<button onclick={() => openEdit(g)} class="mr-2 text-slate-400 hover:text-slate-700"
									>Editar</button
								>
								<button onclick={() => remove(g.id)} class="text-rose-400 hover:text-rose-600"
									>Remover</button
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
