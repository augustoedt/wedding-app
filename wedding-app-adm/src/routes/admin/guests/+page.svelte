<script lang="ts">
	import { getGuests, deleteGuest, updateGuest, type Guest, type RsvpStatus } from '$lib/api/guests.remote';
	import Tooltip from '$lib/components/Tooltip.svelte';

	let { data } = $props();

	let copiedId = $state<string | null>(null);

	function buildRsvpLink(g: Guest): string | null {
		if (!g.rsvpToken || !data.wedding?.siteUrl) return null;
		return `${data.wedding.siteUrl.replace(/\/$/, '')}/confirmacao/${g.rsvpToken}`;
	}

	function buildWhatsAppUrl(g: Guest): string | null {
		if (!g.phone || !data.wedding?.siteUrl) return null;
		const phone = g.phone.replace(/\D/g, '');
		const rsvpLink = buildRsvpLink(g) ?? '';
		const msg = (data.wedding.inviteMessage ?? '')
			.replace('{nome}', g.name)
			.replace('{link}', rsvpLink);
		return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
	}

	function copyRsvpLink(g: Guest) {
		const url = buildRsvpLink(g);
		if (!url) return;
		navigator.clipboard.writeText(url);
		copiedId = g.id;
		setTimeout(() => (copiedId = null), 2000);
	}

	const guests = getGuests();

	const rsvpColors: Record<RsvpStatus, string> = {
		pending: 'bg-yellow-100 text-yellow-700',
		confirmed: 'bg-emerald-100 text-emerald-700',
		declined: 'bg-red-100 text-red-600'
	};

	async function changeRsvp(g: Guest, rsvp: RsvpStatus) {
		await updateGuest({ id: g.id, rsvp });
		guests.refresh();
	}

	async function sendInvite(g: Guest) {
		const url = buildWhatsAppUrl(g);
		if (!url) return;
		await updateGuest({ id: g.id, inviteSent: true });
		guests.refresh();
		window.open(url, '_blank');
	}

	async function remove(id: string) {
		if (!confirm('Remover este convidado?')) return;
		await deleteGuest(id);
		guests.refresh();
	}
</script>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-slate-800">Convidados</h1>
		<a href="/admin/guests/new" class="btn-primary">+ Adicionar</a>
	</div>

	{#if guests.loading}
		<div class="h-40 animate-pulse rounded-xl bg-slate-200"></div>
	{:else if guests.error}
		<div class="rounded-xl bg-red-50 p-4 text-red-600">Erro ao carregar convidados.</div>
	{:else if !guests.current?.length}
		<div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-16 text-center">
			<p class="text-slate-500">Nenhum convidado cadastrado ainda.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl bg-white shadow-sm">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
						<th class="px-4 py-3">Nome</th>
						<th class="px-4 py-3">Contato</th>
						<th class="px-4 py-3">+1</th>
						<th class="px-4 py-3">Convite</th>
						<th class="px-4 py-3">RSVP</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each guests.current as g (g.id)}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3 font-medium text-slate-800">{g.name}</td>
							<td class="px-4 py-3 text-slate-500">
								{#if g.email}<div>{g.email}</div>{/if}
								{#if g.phone}<div>{g.phone}</div>{/if}
								{#if !g.email && !g.phone}<span class="text-slate-300">—</span>{/if}
							</td>
							<td class="px-4 py-3">
								{g.plusOne > 0 ? g.plusOne : '—'}
							</td>
							<td class="px-4 py-3">
								{#if g.inviteSent}
									<span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
										<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
										Enviado
									</span>
								{:else}
									<span class="text-slate-300">—</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								<select
									value={g.rsvp}
									onchange={(e) => changeRsvp(g, (e.target as HTMLSelectElement).value as RsvpStatus)}
									class="rounded-full px-2 py-1 text-xs font-medium border-0 focus:ring-1 focus:ring-rose-400 cursor-pointer {rsvpColors[g.rsvp]}"
								>
									<option value="pending">Pendente</option>
									<option value="confirmed">Confirmado</option>
									<option value="declined">Recusou</option>
								</select>
							</td>
							<td class="px-4 py-3 text-right">
								<div class="inline-flex items-center gap-1">
									{#if g.phone && data.wedding?.siteUrl}
										<Tooltip text={g.inviteSent ? 'Reenviar convite' : 'Enviar convite via WhatsApp'}>
											<button onclick={() => sendInvite(g)} aria-label={g.inviteSent ? 'Reenviar convite' : 'Enviar convite'} class="p-1 {g.inviteSent ? 'text-emerald-500 hover:text-emerald-700' : 'text-slate-400 hover:text-emerald-600'}">
												<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
													<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
													<path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.532 5.856L.057 23.886a.75.75 0 0 0 .918.919l6.101-1.463A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.715 9.715 0 0 1-4.964-1.358l-.356-.212-3.686.884.903-3.603-.232-.372A9.714 9.714 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
												</svg>
											</button>
										</Tooltip>
									{/if}
									{#if g.rsvpToken && data.wedding?.siteUrl}
										<Tooltip text={copiedId === g.id ? 'Copiado!' : 'Copiar link de RSVP'}>
											<button onclick={() => copyRsvpLink(g)} class="text-slate-400 hover:text-slate-700 p-1">
												{#if copiedId === g.id}
													<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
												{/if}
											</button>
										</Tooltip>
									{/if}
									<Tooltip text="Editar">
										<a href="/admin/guests/{g.id}" aria-label="Editar" class="text-slate-400 hover:text-slate-700 p-1 inline-flex">
											<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
										</a>
									</Tooltip>
									<Tooltip text="Remover">
										<button onclick={() => remove(g.id)} aria-label="Remover" class="text-rose-400 hover:text-rose-600 p-1">
											<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
										</button>
									</Tooltip>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
