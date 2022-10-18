<script lang="ts">
    /* This component implements the transformations and animations
       to zoom, rotate and pan.
       */
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
    import type { Media, CropValue, CropShape } from '../types';
    import { AnimatePosition } from './animate_position';

    export let media: Media;

    export let shape: CropShape;

    export let outer_size: Size;
    export let crop_window_size: Size;

    export function set_zoom(scale: number, zoom_target: Point) {
        // MAYBE: zoom(scale/value.scale, zoom_target);
        let t = sub_point(
            zoom_target,
            add_point(
                center_point,
                mul_point(
                    add_point(
                        value.position,
                        pending_pan,
                        pending_rotate_offset,
                        pending_scale_offset
                    ),
                    crop_window_size.height
                )
            )
        );

        let new_scale = scale / value.scale;

        let offset = {
            x: (-t.x * (new_scale - pending_scale)) / pending_scale / crop_window_size.height,
            y: (-t.y * (new_scale - pending_scale)) / pending_scale / crop_window_size.height
        };

        pending_scale_offset = add_point(pending_scale_offset, offset);

        pending_scale = new_scale;
        animation.abort();
    }

    export function set_rotation(target: Point, degrees: number) {
        //NOT: rotate(target, degrees - value.rotation);
        if (!image_points) throw 'image points not defined';
        pending_rotation = degrees - value.rotation;

        let t = rotate_point_around_center(target, image_points.center, pending_rotation);
        pending_rotate_offset = mul_point(sub_point(target, t), 1.0 / crop_window_size.height);
        animation.abort();
    }

    export function set_pan(vector: Point) {
        pending_pan = sub_point(vector, value.position);
        animation.abort();
    }

    export function zoom(scale: number, zoom_target: Point) {
        let t = sub_point(
            zoom_target,
            add_point(
                center_point,
                mul_point(
                    add_point(
                        value.position,
                        pending_pan,
                        pending_rotate_offset,
                        pending_scale_offset
                    ),
                    crop_window_size.height
                )
            )
        );
        let new_scale = scale * pending_scale;

        let offset = {
            x: (-t.x * (new_scale - pending_scale)) / pending_scale / crop_window_size.height,
            y: (-t.y * (new_scale - pending_scale)) / pending_scale / crop_window_size.height
        };

        pending_scale_offset = add_point(pending_scale_offset, offset);
        pending_scale = new_scale;
        animation.abort();
    }

    export function rotate(target: Point, degrees: number) {
        if (!image_points) throw 'image points not defined';
        pending_rotation = pending_rotation + degrees;

        let t = rotate_point_around_center(target, image_points.center, pending_rotation);
        pending_rotate_offset = mul_point(sub_point(target, t), 1.0 / crop_window_size.height);
        animation.abort();
    }

    export function pan(vector: Point) {
        pending_pan = add_point(pending_pan, vector);
        animation.abort();
    }

    export function commit(without_animation?: boolean) {
        value.rotation = value.rotation + pending_rotation;
        pending_rotation = 0;

        value.scale = value.scale * pending_scale;
        pending_scale = 1;

        value.position = add_point(
            value.position,
            pending_pan,
            pending_rotate_offset,
            pending_scale_offset
        );
        pending_pan = { x: 0, y: 0 };
        pending_rotate_offset = { x: 0, y: 0 };
        pending_scale_offset = { x: 0, y: 0 };

        make_image_cover_crop_area(without_animation);
    }

    function image_point(p: Point): Point {
        let offset = mul_point(value.position, crop_window_size.height);

        return add_point(rotate_point(p, value.rotation), offset, center_point);
    }

    function set_media_size(e: CustomEvent<Size>) {
        media_size = { ...e.detail, aspect: e.detail.width / e.detail.height };
        commit(true);
    }

    let animation = new AnimatePosition(
        (p, s) => {
            animation_offset = p;
            animation_scale = s;
        },
        () => {
            pending_pan = add_point(pending_pan, animation_offset);
            pending_scale *= animation_scale;
            animation_scale = 1;
            animation_offset = { x: 0, y: 0 };
        }
    );

    let media_size: {
        width: number;
        height: number;
        aspect: number;
    };

    export let value: CropValue;
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
    let animation_offset: Point = {
        x: 0,
        y: 0
    };
    let pending_rotation: number = 0;
    let pending_scale: number = 1;
    let animation_scale: number = 1;

    export let center_point: Point;

    let image_points:
        | {
              top_left: Point;
              top_right: Point;
              bottom_right: Point;
              bottom_left: Point;
              center: Point;
          }
        | undefined = undefined;
    let image_top_left_rotated: Point;
    let top_left_croparea_rotated: Point;
    let top_right_croparea_rotated: Point;
    let bottom_left_croparea_rotated: Point;
    let bottom_right_croparea_rotated: Point;

    function calculate_rotated_croparea_points() {
        if (shape == 'rect') {
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
                -value.rotation
            );
            top_right_croparea_rotated = rotate_point_around_center(
                {
                    x: right_croparea,
                    y: top_croparea
                },
                center_point,
                -value.rotation
            );
            bottom_left_croparea_rotated = rotate_point_around_center(
                {
                    x: left_croparea,
                    y: bottom_croparea
                },
                center_point,
                -value.rotation
            );
            bottom_right_croparea_rotated = rotate_point_around_center(
                {
                    x: right_croparea,
                    y: bottom_croparea
                },
                center_point,
                -value.rotation
            );
        } else {
            /* To support round crop on aspect ration != 1,
               we need to find the tangent points where the
               slope of the tangent is equal to the slope of the
               corresponding side of the rotated image.

               https://www.anirdesh.com/math/algebra/ellipse-tangents.php
            */

            let slope1 = Math.tan((-value.rotation / 180) * Math.PI);
            let slope2 = Math.tan(((-value.rotation + 90) / 180) * Math.PI);

            function tangent_point_on_ellipse(a: number, b: number, m: number): Point {
                return {
                    x: (a * a * m) / Math.sqrt(a * a * m * m + b * b),
                    y: (b * b) / Math.sqrt(a * a * m * m + b * b)
                };
            }

            let p1 = tangent_point_on_ellipse(
                crop_window_size.width / 2,
                crop_window_size.height / 2,
                slope1
            );
            let p2 = { x: -p1.x, y: -p1.y };
            let p3 = tangent_point_on_ellipse(
                crop_window_size.width / 2,
                crop_window_size.height / 2,
                slope2
            );
            let p4 = { x: -p3.x, y: -p3.y };

            top_left_croparea_rotated = add_point(center_point, rotate_point(p1, -value.rotation));
            top_right_croparea_rotated = add_point(center_point, rotate_point(p2, -value.rotation));
            bottom_right_croparea_rotated = add_point(
                center_point,
                rotate_point(p3, -value.rotation)
            );
            bottom_left_croparea_rotated = add_point(
                center_point,
                rotate_point(p4, -value.rotation)
            );
        }
    }

    function make_image_cover_crop_area(without_animation?: boolean) {
        if (!media_size) return;
        if (!outer_size) return;
        if (!crop_window_size) return;

        calculate_rotated_croparea_points();

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

        if (value.scale) {
            let width = crop_window_size.height * media_size.aspect * value.scale;
            let height = crop_window_size.height * value.scale;

            let top_left = image_point({
                x: -width / 2,
                y: -height / 2
            });

            let bottom_right = image_point({
                x: width / 2,
                y: height / 2
            });

            image_points = {
                top_left,
                top_right: image_point({
                    x: width / 2,
                    y: -height / 2
                }),
                bottom_right,
                bottom_left: image_point({
                    x: -width / 2,
                    y: height / 2
                }),
                center: add_point(get_center(top_left, bottom_right))
            };

            image_top_left_rotated = rotate_point_around_center(
                image_points.top_left,
                center_point,
                -value.rotation
            );

            if (
                crop_area_min_x >= image_top_left_rotated.x &&
                crop_area_max_x <=
                    image_top_left_rotated.x +
                        crop_window_size.height * media_size.aspect * value.scale &&
                crop_area_min_y >= image_top_left_rotated.y &&
                crop_area_max_y <= image_top_left_rotated.y + crop_window_size.height * value.scale
            ) {
                return;
            }
        }

        let rotated_crop_area_width = crop_area_max_x - crop_area_min_x;
        let rotated_crop_area_height = crop_area_max_y - crop_area_min_y;

        let required_scale = Math.max(
            rotated_crop_area_width / crop_window_size.height / media_size.aspect,
            rotated_crop_area_height / crop_window_size.height
        );
        let new_scale = required_scale > value.scale ? required_scale : value.scale;

        let new_image_top_left_rotated = rotate_point_around_center(
            image_point({
                x: (-crop_window_size.height * media_size.aspect * new_scale) / 2,
                y: (-crop_window_size.height * new_scale) / 2
            }),
            center_point,
            -value.rotation
        );

        let scaled_image_size = {
            width: crop_window_size.height * media_size.aspect * new_scale,
            height: crop_window_size.height * new_scale
        };

        let correction = {
            x:
                Math.min(crop_area_min_x - new_image_top_left_rotated.x, 0) -
                Math.min(
                    new_image_top_left_rotated.x + scaled_image_size.width + -crop_area_max_x,
                    0
                ),

            y:
                Math.min(crop_area_min_y - new_image_top_left_rotated.y, 0) -
                Math.min(
                    new_image_top_left_rotated.y + scaled_image_size.height - crop_area_max_y,
                    0
                )
        };

        let offset = mul_point(
            rotate_point(correction, value.rotation),
            1 / crop_window_size.height
        );

        if (without_animation === undefined || without_animation === false) {
            animation.start(mul_point(offset, -1), value.scale / new_scale);
        }

        value.position = add_point(value.position, offset);
        value.scale = new_scale;
    }

    $: {
        value.aspect && make_image_cover_crop_area(true);
    }
