<script lang="ts">
    import TransformMediaView from './TransformMediaView.svelte';
    import {
        rotate_point_around_center,
        add_point,
        type CropShape,
        type Size,
        sub_point,
        rotate_point,
        mul_point,
        get_center
    } from './geometry';
    import type { Point } from './geometry';
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import type { Media } from './types';

    export let crop_shape: CropShape = 'rect';

    export let media: Media;

    export let show_bars = false;

    export let outer_size: Size = {
        width: 1,
        height: 1
    };
    export let crop_window_size: Size = {
        width: 1,
        height: 1
    };

    let dispatch = createEventDispatcher();

    export function zoom(zoom: number, zoom_target: Point) {
        let t = sub_point(
            zoom_target,
            add_point(
                center_point,
                position,
                pending_pan,
                pending_rotate_offset,
                pending_scale_offset
            )
        );
        let new_scale = zoom * pending_scale;

        let offset = {
            x: (-t.x * (new_scale - pending_scale)) / pending_scale / crop_window_size.width,
            y: (-t.y * (new_scale - pending_scale)) / pending_scale / crop_window_size.width
        };

        pending_scale_offset = add_point(pending_scale_offset, offset);
        pending_scale = new_scale;
        abort_animation();
    }

    export function rotate(target: Point, degrees: number) {
        if (!image_points) throw 'image points not defined';
        //console.log("rotate", target, image_points.center, degrees);
        pending_rotation = pending_rotation + degrees;

        let t = rotate_point_around_center(target, image_points.center, pending_rotation);
        pending_rotate_offset = mul_point(sub_point(target, t), 1.0 / crop_window_size.width);
        abort_animation();
    }

    export function pan(vector: Point) {
        pending_pan = add_point(pending_pan, mul_point(vector, 1.0 / crop_window_size.width));
        abort_animation();
    }

    export function complete_manipulation(snap_back?: boolean) {
        rotation = rotation + pending_rotation;
        pending_rotation = 0;

        scale = scale * pending_scale;
        pending_scale = 1;

        position = add_point(position, pending_pan, pending_rotate_offset, pending_scale_offset);
        pending_pan = { x: 0, y: 0 };
        pending_rotate_offset = { x: 0, y: 0 };
        pending_scale_offset = { x: 0, y: 0 };

        calculate_image_points();

        if (snap_back || snap_back === undefined) {
            make_image_cover_crop_area();
        } else {
            dispatch('crop', { rotation, scale, position });
        }
    }

    function calculate_image_points() {
        if (media_size != null) {
            let height = crop_window_size.width * scale;
            let width = crop_window_size.width * media_size.aspect * scale;

            let offset = mul_point(position, crop_window_size.width);

            let top_left = add_point(
                rotate_point(
                    {
                        x: -width / 2,
                        y: -height / 2
                    },
                    rotation
                ),
                offset
            );

            let top_right = add_point(
                rotate_point(
                    {
                        x: width / 2,
                        y: -height / 2
                    },

                    rotation
                ),
                offset
            );

            let bottom_right = add_point(
                rotate_point(
                    {
                        x: width / 2,
                        y: height / 2
                    },

                    rotation
                ),
                offset
            );

            let bottom_left = add_point(
                rotate_point(
                    {
                        x: -width / 2,
                        y: height / 2
                    },

                    rotation
                ),
                offset
            );

            image_points = {
                top_left: add_point(top_left, center_point),
                top_right: add_point(top_right, center_point),
                bottom_right: add_point(bottom_right, center_point),
                bottom_left: add_point(bottom_left, center_point),
                center: add_point(get_center(top_left, bottom_right), center_point)
            };

            //console.log("image_points", image_points);
            dispatch('image_points');
        }
    }

    export function init() {
        //console.log("TransformMediaView init");
        calculate_image_points();
    }

    function set_media_size(e: CustomEvent<Size>) {
        media_size = { ...e.detail, aspect: e.detail.width / e.detail.height };
    }

    export function set(p: Point, r: number, s: number) {
        position = p;
        rotation = r;
        scale = s;
    }

    let media_size: {
        width: number;
        height: number;
        aspect: number;
    };
    export let image_points:
        | {
              top_left: Point;
              top_right: Point;
              bottom_right: Point;
              bottom_left: Point;
              center: Point;
          }
        | undefined = undefined;

    export let position: Point;
    let pending_pan: Point = {
        x: 0,
        y: 0
    };
    let pending_scale_offset: Point = {
        x: 0,
        y: 0
    };
    let pending_rotate_offset: Point = {
        x: 0,
        y: 0
    };
    export let rotation: number;
    let pending_rotation: number = 0;
    export let scale: number;
    let pending_scale: number = 1;

    function easeInOutCubic(x: number): number {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    let animation: {
        start: DOMHighResTimeStamp | null;
        start_position: Point | undefined;
        end_position: Point | undefined;
        start_scale: number;
        end_scale: number;
    } = {
        start: null,
        start_position: undefined,
        end_position: undefined,
        start_scale: 1,
        end_scale: 1
    };
    let rafTimeout: number | null = null;
    function animate() {
        //console.log("animate", animation);
        if (rafTimeout) window.cancelAnimationFrame(rafTimeout);
        rafTimeout = window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
            if (!animation.start) animation.start = timestamp;

            const elapsed = Math.min((timestamp - animation.start) / 400, 1.0);
            let z = easeInOutCubic(elapsed);

            if (!animation.start_position || !animation.end_position)
                throw 'animation lacks start or end position';

            position = {
                x: animation.start_position.x * (1 - z) + z * animation.end_position.x,
                y: animation.start_position.y * (1 - z) + z * animation.end_position.y
            };
            scale = animation.start_scale * (1 - z) + z * animation.end_scale;

            if (elapsed < 1.0) {
                animate();
            } else {
                complete_manipulation(false);
                if (rafTimeout) window.cancelAnimationFrame(rafTimeout);
            }
        });
    }
    function abort_animation() {
        if (rafTimeout) window.cancelAnimationFrame(rafTimeout);

        animation = {
            start: null,
            start_position: undefined,
            end_position: undefined,
            start_scale: 1,
            end_scale: 1
        };
    }

    export let center_point: Point;

    let image_top_left_rotated: Point;
    let top_left_croparea_rotated: Point;
    let top_right_croparea_rotated: Point;
    let bottom_left_croparea_rotated: Point;
    let bottom_right_croparea_rotated: Point;

    function make_image_cover_crop_area() {
        if (!media_size) return;
        if (!image_points) return;
        if (!outer_size) return;
        if (!crop_window_size) return;

        image_top_left_rotated = rotate_point_around_center(
            image_points.top_left,
            center_point,
            -rotation
        );

        let size = {
            height: crop_window_size.width * scale,
            width: crop_window_size.width * media_size.aspect * scale
        };

        if (crop_shape == 'rect') {
            let left_croparea = (outer_size.width - crop_window_size.width) / 2;
            let right_croparea =
                (outer_size.width - crop_window_size.width) / 2 + crop_window_size.width;
            let top_croparea = (outer_size.height - crop_window_size.height) / 2;
            let bottom_croparea =
                (outer_size.height - crop_window_size.height) / 2 + crop_window_size.height;

            top_left_croparea_rotated = rotate_point_around_center(
                {
                    x: left_croparea,
                    y: top_croparea
                },
                center_point,
                -rotation
            );
            top_right_croparea_rotated = rotate_point_around_center(
                {
                    x: right_croparea,
                    y: top_croparea
                },
                center_point,
                -rotation
            );
            bottom_left_croparea_rotated = rotate_point_around_center(
                {
                    x: left_croparea,
                    y: bottom_croparea
                },
                center_point,
                -rotation
            );
            bottom_right_croparea_rotated = rotate_point_around_center(
                {
                    x: right_croparea,
                    y: bottom_croparea
                },
                center_point,
                -rotation
            );
        } else {
            top_left_croparea_rotated = sub_point(center_point, {
                x: 0,
                y: +crop_window_size.height / 2
            });
            top_right_croparea_rotated = sub_point(center_point, {
                x: 0,
                y: -crop_window_size.height / 2
            });
            bottom_right_croparea_rotated = sub_point(center_point, {
                x: +crop_window_size.width / 2,
                y: 0
            });
            bottom_left_croparea_rotated = sub_point(center_point, {
                x: -crop_window_size.width / 2,
                y: 0
            });
        }

        let crop_area_max_x = Math.max(
            Math.max(top_left_croparea_rotated.x, top_right_croparea_rotated.x),
            Math.max(bottom_left_croparea_rotated.x, bottom_right_croparea_rotated.x)
        );
        let crop_area_min_x = Math.min(
            Math.min(top_left_croparea_rotated.x, top_right_croparea_rotated.x),
            Math.min(bottom_left_croparea_rotated.x, bottom_right_croparea_rotated.x)
        );

        let crop_area_max_y = Math.max(
            Math.max(top_left_croparea_rotated.y, top_right_croparea_rotated.y),
            Math.max(bottom_left_croparea_rotated.y, bottom_right_croparea_rotated.y)
        );
        let crop_area_min_y = Math.min(
            Math.min(top_left_croparea_rotated.y, top_right_croparea_rotated.y),
            Math.min(bottom_left_croparea_rotated.y, bottom_right_croparea_rotated.y)
        );

        let crop_area_width = crop_area_max_x - crop_area_min_x;
        let crop_area_height = crop_area_max_y - crop_area_min_y;

        let required_scale = Math.max(crop_area_height / size.height, crop_area_width / size.width);

        if (
            crop_area_min_x >= image_top_left_rotated.x &&
            crop_area_max_x <= image_top_left_rotated.x + size.width &&
            crop_area_min_y >= image_top_left_rotated.y &&
            crop_area_max_y <= image_top_left_rotated.y + size.height
        ) {
            dispatch('crop', { rotation, scale, position });
            return;
        }

        if (required_scale > 1) {
            image_top_left_rotated = sub_point(image_top_left_rotated, {
                x: ((required_scale - 1.0) * size.width) / 2,
                y: ((required_scale - 1.0) * size.height) / 2
            });
            size.width *= required_scale;
            size.height *= required_scale;
        }

        let correction = {
            x:
                Math.min(crop_area_min_x - image_top_left_rotated.x, 0) -
                Math.min(image_top_left_rotated.x + size.width + -crop_area_max_x, 0),

            y:
                Math.min(crop_area_min_y - image_top_left_rotated.y, 0) -
                Math.min(image_top_left_rotated.y + size.height - crop_area_max_y, 0)
        };

        //console.log("correction");
        let offset = mul_point(rotate_point(correction, rotation), 1 / crop_window_size.width);
        //console.log("pan offset", offset);

        animation.start = null;
        animation.start_position = position;
        animation.end_position = add_point(position, offset);
        animation.start_scale = scale;
        if (required_scale > 1) {
            animation.end_scale = scale * required_scale;
        } else {
            animation.end_scale = scale;
        }
        animate();

        calculate_image_points();
    }
