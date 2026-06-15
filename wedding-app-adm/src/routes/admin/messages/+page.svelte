<script lang="ts">
	import { getMessages, setMessageVisibility } from '$lib/api/messages.remote';

	const messages = getMessages();

	let updatingId = $state<string | null>(null);

	async function toggleVisibility(id: string, isVisible: boolean) {
		updatingId = id;
		await setMessageVisibility({ id, isVisible });
		updatingId = null;
		messages.refresh();
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('pt-BR');
	}
</script>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-slate-800">Mensagens</h1>
	</div>

	{#if messages.loading}
		<div class="h-40 animate-pulse rounded-xl bg-slate-200"></div>
	{:else if messages.error}
		<div class="rounded-xl bg-red-50 p-4 text-red-600">Erro ao carregar mensagens.</div>
	{:else if !messages.current?.length}
		<div
			class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-16 text-center"
		>
			<p class="text-slate-500">Nenhuma mensagem recebida ainda.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl bg-white shadow-sm">
			<table class="w-full text-sm">
				<thead>
					<tr
						class="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide"
					>
						<th class="px-4 py-3">Remetente</th>
						<th class="px-4 py-3">Mensagem</th>
						<th class="px-4 py-3">Data</th>
						<th class="px-4 py-3">Status</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each messages.current as m (m.id)}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3 font-medium text-slate-800">{m.senderName}</td>
							<td class="max-w-md px-4 py-3 text-slate-600">{m.message}</td>
							<td class="px-4 py-3 text-slate-500">{formatDate(m.createdAt)}</td>
							<td class="px-4 py-3">
								{#if m.isVisible}
									<span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
										Visível
									</span>
								{:else}
									<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
										Oculto
									</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-right">
								<button
									onclick={() => toggleVisibility(m.id, !m.isVisible)}
									disabled={updatingId === m.id}
									class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
								>
									{m.isVisible ? 'Ocultar' : 'Mostrar'}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
