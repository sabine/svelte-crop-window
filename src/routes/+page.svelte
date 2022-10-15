<script lang="ts">
    import { base } from '$app/paths';
    import CropWindow from '$lib/crop_window/CropWindow.svelte';
    import type { Point } from '$lib/crop_window/geometry';
    import type { OverlayOptions } from '$lib/overlay/Overlay.svelte';
    import {
        defaultOptions,
        defaultValue,
        type Media,
        type Options,
        type CropValue
    } from '$lib/types';

    import { Highlight, HighlightSvelte } from 'svelte-highlight';
    import { atomOneDark } from 'svelte-highlight/styles';
    import typescript from 'svelte-highlight/languages/typescript';

    let media: Media = {
        content_type: 'video',
        url: `${base}/Mountain - 8837.mp4`
    };

    let options: Options<OverlayOptions> = {
        ...defaultOptions,
        overlay_options: {
            line_color: '#f3f5e8',
            overlay_color: '#167676'
        }
    };

    let background_color = '#164646';

    let value: CropValue = defaultValue;
    let value2: CropValue = defaultValue;

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
        <h1>
            <a
                href="https://github.com/sabine/svelte-crop-window"
                style="display:flex;align-items:center"
            >
                <img
                    src="{base}/logo.svg"
                    alt="svelte media crop"
                    style="height:5rem;margin-right:1rem"
                />
                svelte-crop-window</a
            >
        </h1>

        <p class="subtitle">
            A crop window with touch and mouse gestures to zoom, pan and rotate an image or video.
        </p>
        <p>Media snaps back to cover the crop area.</p>
    </div>

    <div class="box">
        <p>
        Looking for contributions, code review and feedback! Feel free to open an issue on <a
            href="https://github.com/sabine/svelte-crop-window">the GitHub repository</a
        > or connect with me via the Svelte discord (sabine#8815).
    </p>
    <p>TODO: what does NOT work yet: Media does not "snap back" to cover the crop area on round crop with aspect != 1.</p>

    <p>
        The code of this page is <a
            href="https://github.com/sabine/svelte-crop-window/blob/main/src/routes/%2Bpage.svelte"
            >here</a
        >.
    </p>
    </div>

    <div class="box">
        <h2 id="with-controls"><a href="#with-controls">Example with controls</a></h2>

        <div style="height:20em; background: {background_color}">
            <CropWindow bind:this={crop_window_el} bind:value {media} {options} />
        </div>

        <h3>Aspect ratio</h3>
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

        <h3>Scale / Rotation / Position</h3>

        <div style="display:grid; grid-template-columns: auto 1fr;column-gap:2rem">
            <div>scale</div>
            <div>
                <input
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
                {Math.round(value.scale * 100) / 100}
            </div>
            <div>rotation</div>
            <div>
                <input
                    type="range"
                    min={-180}
                    max="180"
                    step={1}
                    on:input={(e) => crop_window_el.set_rotation(parseFloat(e.currentTarget.value))}
                    on:change={crop_window_el.commit}
                    value={value.rotation}
                />
                {Math.round(value.rotation * 100) / 100}
            </div>
            <div>x</div>
            <input
                type="number"
                step={0.01}
                on:input={() => crop_window_el.set_pan(position)}
                on:change={() => {
                    crop_window_el.commit();
                    position.x = value.position.x;
                }}
                bind:value={position.x}
            />

            <div>y</div>
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

        <h3>Colors</h3>
        <div
            style="display:grid; grid-template-columns: auto 1fr; column-gap:2rem; align-items:center;"
        >
            <div>overlay color</div>
            <input type="color" bind:value={options.overlay_options.overlay_color} />
            <div>line color</div>
            <input type="color" bind:value={options.overlay_options.line_color} />
            <div>background color</div>
            <input type="color" bind:value={background_color} />
        </div>
        <h3>Shape</h3>
        <div>
            <select bind:value={options.shape}>
                <option value="rect">"rect"</option>
                <option value="round">"round"</option>
            </select>
        </div>
    </div>
    <div class="box">
        <h2 id="minimal-code-example"><a href="#minimal-code-example">Minimal code example</a></h2>
        <div style="height:20em; background: #222">
            <CropWindow bind:value={value2} {media} options={defaultOptions} />
        </div>
        <div>
            <Highlight
                language={typescript}
                code={`// in script tag
import { CropWindow, defaultOptions, defaultValue } from 'svelte-crop-window';

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

    <div class="box">
        <h2 id="options"><a href="#options">Options</a></h2>

        <div style="max-width:100%; overflow-x:scroll">
            <div
                style="min-width:34em; display:grid; grid-template-columns: 8em 8em 1fr; grid-gap:1rem"
            >
                <div>name</div>
                <div>value</div>
                <div>purpose</div>
                <div><code>shape</code></div>
                <div><code>"rect" | "round"</code></div>
                <div>
                    Determines how the to-be-cropped media "snaps back" to cover the crop area
                </div>
                <div><code>crop_window_margin</code></div>
                <div>number of pixels</div>
                <div>
                    Margin of the crop window, in pixels. The crop window will always scale to the
                    maximum possible size in its containing element.
                </div>
                <div><code>overlay</code></div>
                <div>a Svelte component</div>
                <div>
                    The overlay component which visually highlights the crop area and, possibly,
                    some lines. You can pass your own Svelte component here, for a custom overlay.
                    Look at the <a
                        href="https://github.com/sabine/svelte-crop-window/blob/main/src/lib/overlay/Overlay.svelte"
                        >code of the included overlay</a
                    > to see how it works.
                </div>
                <div><code>overlay_options</code></div>
                <div>options for the overlay component</div>
                <div>
                    Needs to be whatever options your overlay component takes. The included overlay
                    allows you to set the color of the overlay and the color of the lines.
                </div>
            </div>
        </div>

        <h3 id="default-options"><a href="#default-options">Default options</a></h3>
        <Highlight
            language={typescript}
            code={`export const defaultOptions: Options<OverlayOptions> = {
    shape: 'rect',
    crop_window_margin: 10,

    overlay: Overlay,
    overlay_options: {
        line_color: '#FFFFFF',
        overlay_color: '#222222'
    },
};
`}
        />
    </div>

    <div class="box">
        <h2 id="how-to-crop"><a href="#how-to-crop">How to Crop</a></h2>

        <div
            style="position:relative;height:300px;width:{value.aspect *
                300}px; overflow:hidden; border-radius: {options.shape == 'round' ? '50%' : '0'}"
        >
            <video
                style={`transform: translateX(-50%) translateY(-50%) rotate(${
                    value.rotation || 0
                }deg);` +
                    `height: ${(value.scale || 0.0) * 300}px;` +
                    `margin-left: ${300 / 2 + (value.position.x || 0) * 300}px;` +
                    `margin-top: ${300 / value.aspect / 2 + (value.position.y || 0) * 300}px;
                    max-width:none;`}
                src={media.url}
                autoPlay
                loop
                muted={true}
            />
        </div>

        <h3>Display in HTML without actually cropping:</h3>

        <HighlightSvelte
            code={`<div style={\`position:relative; overflow:hidden;
        height:{HEIGHT}px; width:{value.aspect * HEIGHT}px;
        border-radius: { options.shape == 'round' ? '50%' : '0' }\`}>
    <video
        style={\`transform: translateX(-50%) translateY(-50%) rotate({value.rotation || 0}deg);
    height: {(value.scale || 0.0) * HEIGHT}px;
    margin-left: {HEIGHT / 2 + (value.position.x || 0) * HEIGHT}px;
    margin-top: {HEIGHT / value.aspect / 2 + (value.position.y || 0) * HEIGHT}px;
    max-width:none\`}
        src={url}
    />
</div>`}
        />

        <h3 id="pseudo-code"><a href="#pseudo-code">Pseudo code to crop</a></h3>

        <ol>
            <li>
                Choose a <code>target_height</code> and calculate the width for the cropped image:
                <Highlight
                    language={typescript}
                    code={`let target_width = target_height * value.aspect;`}
                />
            </li>
            <li>
                Calculate factor by which to scale:
                <Highlight
                    language={typescript}
                    code={`let s = value.scale * target_height / media.height;`}
                />
            </li>
            <li>
                Scale media by <code>s</code>:
                <Highlight language={typescript} code={`let resized_media = scale(media, s);`} />
            </li>
            <li>
                Rotate media by <code>value.rotation</code>:
                <Highlight
                    language={typescript}
                    code={`let resized_and_rotated_media =
    rotate(resized_media, value.rotation);`}
                />
            </li>
            <li>
                Calculate x,y position of area to extract: <Highlight
                    language={typescript}
                    code={`let left =
    (resized_and_rotated_media.width - target_width) / 2.0
    - value.x * target_height;
let top =
    (resized_and_rotated_media.height - target_height) / 2.0
    - value.y * target_height;`}
                />
            </li>
            <li>
                Extract area:
                <Highlight
                    language={typescript}
                    code={`let cropped_media =
    extract_area(resized_and_rotated_media, left, top,
                 target_width, target_height);`}
                />
            </li>
        </ol>
    </div>

    <div class="box">
        <h2 id="what-it-doesnt-do">
            <a href="#what-it-doesnt-do">What this component doesn't do</a>
        </h2>
        <ol>
            <li>
                Does not modify/crop the image, you have to do that by whatever means make sense for
                your application.
            </li>
            <li>
                Doesn't (yet) provide usable controls. Currently, you need to implement your own.
                Contributions are welcome.
            </li>
        </ol>
    </div>

    <div class="box">
        <small>
            <p>
                Video from shantararam at pixabay: <a
                    href="https://pixabay.com/videos/mountain-nature-snow-old-mountain-8837/"
                    >https://pixabay.com/videos/mountain-nature-snow-old-mountain-8837/</a
                >
            </p>
        </small>
    </div>
</div>

<style>
    .container {
        max-width: 50em;
        margin: 0 auto;
        padding: 4rem 1rem;
    }

    .box {
        padding: 1.5rem 0;
    }

    :global(pre), p {
        padding: 0.5rem 0;
    }
    ol {
        padding-left: 1.5rem;
    }
    li {
        margin: 1rem 0;
    }

    h1 {
        padding: 2rem 0;
    }

    h2 {
        margin-top: 1rem;
        font-size: 1.4rem;
        padding: 1rem 0;
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