</script>

{#if crop_window_size && outer_size}
    <TransformMediaView
        {media}
        height={scale * pending_scale * crop_window_size.width}
        position={add_point(
            center_point,
            mul_point(
                add_point(position, pending_pan, pending_rotate_offset, pending_scale_offset),
                crop_window_size.width
            )
        )}
        rotation={rotation + pending_rotation}
        on:media_size={set_media_size}
    />
    <div class="inner">
        <div class="crop-window" class:round={crop_shape == 'round'} />
        <!-- box -->
        <div class="box" />

        {#if show_bars}
            <!-- bars -->
            <div
                in:fade={{ duration: 100 }}
                out:fade={{ duration: 1000 }}
                style={`border-left: 1px solid var(--outline-color);border-right: 1px solid var(--outline-color);
position:absolute;
height: var(--crop-window-height);
width: calc(var(--crop-window-width) / 3);
left: calc((var(--outer-width) - var(--crop-window-width)) / 2 + var(--crop-window-width) / 3);
top: calc((var(--outer-height) - var(--crop-window-height)) / 2);`}
            />
            <div
                in:fade={{ duration: 100 }}
                out:fade={{ duration: 1000 }}
                style={`border-top: 1px solid var(--outline-color);border-bottom: 1px solid var(--outline-color);
position:absolute;
height: calc(var(--crop-window-height) / 3);
width: var(--crop-window-width);
left: calc((var(--outer-width) - var(--crop-window-width)) / 2);
top: calc((var(--outer-height) - var(--crop-window-height)) / 2 + var(--crop-window-height) / 3);`}
            />
        {/if}
    </div>
    <!-- 
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
{/if}
{#if image_top_left_rotated}
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
-->
{/if}

<style>
    .inner {
        overflow: hidden;
        position: absolute;
        margin: auto;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .round {
        border-radius: 50%;
    }

    .crop-window,
    .box {
        position: absolute;
        height: var(--crop-window-height);
        width: var(--crop-window-width);
        left: calc((var(--outer-width) - var(--crop-window-width)) / 2);
        top: calc((var(--outer-height) - var(--crop-window-height)) / 2);
    }

    .crop-window {
        box-shadow: 0 0 0 9999em;
        color: var(--overlay-color);
    }

    .box {
        border: 1px solid var(--outline-color);
        box-sizing: border-box;
    }

    /*
    .p {
        background-color: red;
        width: 5px;
        height: 5px;
        box-sizing: border-box;
    }
*/
</style>
