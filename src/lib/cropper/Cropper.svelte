<script lang="ts">
    import type { Point, Size } from './geometry';
    import GestureMediaView from './GestureMediaView.svelte';
    import { onMount } from 'svelte';
    import { type Value, type Media, type Options, defaultOptions } from './types';

    export let media: Media;

    export let options: Options = defaultOptions;

    export let value: Value = {
        position: { x: 0, y: 0 },
        aspect: 1.0,
        rotation: 0,
        scale: 1.0
    };

    if (options.shape == 'round' && value.aspect != 1) throw 'round crops must be circles!';

    export let crop_window_margin: number = 10;

    let outer_size: Size;
    let crop_window_size: Size;
    let center_point: Point;

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
                      height: outer_size.height - 2 * crop_window_margin,
                      width: (outer_size.height - 2 * crop_window_margin) * value.aspect
                  }
                : {
                      height: (outer_size.width - 2 * crop_window_margin) / value.aspect,
                      width: outer_size.width - 2 * crop_window_margin
                  };
    }

    let outer_el: HTMLDivElement;
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
            {options}
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
