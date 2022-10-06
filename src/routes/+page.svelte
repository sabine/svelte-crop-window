<script lang="ts">
	import Cropper from '$lib/cropper/Cropper.svelte';
	import type { CropShape } from '$lib/cropper/geometry';

	export let content_type: 'image' | 'video' = 'image';
	export let url: string = '/succulents-3693409_1920.jpg';

	export let crop_shape: CropShape = 'rect';

	export let crop = {
		position: { x: 0, y: 0 },
		aspect: 1.0,
		rotation: 0,
		scale: 1.0
	};
</script>

<div style="width:100%;height:30em">
	<h1>svelte-media-crop</h1>

	<p>A component for cropping images and videos.</p>

	{#if url}
		<div style="height:100%;width:100%">
			<Cropper
				bind:value={crop}
				media={{ url, content_type }}
				aspect={crop.aspect}
				{crop_shape}
				on:change
			/>
		</div>
	{/if}

	<p>Succulents on pixabay: <a href="https://pixabay.com/images/id-3693409/">https://pixabay.com/images/id-3693409/</a></p>
</div>
