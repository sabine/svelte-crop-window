<script lang="ts">
    /* This component is responsible for handling all touch gestures
       and mouse gestures on the crop window.
       */
    import CropMediaView from './CropMediaView.svelte';
    import { onMount } from 'svelte';
    import {
        get_angle_between_points,
        mul_point,
        sub_point,
        type Point,
        type Size
    } from './geometry';
    import { keep_delaying_while_triggered } from '../utils/throttle';
    import {
        touch_scale_pan_rotate,
        type TouchScalePanRotateEvent
    } from '../gestures/touch_scale_pan_rotate';
    import {
        pos_from_mouse_or_touch_event,
        mouse_draggable,
        type MouseDragMoveEvent
    } from '../gestures/mouse_events';
    import type { Media, CropValue, OverlayComponent, CropShape } from '../types';

    export let media: Media;
    export let value: CropValue;

    type OverlayOptions = $$Generic;
    export let shape: CropShape;
    export let overlay: OverlayComponent<OverlayOptions>;
    export let overlay_options: OverlayOptions;

    let outer_el: HTMLDivElement;
    let crop_media_el: CropMediaView;

    export let center_point: Point;
    export let outer_size: Size;
    export let crop_window_size: Size;

    let gesture_in_progress: boolean = false;

    export function commit() {
        crop_media_el.commit();
    }

    export function set_zoom(zoom: number) {
        crop_media_el.set_zoom(zoom, center_point);
    }

    export function set_rotation(degrees: number) {
        crop_media_el.set_rotation(center_point, degrees);
    }

    export function set_pan(vector: Point) {
        crop_media_el.set_pan(vector);
    }

    /* handle mouse gestures */

    let mouse_dragstart: Point | undefined;
    function mouse_dragmove(e: MouseDragMoveEvent) {
        if (e.detail.mouse_button == 0) {
            let mouse_pan = {
                x: e.detail.dx || 0,
                y: e.detail.dy || 0
            };

            crop_media_el.pan(mul_point(mouse_pan, 1.0 / crop_window_size.height));
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
        finish_gesture();
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
        finish_gesture();
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
        crop_media_el.pan(mul_point(e.detail.pan, 1.0 / crop_window_size.height));
    }

    function number_of_touch_points_changed() {
        focal_point = undefined;
        crop_media_el.commit();
    }

    function touchend_handler() {
        focal_point = undefined;
        finish_gesture();
    }

    /* */

    let finish_gesture: () => void;
    let end_gesture: () => void;

    onMount(() => {
        finish_gesture = keep_delaying_while_triggered(() => {
            end_gesture();
            crop_media_el.commit();
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
        {shape}
        bind:crop_window_size
        bind:media
        bind:value
        {center_point}
    />
    <div class="inner">
        <svelte:component this={overlay} options={overlay_options} {gesture_in_progress} {shape} />
    </div>
</div>

<style>
    .outer {
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: relative;
        cursor: crosshair;
    }

    .inner {
        overflow: hidden;
        position: absolute;
        margin: auto;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
</style>
