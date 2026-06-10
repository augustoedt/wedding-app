<script lang="ts">
	import { getPayments, confirmPayment, type PaymentStatus } from '$lib/api/payments.remote';

	const payments = getPayments();

	let filterStatus = $state('');
	let pendingId = $state<string | null>(null);
	let confirming = $state(false);

	const filtered = $derived(
		filterStatus
			? (payments.current ?? []).filter((p) => p.status === filterStatus)
			: (payments.current ?? [])
	);

	async function handleConfirm() {
		if (!pendingId) return;
		confirming = true;
		await confirmPayment(pendingId);
		pendingId = null;
		confirming = false;
		payments.refresh();
	}

	const statusLabels: Record<PaymentStatus, string> = {
		pending_confirmation: 'Aguardando confirmação',
		approved: 'Aprovado',
		expired: 'Expirado'
	};

	const statusColors: Record<PaymentStatus, string> = {
		pending_confirmation: 'bg-yellow-100 text-yellow-700',
		approved: 'bg-emerald-100 text-emerald-700',
		expired: 'bg-slate-100 text-slate-500'
	};

	function formatPrice(cents: number) {
		return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('pt-BR');
	}
</script>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-slate-800">Pagamentos</h1>

		<div class="flex items-center gap-2">
			<select
				bind:value={filterStatus}
				class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
			>
				<option value="">Todos</option>
				<option value="pending_confirmation">Aguardando confirmação</option>
				<option value="approved">Aprovados</option>
				<option value="expired">Expirados</option>
			</select>
		</div>
	</div>

	{#if payments.loading}
		<div class="h-40 animate-pulse rounded-xl bg-slate-200"></div>
	{:else if payments.error}
		<div class="rounded-xl bg-red-50 p-4 text-red-600">Erro ao carregar pagamentos.</div>
	{:else if !filtered.length}
		<div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-16 text-center">
			<p class="text-slate-500">Nenhum pagamento encontrado.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl bg-white shadow-sm">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
						<th class="px-4 py-3">Comprador</th>
						<th class="px-4 py-3">Valor</th>
						<th class="px-4 py-3">Status</th>
						<th class="px-4 py-3">Data</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filtered as p (p.id)}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3">
								<p class="font-medium text-slate-800">{p.buyerName}</p>
								<p class="text-xs text-slate-400">{p.buyerEmail}</p>
							</td>
							<td class="px-4 py-3 font-medium text-slate-700">{formatPrice(p.amount)}</td>
							<td class="px-4 py-3">
								<span class="rounded-full px-2.5 py-1 text-xs font-medium {statusColors[p.status]}">
									{statusLabels[p.status]}
								</span>
							</td>
							<td class="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
							<td class="px-4 py-3 text-right">
								{#if p.status === 'pending_confirmation'}
									<button
										onclick={() => (pendingId = p.id)}
										class="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600"
									>
										Confirmar recebimento
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if pendingId}
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
	>
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<h2 id="dialog-title" class="mb-2 text-base font-semibold text-slate-800">
				Confirmar recebimento
			</h2>
			<p class="mb-6 text-sm text-slate-500">
				Tem certeza que deseja confirmar o recebimento deste pagamento? Esta ação não pode ser
				desfeita.
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={() => (pendingId = null)}
					disabled={confirming}
					class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
				>
					Cancelar
				</button>
				<button
					onclick={handleConfirm}
					disabled={confirming}
					class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
				>
					{confirming ? 'Confirmando...' : 'Confirmar'}
				</button>
			</div>
		</div>
	</div>
{/if}
