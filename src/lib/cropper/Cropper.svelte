<script lang="ts">
    import type {
        CropShape,
        Point,
        Size,
    } from "./geometry";
    import GestureMediaView from "./GestureMediaView.svelte";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import { browser } from "$app/environment";

    export let crop_shape: CropShape = "rect";
    export let aspect: number = 1;

    if (crop_shape == "round" && aspect != 1)
        throw "round crops must be circles!";

    export let media: {
        content_type: "image" | "video";
        url: string;
    };

    export let value: {
        position: Point;
        aspect: number;
        rotation: number;
        scale: number;
    } = {
        position: { x: 0, y: 0 },
        aspect,
        rotation: 0,
        scale: 0.0,
    };

    const crop_window_margin: number = 10;
    let outer_size: Size;
    let crop_window_size: Size;
    let center_point: Point;

    let dispatch = createEventDispatcher();

    function crop(
        e: CustomEvent<{ position: Point; rotation: number; scale: number }>
    ) {
        //console.log("crop", e.detail);

        value.position = e.detail.position;
        value.aspect = aspect;
        value.scale = e.detail.scale;
        value.rotation = e.detail.rotation;

        dispatch("change");
    }

    function init() {
        gesture_el.apply(value);
    }

    onMount(() => {
        compute_window_sizes();
        if (browser) {
            window.addEventListener("resize", compute_window_sizes);
        }
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener("resize", compute_window_sizes);
        }
    });

    function compute_window_sizes() {
        let rect = outer_el.getBoundingClientRect();
        outer_size = {
            width: rect.width,
            height: rect.height,
        };

        center_point = { x: rect.width / 2, y: rect.height / 2 };

        crop_window_size =
            outer_size.width / outer_size.height > aspect
                ? {
                      height: outer_size.height - 2 * crop_window_margin,
                      width:
                          (outer_size.height - 2 * crop_window_margin) * aspect,
                  }
                : {
                      height:
                          (outer_size.width - 2 * crop_window_margin) / aspect,
                      width: outer_size.width - 2 * crop_window_margin,
                  };
    }

    let gesture_el: GestureMediaView;
    let outer_el: HTMLDivElement;
</script>

<div bind:this="{outer_el}" class="outer">
    {#if crop_window_size && outer_size && center_point}
        <GestureMediaView
            bind:this="{gesture_el}"
            crop_shape="{crop_shape}"
            bind:aspect
            bind:scale="{value.scale}"
            bind:rotation="{value.rotation}"
            bind:position="{value.position}"
            media="{media}"
            bind:crop_window_size
            bind:outer_size
            bind:center_point
            on:crop="{crop}"
            on:init_existing_crop="{init}"
        />
    {/if}
</div>

<style>
    .outer {
        height: 100%;
        width: 100%;
    }
</style>
