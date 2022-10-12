<script lang="ts">
    import CropWindow from '$lib/cropper/CropWindow.svelte';
    import type { Point } from '$lib/cropper/geometry';
    import type { OverlayOptions } from '$lib/cropper/Overlay.svelte';
    import {
        defaultOptions,
        defaultValue,
        type Media,
        type Options,
        type Value
    } from '$lib/cropper/types';

    import Highlight from 'svelte-highlight';
    import typescript from 'svelte-highlight/languages/typescript';
    import atomOneDark from 'svelte-highlight/styles/atom-one-dark';

    let media: Media = {
        content_type: 'video',
        url: '/Mountain - 8837.mp4'
    };

    let options: Options<OverlayOptions> = {
        ...defaultOptions,
        shape: 'rect',
        overlay_options: {
            line_color: '#f3f5e8',
            overlay_color: '#167676'
        }
    };

    let background_color = '#164646';

    let value: Value = defaultValue;

    let position: Point = { x: 0, y: 0 };

    let crop_window_el: CropWindow<OverlayOptions>;

    $: {
        position = value.position;
    }
</script>

<svelte:head>
    {@html atomOneDark}
</svelte:head>

<div class="container">
    <div class="box">
        <h1><a href="https://github.com/sabine/svelte-media-crop">svelte-media-crop</a></h1>

        <h2>
            A crop window with touch and mouse gestures to zoom, pan and rotate an image or video.
        </h2>
    </div>

    <div class="box">
        <h3 id="with-controls"><a href="#with-controls">Example with controls</a></h3>

        <div style="height:20em; background: {background_color}">
            <CropWindow bind:this={crop_window_el} bind:value {media} {options} />
        </div>

        <div>
            overlay color: <input type="color" bind:value={options.overlay_options.overlay_color} />
            line color: <input type="color" bind:value={options.overlay_options.line_color} />
            background color: <input type="color" bind:value={background_color} />
        </div>

        <div>
            aspect ratio
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
                on:input={(e) => crop_window_el.set_zoom(parseFloat(e.currentTarget.value))}
                on:change={(e) => {
                    crop_window_el.commit();
                    e.currentTarget.value = value.scale.toString();
                }}
                value={value.scale}
            />
            <!-- Note: For scale, it is necessary to update the value after the component scales
            the image to fit. Otherwise, the value of the input element can get out of sync. -->
            {Math.round(value.scale*100)/100}
        </div>
        <div>
            rotation: <input
                type="range"
                min={-180}
                max="180"
                step={1}
                on:input={(e) => crop_window_el.set_rotation(parseFloat(e.currentTarget.value))}
                on:change={crop_window_el.commit}
                value={value.rotation}
            />
            {Math.round(value.rotation*100)/100}
        </div>
        <div>
            position: x: <input
                type="number"
                step={0.01}
                on:input={() => crop_window_el.set_pan(position)}
                on:change={() => {
                    crop_window_el.commit();
                    position.x = value.position.x;
                }}
                bind:value={position.x}
            />

            y:
            <input
                type="number"
                step={0.01}
                on:input={() => crop_window_el.set_pan(position)}
                on:change={() => {
                    crop_window_el.commit();
                    position.y = value.position.y;
                }}
                bind:value={position.y}
            />
        </div>
    </div>
    <div class="box">
        <h3 id="minimal-code-example"><a href="#minimal-code-example">Minimal code example</a></h3>
        <div style="height:20em; background: #222">
            <CropWindow bind:value {media} options={defaultOptions} />
        </div>
        <div>
            <Highlight
                language={typescript}
                code={`// in script tag
import { CropWindow, defaultOptions, defaultValue } from 'svelte-media-crop';

let media: Media = {
    content_type: 'video',
    url: '/Mountain - 8837.mp4'
};

let value = defaultValue;

// in the template
<div style="height:20em; background: #222">
    <CropWindow bind:value {media} options={defaultOptions} />
</div>
`}
            />
        </div>
    </div>

    <small>
    <p>
        Video from shantararam at pixabay: <a
            href="https://pixabay.com/videos/mountain-nature-snow-old-mountain-8837/"
            >https://pixabay.com/videos/mountain-nature-snow-old-mountain-8837/</a
        >
    </p>
</small>
</div>

<style>
    .container {
        max-width: 50em;
        margin: 0 auto;
    }

    .box {
        padding: 1.5rem 0;
    }

    h1 {
        padding-top: 2rem;
    }

    h2 {
        margin-top: 1rem;
        font-weight: normal;
        font-size: 1.2rem;
    }

    h3 {
        padding: 1rem 0;
    }

    h1 a:hover,
    h2 a:hover,
    h3 a:hover {
        text-decoration: none;
    }

    *:target * {
        background: #37b5b5;
        color: black;
    }
</style>
