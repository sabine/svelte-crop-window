<script lang="ts">
    import TransformMediaView from './TransformMediaView.svelte';
    import {
        rotate_point_around_center,
        add_point,
        type Size,
        sub_point,
        rotate_point,
        mul_point,
        get_center
    } from './geometry';
    import type { Point } from './geometry';
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import type { CropShape, Media } from './types';
    import { AnimatePosition } from './animate_position';

    export let crop_shape: CropShape = 'rect';

    export let media: Media;

    export let show_lines = false;

    export let outer_size: Size;
    export let crop_window_size: Size;

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
        animation.abort();
    }

    export function rotate(target: Point, degrees: number) {
        if (!image_points) throw 'image points not defined';
        //console.log("rotate", target, image_points.center, degrees);
        pending_rotation = pending_rotation + degrees;

        let t = rotate_point_around_center(target, image_points.center, pending_rotation);
        pending_rotate_offset = mul_point(sub_point(target, t), 1.0 / crop_window_size.width);
        animation.abort();
    }

    export function pan(vector: Point) {
        pending_pan = add_point(pending_pan, mul_point(vector, 1.0 / crop_window_size.width));
        animation.abort();
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

    export let center_point: Point;

    let image_top_left_rotated: Point;
    let top_left_croparea_rotated: Point;
    let top_right_croparea_rotated: Point;
    let bottom_left_croparea_rotated: Point;
    let bottom_right_croparea_rotated: Point;

    let animation = new AnimatePosition(
        (p, s) => {
            position = p;
            scale = s;
        },
        () => {
            complete_manipulation(false);
        }
    );

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
            top_left_croparea_rotated.x,
            top_right_croparea_rotated.x,
            bottom_left_croparea_rotated.x,
            bottom_right_croparea_rotated.x
        );
        let crop_area_min_x = Math.min(
            top_left_croparea_rotated.x,
            top_right_croparea_rotated.x,
            bottom_left_croparea_rotated.x,
            bottom_right_croparea_rotated.x
        );

        let crop_area_max_y = Math.max(
            top_left_croparea_rotated.y,
            top_right_croparea_rotated.y,
            bottom_left_croparea_rotated.y,
            bottom_right_croparea_rotated.y
        );
        let crop_area_min_y = Math.min(
            top_left_croparea_rotated.y,
            top_right_croparea_rotated.y,
            bottom_left_croparea_rotated.y,
            bottom_right_croparea_rotated.y
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

        animation.start(
            position,
            add_point(position, offset),
            scale,
            required_scale > 1 ? scale * required_scale : scale
        );

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
        <div class="box" />

        {#if show_lines}
            <div class="vertical-lines" in:fade={{ duration: 100 }} out:fade={{ duration: 1000 }} />
            <div
                class="horizontal-lines"
                in:fade={{ duration: 100 }}
                out:fade={{ duration: 1000 }}
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

    .horizontal-lines {
        border-top: 1px solid var(--outline-color);
        border-bottom: 1px solid var(--outline-color);
        position: absolute;
        height: calc(var(--crop-window-height) / 3);
        width: var(--crop-window-width);
        left: calc((var(--outer-width) - var(--crop-window-width)) / 2);
        top: calc(
            (var(--outer-height) - var(--crop-window-height)) / 2 + var(--crop-window-height) / 3
        );
    }

    .vertical-lines {
        border-left: 1px solid var(--outline-color);
        border-right: 1px solid var(--outline-color);
        position: absolute;
        height: var(--crop-window-height);
        width: calc(var(--crop-window-width) / 3);
        left: calc(
            (var(--outer-width) - var(--crop-window-width)) / 2 + var(--crop-window-width) / 3
        );
        top: calc((var(--outer-height) - var(--crop-window-height)) / 2);
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
