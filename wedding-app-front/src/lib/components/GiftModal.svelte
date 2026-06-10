<script lang="ts">
	import { lockGiftRemote } from '$lib/wedding.remote';
	import type { Gift, LockResult } from '$lib/server/api';

	let {
		gift,
		slug,
		onPurchased,
		onAlreadyTaken,
		onClose
	}: {
		gift: Gift;
		slug: string;
		onPurchased: (giftId: string) => void;
		onAlreadyTaken: (giftId: string) => void;
		onClose: () => void;
	} = $props();

	type Step = 'form' | 'payment' | 'error';

	let step = $state<Step>('form');
	let buyerName = $state('');
	let buyerEmail = $state('');
	let loading = $state(false);
	let result = $state<LockResult | null>(null);
	let errorMsg = $state('');

	function formatPrice(cents: number) {
		return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
			cents / 100
		);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		try {
			result = await lockGiftRemote({
				slug,
				giftId: gift.id,
				buyerName: buyerName.trim(),
				buyerEmail: buyerEmail.trim()
			});
			onPurchased(gift.id);
			if (result.paymentType === 'url' && result.paymentValue) {
				window.location.href = result.paymentValue;
				return;
			}
			step = 'payment';
		} catch (err) {
			if (err instanceof Error && err.message.includes('409')) {
				onAlreadyTaken(gift.id);
				return;
			}
			errorMsg = 'Algo deu errado. Tente novamente.';
			step = 'error';
		} finally {
			loading = false;
		}
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}
</script>

<!-- Backdrop -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
	role="dialog"
	aria-modal="true"
	aria-label="Comprar presente"
	tabindex="-1"
	onclick={handleBackdrop}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
>
	<div class="w-full max-w-md rounded-2xl bg-white shadow-xl">
		<!-- Header -->
		<div class="flex items-start justify-between border-b border-stone-100 px-6 py-4">
			<div>
				<h2 class="text-base font-medium text-stone-800">{gift.name}</h2>
				<p class="text-sm text-stone-500">{formatPrice(gift.price)}</p>
			</div>
			<button onclick={onClose} aria-label="Fechar" class="text-stone-400 hover:text-stone-600">
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
					<path
						d="M18 6L6 18M6 6l12 12"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>

		<!-- Body -->
		<div class="px-6 py-6">
			{#if step === 'form'}
				<p class="mb-5 text-sm text-stone-500">
					Preencha seus dados para reservar este presente.
				</p>

				<form onsubmit={handleSubmit} class="flex flex-col gap-4">
					<div class="relative">
						<input
							id="buyer-name"
							type="text"
							bind:value={buyerName}
							placeholder=" "
							class="peer w-full rounded-lg border border-stone-200 bg-stone-50 px-4 pt-5 pb-2 text-sm text-stone-800 outline-none focus:border-stone-400"
							required
						/>
						<label
							for="buyer-name"
							class="absolute top-1.5 left-4 text-xs text-stone-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
						>
							Seu nome
						</label>
					</div>

					<div class="relative">
						<input
							id="buyer-email"
							type="email"
							bind:value={buyerEmail}
							placeholder=" "
							class="peer w-full rounded-lg border border-stone-200 bg-stone-50 px-4 pt-5 pb-2 text-sm text-stone-800 outline-none focus:border-stone-400"
							required
						/>
						<label
							for="buyer-email"
							class="absolute top-1.5 left-4 text-xs text-stone-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs"
						>
							Seu e-mail
						</label>
					</div>

					<div class="flex gap-3 pt-2">
						<button
							type="button"
							onclick={onClose}
							class="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm text-stone-600 transition hover:bg-stone-50"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={loading}
							class="flex-1 rounded-lg bg-stone-800 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50"
						>
							{loading ? 'Aguarde...' : 'Confirmar'}
						</button>
					</div>
				</form>

			{:else if step === 'payment' && result}
				<div class="flex flex-col items-center gap-4 text-center">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
						<svg class="h-7 w-7 text-green-500" viewBox="0 0 24 24" fill="none">
							<path
								d="M5 13l4 4L19 7"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<div>
						<h3 class="font-medium text-stone-800">Presente reservado!</h3>
						<p class="mt-1 text-sm text-stone-500">
							{#if result.paymentType}
								Conclua o pagamento para confirmar.
							{:else}
								O casal entrará em contato para combinar o pagamento.
							{/if}
						</p>
					</div>

					{#if result.paymentType === 'url' && result.paymentValue}
						<a
							href={result.paymentValue}
							target="_blank"
							rel="noopener noreferrer"
							class="w-full rounded-lg bg-stone-800 py-2.5 text-center text-sm font-medium text-white transition hover:bg-stone-700"
						>
							Ir para o pagamento →
						</a>
					{:else if result.paymentType === 'pix' && result.paymentValue}
						<div class="w-full rounded-xl border border-stone-100 bg-stone-50 p-4">
							<p class="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
								Chave PIX
							</p>
							<div class="mb-4 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
								<span class="flex-1 truncate font-mono text-sm text-stone-700">
									{result.paymentValue}
								</span>
								<button
									onclick={() => navigator.clipboard.writeText(result!.paymentValue!)}
									class="shrink-0 text-stone-400 hover:text-stone-600"
									title="Copiar"
								>
									<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none">
										<rect
											x="9"
											y="9"
											width="13"
											height="13"
											rx="2"
											stroke="currentColor"
											stroke-width="2"
										/>
										<path
											d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
											stroke="currentColor"
											stroke-width="2"
										/>
									</svg>
								</button>
							</div>
							<img
								src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(result.paymentValue)}`}
								alt="QR Code PIX"
								class="mx-auto rounded-lg"
								width="180"
								height="180"
							/>
						</div>
					{/if}

					<button
						onclick={onClose}
						class="w-full rounded-lg border border-stone-200 py-2.5 text-sm text-stone-600 transition hover:bg-stone-50"
					>
						Fechar
					</button>
				</div>

			{:else if step === 'error'}
				<div class="flex flex-col items-center gap-4 text-center">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
						<svg class="h-7 w-7 text-red-400" viewBox="0 0 24 24" fill="none">
							<path
								d="M12 8v4m0 4h.01"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
							<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
						</svg>
					</div>
					<p class="text-sm text-stone-600">{errorMsg}</p>
					<div class="flex w-full gap-3">
						<button
							onclick={onClose}
							class="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm text-stone-600"
						>
							Fechar
						</button>
						<button
							onclick={() => (step = 'form')}
							class="flex-1 rounded-lg bg-stone-800 py-2.5 text-sm font-medium text-white"
						>
							Tentar novamente
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
