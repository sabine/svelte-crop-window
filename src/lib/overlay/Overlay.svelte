<script lang="ts" context="module">
    export type OverlayOptions = {
        line_color: string;
        overlay_color: string;
        show_third_lines: boolean;
    };

    export const defaultOverlayOptions: OverlayOptions = {
        line_color: 'rgb(167, 167, 167)',
        overlay_color: 'rgb(11, 11, 11)',
        show_third_lines: true
    };
</script>

<script lang="ts">
    /* You can write your own custom overlay by using this one as a template. */
    import { fade } from 'svelte/transition';

    export let shape: 'round' | 'rect';
    export let options: OverlayOptions;
    export let show_lines: boolean; // controlled by CropMediaView
</script>

<div
    class="crop-window"
    class:round={shape == 'round'}
    style={`--outline-color:${options.line_color};
--overlay-color:${options.overlay_color};`}
>
    {#if show_lines && options.show_third_lines}
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
        opacity: 0.7;
    }

    .outline {
        position: absolute;
        height: var(--crop-window-height);
        width: var(--crop-window-width);
        left: 0;
        top: 0;
        box-sizing: border-box;
        border: 2px solid var(--outline-color);
        opacity: 0.5;
    }

    .lines-wrapper {
        position: absolute;
        display:flex;
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
        opacity: 0.5;
    }

    .vertical-lines {
        border-left: 1px solid var(--outline-color);
        border-right: 1px solid var(--outline-color);
        height: 100%;
        width: 33%;
        opacity: 0.5;
    }
</style>