</script>

{#if crop_window_size && outer_size}
    <TransformMediaView
        {media}
        height={value.scale * pending_scale * animation_scale * crop_window_size.height}
        position={add_point(
            center_point,
            mul_point(
                add_point(
                    value.position,
                    pending_pan,
                    pending_rotate_offset,
                    pending_scale_offset,
                    animation_offset
                ),
                crop_window_size.height
            )
        )}
        rotation={value.rotation + pending_rotation}
        on:media_size={set_media_size}
    />
    <!--
    {#if image_points}
        <div
            class="p"
            style="position:absolute;left:{image_points.top_left.x - 2}px;top: {image_points
                .top_left.y - 2}px"
        />
        <div
            class="p"
            style="position:absolute;left:{image_points.top_right.x - 2}px;top: {image_points
                .top_right.y - 2}px"
        />
        <div
            class="p"
            style="position:absolute;left:{image_points.bottom_right.x - 2}px;top: {image_points
                .bottom_right.y - 2}px"
        />
        <div
            class="p"
            style="position:absolute;left:{image_points.bottom_left.x - 2}px;top: {image_points
                .bottom_left.y - 2}px"
        />

        <div
            class="p"
            style="position:absolute;left:{image_points.center.x - 2}px;top: {image_points.center
                .y - 2}px"
        />
    {/if}
    {#if image_top_left_rotated}
        <div
            style="position:absolute;left:{image_top_left_rotated.x -
                2}px;top: {image_top_left_rotated.y - 2}px; width: 5px; height:5px; background:lime"
        />
        <div
            style="position:absolute;left:{image_top_left_rotated.x}px;top: {image_top_left_rotated.y}px; width: {crop_window_size.height *
                media_size.aspect *
                value.scale}px; height:{crop_window_size.height *
                value.scale}px; border:1px solid lime"
        />
    {/if}
    {#if top_left_croparea_rotated}
        <div
            style="position:absolute;left:{top_left_croparea_rotated.x -
                2}px;top: {top_left_croparea_rotated.y -
                2}px; width: 5px; height:5px; background:cyan"
        />
    {/if}
    {#if top_right_croparea_rotated}
        <div
            style="position:absolute;left:{top_right_croparea_rotated.x -
                2}px;top: {top_right_croparea_rotated.y -
                2}px; width: 5px; height:5px; background:cyan"
        />
    {/if}
    {#if bottom_right_croparea_rotated}
        <div
            style="position:absolute;left:{bottom_right_croparea_rotated.x -
                2}px;top: {bottom_right_croparea_rotated.y -
                2}px; width: 5px; height:5px; background:cyan"
        />
    {/if}
    {#if bottom_left_croparea_rotated}
        <div
            style="position:absolute;left:{bottom_left_croparea_rotated.x -
                2}px;top: {bottom_left_croparea_rotated.y -
                2}px; width: 5px; height:5px; background:cyan"
        />
    {/if}
    -->
{/if}

<style>
    /*
    .p {
        background-color: red;
        width: 5px;
        height: 5px;
        box-sizing: border-box;
    }
    */
</style>
