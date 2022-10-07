<script lang="ts">
    import CropMediaView from './CropMediaView.svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import {
        get_angle_between_points,
        sub_point,
        type Point,
        type Size
    } from './geometry';
    import { browser } from '$app/environment';
    import { keep_delaying_while_triggered } from './throttle';
    import {
        touch_scale_pan_rotate,
        type TouchScalePanRotateEvent
    } from './touch_scale_pan_rotate';
    import {
        pos_from_mouse_or_touch_event,
        mouse_draggable,
        type MouseDragMoveEvent
    } from './mouse_events';
    import type { CropShape, Media } from './types';

    export let media: Media;

    export let aspect: number = 1;
    export let scale: number;
    export let rotation: number;
    export let position: Point;

    export let crop_shape: CropShape = 'rect';
    if (crop_shape == 'round' && aspect != 1) throw 'round crops must be circles!';

    let gesture_in_progress: boolean = false;

    let outer_el: HTMLDivElement;
    let crop_media_el: CropMediaView;

    export let center_point = { x: 1, y: 1 };

    export let outer_size: Size = {
        width: 1,
        height: 1
    };
    export let crop_window_size: Size = {
        width: 1,
        height: 1
    };

    let mouse_dragstart: Point | undefined;
    function mouse_dragmove(e: MouseDragMoveEvent) {
        //console.log("mouse_dragmove", e.detail, position);
        if (e.detail.mouse_button == 0) {
            let mouse_pan = {
                x: e.detail.dx || 0,
                y: e.detail.dy || 0
            };

            crop_media_el.pan(mouse_pan);
        } else {
            let rect = outer_el.getBoundingClientRect();

            const p = sub_point(e.detail, rect);

            let mouse_rotate = mouse_dragstart
                ? get_angle_between_points(p, center_point) -
                  get_angle_between_points(mouse_dragstart, center_point)
                : 0;

            mouse_dragstart = p;

            crop_media_el.rotate(center_point, mouse_rotate);
        }
        gesture_in_progress = true;
    }

    function mouse_dragend() {
        mouse_dragstart = undefined;
        complete_manipulation();
    }

    function on_wheel(e: WheelEvent) {
        const scale_speed = 1;

        e.preventDefault();
        var direction = e.detail < 0 || e.deltaY > 0 ? 1 : -1;
        const zoom_step = 1 + scale_speed / 10;
        const zoom = direction === 1 ? zoom_step : 1 / zoom_step;

        let rect = outer_el.getBoundingClientRect();

        const zoom_point = sub_point(pos_from_mouse_or_touch_event(e), rect);

        gesture_in_progress = true;

        crop_media_el.zoom(zoom, zoom_point);
        complete_manipulation();
    }

    let focal_point: Point | undefined = undefined;
    function touch_scale_pan_rotate_handler(e: TouchScalePanRotateEvent) {
        //console.log("touch_scale_pan_rotate", e.detail);

        if (!focal_point) {
            focal_point = e.detail.focal_point;
        }

        gesture_in_progress = true;

        crop_media_el.zoom(e.detail.scale, focal_point);
        crop_media_el.rotate(focal_point, e.detail.rotation);
        crop_media_el.pan(e.detail.pan);
    }
    function number_of_touch_points_changed() {
        //console.log("number_of_touch_points_changed");
        focal_point = undefined;
        crop_media_el.complete_manipulation(false);
    }
    function touchend_handler() {
        focal_point = undefined;
        complete_manipulation();
    }

    let dispatch = createEventDispatcher();

    function init() {
        crop_media_el.init();
        dispatch('init_existing_crop');
        crop_media_el.complete_manipulation();
    }

    let complete_manipulation: () => void;
    let end_gesture: () => void;

    onMount(() => {
        if (browser) {
            complete_manipulation = keep_delaying_while_triggered(() => {
                end_gesture();
                crop_media_el.complete_manipulation();
            }, 200);

            end_gesture = keep_delaying_while_triggered(() => {
                gesture_in_progress = false;
            }, 1600);
        }
    });

    // prevent Safari on iOS >= 10 to zoom the page
    function prevent_safari_zoom(e: Event) {
        e.preventDefault();
    }
