<script lang="ts">
    import type { CropShape, Point, Size } from './geometry';
    import GestureMediaView from './GestureMediaView.svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Media } from './types';

    export let media: Media;

    export let crop_shape: CropShape = 'rect';

    export let value: {
        position: Point;
        aspect: number;
        rotation: number;
        scale: number;
    } = {
        position: { x: 0, y: 0 },
        aspect: 1.0,
        rotation: 0,
        scale: 1.0
    };

    if (crop_shape == 'round' && value.aspect != 1) throw 'round crops must be circles!';

    export let crop_window_margin: number = 10;

    let outer_size: Size;
    let crop_window_size: Size;
    let center_point: Point;

    let dispatch = createEventDispatcher();

    function crop(e: CustomEvent<{ position: Point; rotation: number; scale: number }>) {
        //console.log("crop", e.detail);

        value.position = e.detail.position;
        value.scale = e.detail.scale;
        value.rotation = e.detail.rotation;

        dispatch('change');
    }

    function init() {
        gesture_el.apply(value);
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
                      height: outer_size.height - 2 * crop_window_margin,
                      width: (outer_size.height - 2 * crop_window_margin) * value.aspect
                  }
                : {
                      height: (outer_size.width - 2 * crop_window_margin) / value.aspect,
                      width: outer_size.width - 2 * crop_window_margin
                  };
    }

    let gesture_el: GestureMediaView;
    let outer_el: HTMLDivElement;
</script>

<svelte:window on:resize={compute_window_sizes} />

<div bind:this={outer_el} class="outer">
    {#if crop_window_size && outer_size && center_point}
        <GestureMediaView
            bind:this={gesture_el}
            {crop_shape}
            bind:aspect={value.aspect}
            bind:scale={value.scale}
            bind:rotation={value.rotation}
            bind:position={value.position}
            {media}
            bind:crop_window_size
            bind:outer_size
            bind:center_point
            on:crop={crop}
            on:init_existing_crop={init}
        />
    {/if}
</div>

<style>
    .outer {
        height: 100%;
        width: 100%;
    }
</style>
