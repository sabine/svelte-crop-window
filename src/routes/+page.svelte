<script lang="ts">
    import Cropper from '$lib/cropper/Cropper.svelte';
    import type { Media, Options } from '$lib/cropper/types';

    let media: Media = {
        content_type: 'image',
        url: '/hintersee-3601004.jpg'
    };

    let options: Options = {
        shape: 'rect'
    };

    let value = {
        position: { x: 0, y: 0 },
        aspect: 1.0,
        rotation: 0,
        scale: 1.0
    };
</script>

<div style="width:100%;height:30em">
    <h1>svelte-media-crop</h1>

    <p>A crop window with touch and mouse gestures to zoom, pan and rotate an image or video.</p>

    <div style="height:100%;width:100%">
        <Cropper bind:value {media} {options} on:change />
    </div>

    {JSON.stringify(value)}

    <p>
        Image from pixabay: <a href="https://pixabay.com/photos/hintersee-lake-mountains-nature-3601004/"
            >https://pixabay.com/photos/hintersee-lake-mountains-nature-3601004/</a
        >
    </p>
</div>