</script>

<div
    bind:this={outer_el}
    class="outer"
    on:gesturestart={prevent_safari_zoom}
    on:gesturechange={prevent_safari_zoom}
    use:mouse_draggable
    on:wheel|nonpassive={on_wheel}
    on:mouse_draggable_move={mouse_dragmove}
    on:mouse_draggable_end={mouse_dragend}
    use:touch_scale_pan_rotate
    on:touch_scale_pan_rotate={touch_scale_pan_rotate_handler}
    on:number_of_touch_points_changed={number_of_touch_points_changed}
    on:touchend_scale_pan_rotate={touchend_handler}
>
    <CropMediaView
        bind:this={crop_media_el}
        bind:outer_size
        {crop_shape}
        bind:show_bars={gesture_in_progress}
        bind:crop_window_size
        bind:media
        bind:scale
        bind:rotation
        bind:position
        {center_point}
        on:media_size={init}
        on:crop
    />
    <!-- {#if image_top_left_rotated}
        <div
            style="position:absolute;left:{image_top_left_rotated.x -
                2}px;top: {image_top_left_rotated.y -
                2}px; width: 5px; height:5px; background:lime"
        />
        <div
            style="position:absolute;left:{image_top_left_rotated.x -
                2}px;top: {image_top_left_rotated.y +
                media_size.height * scale -
                2}px; width: 5px; height:5px; background:lime"
        />
    {/if}
    {#if top_left_croparea_rotated}
        <div
            style="position:absolute;left:{top_left_croparea_rotated.x -
                2}px;top: {top_left_croparea_rotated.y -
                2}px; width: 5px; height:5px; background:lime"
        />
    {/if}
    {#if top_right_croparea_rotated}
        <div
            style="position:absolute;left:{top_right_croparea_rotated.x -
                2}px;top: {top_right_croparea_rotated.y -
                2}px; width: 5px; height:5px; background:lime"
        />
    {/if}
    {#if bottom_right_croparea_rotated}
        <div
            style="position:absolute;left:{bottom_right_croparea_rotated.x -
                2}px;top: {bottom_right_croparea_rotated.y -
                2}px; width: 5px; height:5px; background:lime"
        />
    {/if}
    {#if bottom_left_croparea_rotated}
        <div
            style="position:absolute;left:{bottom_left_croparea_rotated.x -
                2}px;top: {bottom_left_croparea_rotated.y -
                2}px; width: 5px; height:5px; background:lime"
        />
    {/if}
    {#if image_points}
        <div
            class="p"
            style="position:absolute;left:{image_points.top_left.x -
                2}px;top: {image_points.top_left.y - 2}px"
        />
        <div
            class="p"
            style="position:absolute;left:{image_points.top_right.x -
                2}px;top: {image_points.top_right.y - 2}px"
        />
        <div
            class="p"
            style="position:absolute;left:{image_points.bottom_right.x -
                2}px;top: {image_points.bottom_right.y - 2}px"
        />
        <div
            class="p"
            style="position:absolute;left:{image_points.bottom_left.x -
                2}px;top: {image_points.bottom_left.y - 2}px"
        />

        <div
            class="p"
            style="position:absolute;left:{image_points.center.x -
                2}px;top: {image_points.center.y - 2}px"
        />
    {/if} -->
</div>

<!-- <div
    use:mouse_draggable
    on:dragend={dragend_rotate}
    on:dragmove={dragmove_rotate}
>
    ROTATE
</div>
position: {JSON.stringify(position)}<br>
rotation: {rotation}<br>
scale: {scale} -->
<style>
    /*
    .p {
        background-color: red;
        width: 5px;
        height: 5px;
        box-sizing: border-box;
    }*/

    .outer {
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: relative;
        background: transparent;
        --outline-color: rgba(255, 255, 255, 0.5);
        --overlay-color: rgba(0, 0, 0, 0.5);
        cursor: crosshair;
    }
</style>
