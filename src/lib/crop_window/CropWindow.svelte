<script lang="ts">
    import type { Point, Size } from './geometry';
    import GestureMediaView from './GestureMediaView.svelte';
    import { onMount } from 'svelte';
    import { defaultOptions, defaultValue, type CropValue, type Media } from '../types';

    export let media: Media;
    export let value: CropValue = defaultValue;

    type OverlayOptions = $$Generic;

    //@ts-ignore
    export let options: Options<OverlayOptions> = defaultOptions;

    let outer_size: Size;
    let crop_window_size: Size;
    let center_point: Point;

    export function commit() {
        gesture_el.commit();
    }

    export function set_zoom(zoom: number) {
        gesture_el.set_zoom(zoom);
    }

    export function set_rotation(degrees: number) {
        gesture_el.set_rotation(degrees);
    }

    export function set_pan(vector: Point) {
        gesture_el.set_pan(vector);
    }

    onMount(() => {
        compute_window_sizes();
    });

    function compute_window_sizes() {
        let rect = outer_el.getBoundingClientRect();
        outer_size = {
            width: rect.width,
            height: rect.height
        };

        center_point = { x: rect.width / 2, y: rect.height / 2 };

        crop_window_size =
            outer_size.width / outer_size.height > value.aspect
                ? {
                      height: outer_size.height - 2 * options.crop_window_margin,
                      width: (outer_size.height - 2 * options.crop_window_margin) * value.aspect
                  }
                : {
                      height: (outer_size.width - 2 * options.crop_window_margin) / value.aspect,
                      width: outer_size.width - 2 * options.crop_window_margin
                  };
    }

    let outer_el: HTMLDivElement;
    let gesture_el: GestureMediaView<OverlayOptions>;

    $: {
        if (outer_el && value.aspect) compute_window_sizes();
    }
</script>

<svelte:window on:resize={compute_window_sizes} />

<div
    bind:this={outer_el}
    class="outer"
    style={`--crop-window-height:${crop_window_size?.height || 0}px;
--crop-window-width:${crop_window_size?.width || 0}px;
--outer-height:${outer_size?.height || 0}px;
--outer-width:${outer_size?.width || 0}px;`}
>
    {#if crop_window_size && outer_size && center_point}
        <GestureMediaView
            bind:this={gesture_el}
            shape={options.shape}
            overlay={options.overlay}
            overlay_options={options.overlay_options}
            bind:value
            {media}
            {crop_window_size}
            {outer_size}
            {center_point}
        />
    {/if}
</div>

<style>
    .outer {
        height: 100%;
        width: 100%;
    }
</style>
