<script lang="ts">
    import Cropper from '$lib/cropper/Cropper.svelte';
    import type { Point } from '$lib/cropper/geometry';
    import type { OverlayOptions } from '$lib/cropper/Overlay.svelte';
    import { defaultOptions, type Media, type Options } from '$lib/cropper/types';
    import { scale } from 'svelte/transition';

    let media: Media = {
        content_type: 'video',
        url: '/Mountain - 8837.mp4'
    };

    let options: Options<OverlayOptions> = {
        ...defaultOptions,
        shape: 'rect'
    };

    let value = {
        position: { x: 0, y: 0 },
        aspect: 1.2,
        rotation: 0,
        scale: 1.0
    };

    let position: Point = value.position;

    let cropper_el: Cropper<OverlayOptions>;
</script>

<div class="container">
    <h1>svelte-media-crop</h1>

    <p>A crop window with touch and mouse gestures to zoom, pan and rotate an image or video.</p>

    <div style="height:20em;width:100%;background: black">
        <Cropper bind:this={cropper_el} bind:value {media} {options} on:change />
    </div>

    <input type="color" bind:value={options.overlay_options.overlay_color} />
    <input type="color" bind:value={options.overlay_options.outline_color} />

    <div>
        <button
            on:click={() => {
                value.aspect = 8;
            }}>8:1</button
        >
        <button
            on:click={() => {
                value.aspect = 16 / 9;
            }}>16:9</button
        >
        <button
            on:click={() => {
                value.aspect = 4 / 3;
            }}>4:3</button
        >
        <button
            on:click={() => {
                value.aspect = 1;
            }}>1:1</button
        >
        <button
            on:click={() => {
                value.aspect = 3 / 4;
            }}>3:4</button
        >
    </div>

    <div>
        scale: <input
            type="range"
            min={0.001}
            max="6"
            step={0.01}
            on:input={(e) => cropper_el.set_zoom(parseFloat(e.currentTarget.value))}
            on:change={(e) => {
                cropper_el.commit();
                e.currentTarget.value = value.scale.toString();
            }}
            value={value.scale}
        />
        <!-- Note: For scale, it is necessary to update the value after the component scales
            the image to fit. Otherwise, the value of the input element can get out of sync. -->
        {value.scale}
    </div>
    <div>
        rotation: <input
            type="range"
            min={0}
            max="360"
            step={1}
            on:input={(e) => cropper_el.set_rotation(parseFloat(e.currentTarget.value))}
            on:change={cropper_el.commit}
            value={value.rotation}
        />
        {value.rotation}
    </div>
    <div>
        x: <input
            type="number"
            step={0.01}
            on:input={() => cropper_el.set_pan(position)}
            on:change={() => {
                cropper_el.commit();
                position.x = value.position.x;
            }}
            bind:value={position.x}
        />
        {position.x}
    </div>
    <div>
        y: <input
            type="number"
            step={0.01}
            on:input={() => cropper_el.set_pan(position)}
            on:change={() => {
                cropper_el.commit();
                position.y = value.position.y;
            }}
            bind:value={position.y}
        />
        {position.y}
    </div>

    <div>
        {JSON.stringify(value)}
    </div>

    <p>
        Video from shantararam at pixabay: <a
            href="https://pixabay.com/videos/mountain-nature-snow-old-mountain-8837/"
            >https://pixabay.com/videos/mountain-nature-snow-old-mountain-8837/</a
        >
    </p>
</div>

<style>
    .container {
        max-width: 50em;
        margin: 0 auto;
    }
</style>
