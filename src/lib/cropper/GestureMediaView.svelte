<script lang="ts">
    import CropMediaView from './CropMediaView.svelte';
    import { onMount } from 'svelte';
    import { get_angle_between_points, sub_point, type Point, type Size } from './geometry';
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
    import type { CropShape, Media, Value } from './types';

    export let media: Media;

    export let value: Value;

    export let crop_shape: CropShape = 'rect';
    if (crop_shape == 'round' && value.aspect != 1) throw 'round crops must be circles!';

    let outer_el: HTMLDivElement;
    let crop_media_el: CropMediaView;

    export let center_point: Point;
    export let outer_size: Size;
    export let crop_window_size: Size;

    let gesture_in_progress: boolean = false;

    /* handle mouse gestures */

    let mouse_dragstart: Point | undefined;
    function mouse_dragmove(e: MouseDragMoveEvent) {
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

    /* handle touch gestures */

    let focal_point: Point | undefined = undefined;

    function touch_scale_pan_rotate_handler(e: TouchScalePanRotateEvent) {
        if (!focal_point) {
            focal_point = e.detail.focal_point;
        }

        gesture_in_progress = true;

        crop_media_el.zoom(e.detail.scale, focal_point);
        crop_media_el.rotate(focal_point, e.detail.rotation);
        crop_media_el.pan(e.detail.pan);
    }

    function number_of_touch_points_changed() {
        focal_point = undefined;
        crop_media_el.complete_manipulation(false);
    }

    function touchend_handler() {
        focal_point = undefined;
        complete_manipulation();
    }

    /* */

    function init() {
        crop_media_el.complete_manipulation();
    }

    let complete_manipulation: () => void;
    let end_gesture: () => void;

    onMount(() => {
        complete_manipulation = keep_delaying_while_triggered(() => {
            end_gesture();
            crop_media_el.complete_manipulation();
        }, 200);

        end_gesture = keep_delaying_while_triggered(() => {
            gesture_in_progress = false;
        }, 1600);
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
        bind:show_lines={gesture_in_progress}
        bind:crop_window_size
        bind:media
        bind:value
        {center_point}
        on:media_size={init}
        on:crop
    />
</div>

<style>
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
