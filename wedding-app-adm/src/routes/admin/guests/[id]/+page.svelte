<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { addGuest, updateGuest } from '$lib/api/guests.remote';

	let { data } = $props();
	const isNew = $derived(data.id === 'new');

	let form = $state(
		untrack(() => ({
			name: data.guest?.name ?? '',
			email: data.guest?.email ?? '',
			phone: data.guest?.phone ?? '',
			plusOne: Number(data.guest?.plusOne ?? 0)
		}))
	);

	let loading = $state(false);
	let formError = $state('');

	async function submit() {
		loading = true;
		formError = '';
		try {
			const plusOne = Math.max(0, Number(form.plusOne) || 0);
			if (isNew) {
				await addGuest({
					name: form.name,
					email: form.email || undefined,
					phone: form.phone || undefined,
					plusOne
				});
			} else {
				await updateGuest({
					id: data.id,
					name: form.name,
					email: form.email || null,
					phone: form.phone || null,
					plusOne
				});
			}
			goto('/admin/guests');
		} catch (e) {
			formError = e instanceof Error ? e.message : 'Erro ao salvar convidado';
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-8 max-w-lg">
	<div class="mb-6 flex items-center gap-4">
		<a href="/admin/guests" class="text-sm text-slate-400 hover:text-slate-700">← Voltar</a>
		<h1 class="text-2xl font-semibold text-slate-800">
			{isNew ? 'Novo Convidado' : 'Editar Convidado'}
		</h1>
	</div>

	<div class="rounded-xl bg-white p-6 shadow-sm">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="g-name" class="block text-sm font-medium text-slate-700">Nome *</label>
				<input id="g-name" bind:value={form.name} required class="input mt-1" placeholder="Nome completo" />
			</div>
			<div>
				<label for="g-email" class="block text-sm font-medium text-slate-700">E-mail</label>
				<input id="g-email" bind:value={form.email} type="email" class="input mt-1" />
			</div>
			<div>
				<label for="g-phone" class="block text-sm font-medium text-slate-700">Telefone</label>
				<input id="g-phone" bind:value={form.phone} type="tel" class="input mt-1" />
			</div>
			<div>
				<label for="g-plusone" class="block text-sm font-medium text-slate-700">Acompanhantes</label>
				<input id="g-plusone" bind:value={form.plusOne} type="number" min="0" class="input mt-1 w-24" />
			</div>
		</div>

		{#if formError}
			<p class="mt-3 text-sm text-red-600">{formError}</p>
		{/if}

		<div class="mt-6 flex gap-3">
			<button onclick={submit} disabled={loading} class="btn-primary">
				{loading ? 'Salvando...' : 'Salvar'}
			</button>
			<a href="/admin/guests" class="btn-ghost">Cancelar</a>
		</div>
	</div>
</div>
