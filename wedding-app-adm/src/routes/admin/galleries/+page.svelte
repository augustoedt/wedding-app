<script lang="ts">
	import { flip } from 'svelte/animate';
	import { DotsSixVertical, Trash, X } from 'phosphor-svelte';
	import {
		getGalleries,
		addGallery,
		updateGallery,
		deleteGallery,
		reorderGallery,
		type Gallery
	} from '$lib/api/galleries.remote';
	import { getImages, updateImage, reorderImage, type Image } from '$lib/api/images.remote';

	const galleriesQuery = getGalleries();
	const imagesQuery = getImages();

	let galleryItems = $state<Gallery[]>([]);
	$effect(() => {
		if (galleriesQuery.current) galleryItems = [...galleriesQuery.current];
	});

	let imagesByGallery = $state<Record<string, Image[]>>({});
	$effect(() => {
		if (!imagesQuery.current) return;
		const grouped: Record<string, Image[]> = {};
		for (const img of imagesQuery.current) {
			if (!img.galleryId) continue;
			(grouped[img.galleryId] ??= []).push(img);
		}
		for (const key in grouped) {
			grouped[key]!.sort((a, b) => a.sortOrder - b.sortOrder);
		}
		imagesByGallery = grouped;
	});

	const unassignedImages = $derived((imagesQuery.current ?? []).filter((i) => !i.galleryId));

	let newTitle = $state('');
	let creating = $state(false);

	async function createGallery() {
		if (!newTitle.trim()) return;
		creating = true;
		try {
			await addGallery({ title: newTitle.trim() });
			newTitle = '';
			galleriesQuery.refresh();
		} finally {
			creating = false;
		}
	}

	let editingId = $state<string | null>(null);
	let editingTitle = $state('');

	function startEdit(gallery: Gallery) {
		editingId = gallery.id;
		editingTitle = gallery.title;
	}

	async function saveEdit() {
		if (!editingId || !editingTitle.trim()) return;
		await updateGallery({ id: editingId, title: editingTitle.trim() });
		editingId = null;
		galleriesQuery.refresh();
	}

	async function removeGallery(id: string) {
		if (!confirm('Excluir esta galeria? As fotos voltam para a Mídia, sem serem apagadas.')) return;
		await deleteGallery(id);
		galleriesQuery.refresh();
		imagesQuery.refresh();
	}

	let dragGalleryIndex = $state<number | null>(null);

	function galleryDragStart(i: number) {
		dragGalleryIndex = i;
	}

	function galleryDragEnter(i: number) {
		if (dragGalleryIndex === null || dragGalleryIndex === i) return;
		const moved = galleryItems[dragGalleryIndex];
		if (!moved) return;
		galleryItems.splice(dragGalleryIndex, 1);
		galleryItems.splice(i, 0, moved);
		dragGalleryIndex = i;
	}

	async function galleryDragEnd() {
		if (dragGalleryIndex === null) return;
		const i = dragGalleryIndex;
		dragGalleryIndex = null;
		const target = galleryItems[i];
		if (!target) return;
		await reorderGallery({
			id: target.id,
			beforeId: galleryItems[i - 1]?.id,
			afterId: galleryItems[i + 1]?.id
		});
		galleriesQuery.refresh();
	}

	let dragImage = $state<{ galleryId: string; index: number } | null>(null);

	function imageDragStart(galleryId: string, i: number) {
		dragImage = { galleryId, index: i };
	}

	function imageDragEnter(galleryId: string, i: number) {
		if (!dragImage || dragImage.galleryId !== galleryId || dragImage.index === i) return;
		const list = imagesByGallery[galleryId];
		const moved = list?.[dragImage.index];
		if (!list || !moved) return;
		list.splice(dragImage.index, 1);
		list.splice(i, 0, moved);
		dragImage = { galleryId, index: i };
	}

	async function imageDragEnd() {
		if (!dragImage) return;
		const { galleryId, index } = dragImage;
		dragImage = null;
		const list = imagesByGallery[galleryId];
		const target = list?.[index];
		if (!target) return;
		await reorderImage({
			id: target.id,
			beforeId: list[index - 1]?.id,
			afterId: list[index + 1]?.id
		});
		imagesQuery.refresh();
	}

	async function removeFromGallery(imageId: string) {
		await updateImage({ id: imageId, galleryId: null });
		imagesQuery.refresh();
	}

	async function assignToGallery(imageId: string, galleryId: string) {
		await updateImage({ id: imageId, galleryId });
		imagesQuery.refresh();
	}

	let uploadingGalleryId = $state<string | null>(null);

	async function uploadToGallery(galleryId: string, e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploadingGalleryId = galleryId;
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('galleryId', galleryId);
			const res = await fetch('/admin/images', { method: 'POST', body: formData });
			if (!res.ok)
				throw new Error(
					'Não foi possível enviar a imagem. Verifique o formato e o tamanho do arquivo.'
				);
			imagesQuery.refresh();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Erro ao enviar imagem');
		} finally {
			uploadingGalleryId = null;
			input.value = '';
		}
	}
</script>

