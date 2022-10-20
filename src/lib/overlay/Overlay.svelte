<script lang="ts">
    /* You can write your own custom overlay by using this one as a template. */
    import { fade } from 'svelte/transition';
    import type { OverlayOptions } from './overlay';

    export let shape: 'round' | 'rect';
    export let options: OverlayOptions;
    export let gesture_in_progress: boolean; // controlled by CropMediaView
</script>

<div
    class="crop-window"
    class:round={shape == 'round'}
    style={`--outline-color:${options.line_color};
--overlay-color:${options.overlay_color};`}
>
    {#if gesture_in_progress && options.show_third_lines}
        <div class="lines-wrapper" class:round={shape == 'round'}>
            <div class="vertical-lines" in:fade={{ duration: 100 }} out:fade={{ duration: 1000 }} />
        </div>
        <div class="lines-wrapper" class:round={shape == 'round'}>
            <div
                class="horizontal-lines"
                in:fade={{ duration: 100 }}
                out:fade={{ duration: 1000 }}
            />
        </div>
    {/if}

    <div class:round={shape == 'round'} class="outline" />
</div>

<style>
    .round {
        border-radius: 50%;
    }

    .crop-window {
        position: absolute;
        height: var(--crop-window-height);
        width: var(--crop-window-width);
        left: calc((var(--outer-width) - var(--crop-window-width)) / 2);
        top: calc((var(--outer-height) - var(--crop-window-height)) / 2);
        box-shadow: 0 0 0 9999em;
        color: var(--overlay-color);
    }

    .outline {
        position: absolute;
        height: var(--crop-window-height);
        width: var(--crop-window-width);
        left: 0;
        top: 0;
        box-sizing: border-box;
        border: 2px solid var(--outline-color);
    }

    .lines-wrapper {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        height: calc(100% - 3px);
        width: calc(100% - 3px);
        overflow: hidden;
        top: 2px;
        left: 2px;
    }

    .horizontal-lines {
        border-top: 1px solid var(--outline-color);
        border-bottom: 1px solid var(--outline-color);
        box-sizing: border-box;
        height: 33%;
        width: 100%;
    }

    .vertical-lines {
        border-left: 1px solid var(--outline-color);
        border-right: 1px solid var(--outline-color);
        height: 100%;
        width: 33%;
    }
</style>
