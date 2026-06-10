<script lang="ts">
	let { value = 0, label = '' }: { value: number; label: string } = $props();

	let display = $derived(String(value).padStart(2, '0'));
</script>

<div class="flex flex-col items-center gap-2">
	{#key value}
		<div class="flip-card">
			<div class="card-top">
				<span>{display}</span>
			</div>
			<div class="card-divider"></div>
			<div class="card-bottom">
				<span>{display}</span>
			</div>
		</div>
	{/key}
	<span class="text-xs font-medium tracking-[0.2em] uppercase text-stone-500">{label}</span>
</div>

<style>
	.flip-card {
		position: relative;
		width: 72px;
		height: 88px;
		background: #1c1c1c;
		border-radius: 8px;
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.2),
			0 1px 4px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-family: 'Montserrat', sans-serif;
		font-size: 2.25rem;
		font-weight: 700;
		color: #ffffff;
		perspective: 400px;
		animation: flip-in 0.35s ease-out;
	}

	.card-top,
	.card-bottom {
		position: absolute;
		left: 0;
		right: 0;
		height: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-top {
		top: 0;
		border-radius: 8px 8px 0 0;
		background: #1c1c1c;
		align-items: flex-end;
		padding-bottom: 2px;
	}

	.card-top span {
		transform: translateY(55%);
		display: block;
		line-height: 1;
	}

	.card-bottom {
		bottom: 0;
		border-radius: 0 0 8px 8px;
		background: #242424;
		align-items: flex-start;
		padding-top: 2px;
	}

	.card-bottom span {
		transform: translateY(-55%);
		display: block;
		line-height: 1;
	}

	.card-divider {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 0px;
		background: rgba(0, 0, 0, 0.6);
		z-index: 1;
	}

	@keyframes flip-in {
		0% {
			transform: rotateX(90deg);
			opacity: 0;
		}
		100% {
			transform: rotateX(0deg);
			opacity: 1;
		}
	}
</style>
