<script lang="ts">
    import Cropper from '$lib/cropper/Cropper.svelte';
    import { defaultOptions, type Media, type Options } from '$lib/cropper/types';

    let media: Media = {
        content_type: 'video',
        url: '/Mountain - 8837.mp4'
    };

    let options: Options = {
        ...defaultOptions,
        shape: 'rect'
    };

    let value = {
        position: { x: 0, y: 0 },
        aspect: 1.2,
        rotation: 0,
        scale: 1.0
    };

    let cropper_el: Cropper;
</script>

<div>
    <h1>svelte-media-crop</h1>

    <p>A crop window with touch and mouse gestures to zoom, pan and rotate an image or video.</p>

    <div style="height:20em;width:100%;background: black">
        <Cropper bind:this={cropper_el} bind:value {media} {options} on:change />
    </div>
    <button on:click={() => {value.aspect = 8.2}}>8.2</button>
    <button on:click={() => {value.aspect = 1.2}}>1.2</button>
    <button on:click={() => {value.aspect = 0.8}}>0.8</button>

    <div>
    {JSON.stringify(value)}
    </div>

    <p>
        Image from pixabay: <a
            href="https://pixabay.com/photos/hintersee-lake-mountains-nature-3601004/"
            >https://pixabay.com/photos/hintersee-lake-mountains-nature-3601004/</a
        >
    </p>
</div>
