<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { confirmRsvpByToken } from '$lib/wedding.remote';
	import { saveToken } from '$lib/rsvp-store';
	import WeddingLayout from '$lib/components/WeddingLayout.svelte';

	let { data } = $props();
	const token = untrack(() => data.token);
	const wedding = untrack(() => data.wedding);
	const guestRsvp = untrack(() => data.guestRsvp);
	const allowedCompanions = untrack(() => guestRsvp?.allowedCompanions ?? 0);
	const invalidToken = guestRsvp === null;

	onMount(() => {
		saveToken(token);
	});

	type Step = 'choice' | 'success' | 'error';
	let step = $state<Step>(
		invalidToken ? 'error' : guestRsvp!.rsvp !== 'pending' ? 'success' : 'choice'
	);
	let loading = $state(false);
	let formError = $state('');
	let guestName = $state(guestRsvp?.name ?? '');
	let resultRsvp = $state<'confirmed' | 'declined' | null>(
		guestRsvp && guestRsvp.rsvp !== 'pending' ? guestRsvp.rsvp : null
	);
	let confirmedCompanionsShown = $state(guestRsvp?.confirmedCompanions ?? 0);

	let companions = $state(
		guestRsvp && guestRsvp.rsvp === 'confirmed' ? guestRsvp.confirmedCompanions : allowedCompanions
	);

	async function handleRsvp(rsvp: 'confirmed' | 'declined') {
		formError = '';

		if (rsvp === 'confirmed' && allowedCompanions > 0) {
			if (!Number.isInteger(companions) || companions < 0) {
				formError = 'Informe uma quantidade válida de acompanhantes.';
				return;
			}
			if (companions > allowedCompanions) {
				formError = `Você pode confirmar no máximo ${allowedCompanions} acompanhante(s).`;
				return;
			}
		}

		loading = true;
		try {
			const result = await confirmRsvpByToken({
				token,
				rsvp,
				companions: rsvp === 'confirmed' ? companions : undefined
			});
			guestName = result.name;
			confirmedCompanionsShown = result.confirmedCompanions;
			resultRsvp = rsvp;
			step = 'success';
		} catch (e) {
			formError = e instanceof Error ? e.message : 'Não foi possível registrar sua resposta.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Confirmação de Presença</title>
</svelte:head>

<WeddingLayout {wedding} dark>
	<main class="flex flex-1 flex-col items-center justify-center bg-stone-50 px-6 py-20">
		<div class="mb-8 flex flex-col items-center gap-3">
			<svg
				class="h-14 w-14 text-rose-300"
				viewBox="0 0 800 700"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="m263.42 235.15c-66.24 0-120 53.76-120 120 0 134.76 135.93 170.09 228.56 303.31
					87.574-132.4 228.56-172.86 228.56-303.31 0-66.24-53.76-120-120-120-48.048
					0-89.402 28.37-108.56 69.188-19.161-40.817-60.514-69.188-108.56-69.188z"
				/>
			</svg>

			<h1 class="font-serif text-5xl text-stone-700">Confirmação de Presença</h1>

			<div class="flex items-center gap-3">
				<div class="h-px w-12 bg-stone-300"></div>
				<svg
					class="h-3 w-3 text-stone-400"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191
						1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0
						5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"
					/>
				</svg>
				<div class="h-px w-12 bg-stone-300"></div>
			</div>
		</div>

		<div class="w-full max-w-sm rounded-2xl border border-stone-100 bg-white px-8 py-10 shadow-sm">
			{#if step === 'choice'}
				<p class="mb-6 text-center text-sm leading-relaxed text-stone-500">
					Faça parte da nossa história de amor.<br />Confirme sua presença abaixo.
				</p>

				{#if allowedCompanions > 0}
					<div class="mb-6 text-left">
						<label for="companions" class="mb-1 block text-sm font-medium text-stone-600">
							Quantos acompanhantes irão com você?
						</label>
						<p class="mb-2 text-xs text-stone-400">
							Não inclui você. Máximo permitido: {allowedCompanions}.
						</p>
						<input
							id="companions"
							type="number"
							min="0"
							max={allowedCompanions}
							bind:value={companions}
							class="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700"
						/>
					</div>
				{/if}

				{#if formError}
					<p class="mb-4 text-center text-sm text-red-600">{formError}</p>
				{/if}

				<div class="flex flex-col gap-3">
					<button
						onclick={() => handleRsvp('confirmed')}
						disabled={loading}
						class="rounded-lg bg-stone-800 py-3.5 text-sm font-medium tracking-widest text-white uppercase transition hover:bg-stone-700 disabled:opacity-50"
					>
						{loading ? 'Enviando...' : 'Confirmar presença'}
					</button>

					<button
						onclick={() => handleRsvp('declined')}
						disabled={loading}
						class="rounded-lg border border-stone-300 bg-white py-3.5 text-sm font-medium tracking-widest text-stone-600 uppercase transition hover:bg-stone-50 disabled:opacity-50"
					>
						{loading ? 'Enviando...' : 'Não poderei comparecer'}
					</button>
				</div>
			{:else if step === 'success'}
				<div class="flex flex-col items-center gap-4 py-2 text-center">
					{#if resultRsvp === 'confirmed'}
						<div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
							<svg
								class="h-8 w-8 text-green-500"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M5 13l4 4L19 7"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</div>
						<h2 class="font-serif text-4xl text-stone-700">{guestName || 'Obrigado'}!</h2>
						<p class="text-sm leading-relaxed text-stone-500">
							Sua presença foi confirmada.<br />Estamos muito felizes! Até lá. 🤍
						</p>
						{#if allowedCompanions > 0}
							<p class="text-sm text-stone-500">
								{confirmedCompanionsShown > 0
									? `+ ${confirmedCompanionsShown} acompanhante${confirmedCompanionsShown > 1 ? 's' : ''} confirmado${confirmedCompanionsShown > 1 ? 's' : ''}.`
									: 'Você confirmou presença sozinho(a).'}
							</p>
						{/if}
					{:else}
						<div class="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
							<svg
								class="h-8 w-8 text-stone-400"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M12 8v4m0 4h.01"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
								/>
								<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
							</svg>
						</div>
						<h2 class="font-serif text-4xl text-stone-700">Que pena, {guestName}!</h2>
						<p class="text-sm leading-relaxed text-stone-500">
							Sentiremos sua falta.<br />Obrigado por nos avisar!
						</p>
					{/if}
				</div>

				<button
					onclick={() => (step = 'choice')}
					class="mt-6 block w-full text-center text-sm text-stone-500 underline hover:text-stone-700"
				>
					Alterar resposta
				</button>
			{:else if step === 'error'}
				<div class="flex flex-col items-center gap-4 py-2 text-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
						<svg class="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								d="M6 18L18 6M6 6l12 12"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					</div>
					<p class="text-sm text-stone-500">
						Não foi possível encontrar sua confirmação.<br />O link pode ter expirado ou ser
						inválido.
					</p>
				</div>
			{/if}
		</div>
	</main>
</WeddingLayout>