<div class="p-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-slate-800">Galerias</h1>
	</div>

	<div class="mb-6 rounded-xl bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-base font-semibold text-slate-700">Nova galeria</h2>
		<div class="flex flex-wrap items-end gap-3">
			<div class="min-w-48 flex-1">
				<label for="gal-title" class="block text-sm font-medium text-slate-700">Título</label>
				<input
					id="gal-title"
					bind:value={newTitle}
					placeholder="Ex: Cerimônia"
					class="input mt-1"
					onkeydown={(e) => e.key === 'Enter' && createGallery()}
				/>
			</div>
			<button onclick={createGallery} disabled={creating || !newTitle.trim()} class="btn-primary">
				{creating ? 'Criando...' : '+ Criar galeria'}
			</button>
		</div>
	</div>

	{#if galleriesQuery.loading || imagesQuery.loading}
		<div class="h-40 animate-pulse rounded-xl bg-slate-200"></div>
	{:else if galleriesQuery.error || imagesQuery.error}
		<div class="rounded-xl bg-red-50 p-4 text-red-600">Erro ao carregar galerias.</div>
	{:else if !galleryItems.length}
		<div
			class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-16 text-center"
		>
			<p class="text-slate-500">Nenhuma galeria criada ainda.</p>
		</div>
	{:else}
		<div class="space-y-6">
			{#each galleryItems as gallery, i (gallery.id)}
				<div
					role="group"
					class="rounded-xl bg-white p-6 shadow-sm"
					animate:flip={{ duration: 200 }}
					ondragover={(e) => e.preventDefault()}
					ondragenter={() => galleryDragEnter(i)}
				>
					<div class="mb-4 flex flex-wrap items-center gap-3">
						<span
							role="button"
							tabindex="0"
							aria-label="Arraste para reordenar a galeria"
							draggable="true"
							ondragstart={() => galleryDragStart(i)}
							ondragend={galleryDragEnd}
							class="inline-flex cursor-grab items-center text-slate-300 active:cursor-grabbing"
						>
							<DotsSixVertical size={18} />
						</span>

						{#if editingId === gallery.id}
							<input
								bind:value={editingTitle}
								class="input max-w-xs flex-1"
								onkeydown={(e) => e.key === 'Enter' && saveEdit()}
							/>
							<button
								onclick={saveEdit}
								class="text-sm font-medium text-rose-500 hover:text-rose-700"
							>
								Salvar
							</button>
							<button
								onclick={() => (editingId = null)}
								class="text-sm text-slate-400 hover:text-slate-600"
							>
								Cancelar
							</button>
						{:else}
							<button
								onclick={() => startEdit(gallery)}
								class="text-lg font-semibold text-slate-800 hover:text-rose-600"
							>
								{gallery.title}
							</button>
							<span class="text-xs text-slate-400">
								{(imagesByGallery[gallery.id] ?? []).length} foto(s)
							</span>
						{/if}

						<div class="ml-auto flex items-center gap-3">
							<label class="btn-ghost cursor-pointer text-sm">
								{uploadingGalleryId === gallery.id ? 'Enviando...' : '+ Adicionar fotos'}
								<input
									type="file"
									accept="image/jpeg,image/png,image/webp,image/gif"
									class="hidden"
									onchange={(e) => uploadToGallery(gallery.id, e)}
									disabled={uploadingGalleryId === gallery.id}
								/>
							</label>
							<button
								onclick={() => removeGallery(gallery.id)}
								class="text-rose-400 hover:text-rose-600"
								aria-label="Excluir galeria"
							>
								<Trash size={18} />
							</button>
						</div>
					</div>

					{#if (imagesByGallery[gallery.id] ?? []).length}
						<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
							{#each imagesByGallery[gallery.id] ?? [] as image, gi (image.id)}
								<div
									role="group"
									class="group relative overflow-hidden rounded-lg"
									animate:flip={{ duration: 200 }}
									ondragover={(e) => e.preventDefault()}
									ondragenter={() => imageDragEnter(gallery.id, gi)}
								>
									<span
										role="button"
										tabindex="0"
										aria-label="Arraste para reordenar a foto"
										draggable="true"
										ondragstart={() => imageDragStart(gallery.id, gi)}
										ondragend={imageDragEnd}
										class="absolute top-1 left-1 z-10 flex h-5 w-5 cursor-grab items-center justify-center rounded bg-black/40 text-white active:cursor-grabbing"
									>
										<DotsSixVertical size={12} />
									</span>
									<button
										onclick={() => removeFromGallery(image.id)}
										aria-label="Remover da galeria"
										class="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded bg-black/40 text-white opacity-0 transition group-hover:opacity-100"
									>
										<X size={12} />
									</button>
									<img
										src={image.url}
										alt={image.description ?? ''}
										class="h-24 w-full object-cover"
									/>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-slate-400">Nenhuma foto nessa galeria ainda.</p>
					{/if}

					{#if unassignedImages.length}
						<div class="mt-4 border-t border-slate-100 pt-4">
							<p class="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
								Adicionar da Mídia
							</p>
							<div class="flex flex-wrap gap-2">
								{#each unassignedImages as image (image.id)}
									<button
										onclick={() => assignToGallery(image.id, gallery.id)}
										class="h-14 w-14 overflow-hidden rounded-lg border border-slate-200 hover:border-rose-400"
										title="Adicionar a esta galeria"
									>
										<img
											src={image.url}
											alt={image.description ?? ''}
											class="h-full w-full object-cover"
										/>
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
