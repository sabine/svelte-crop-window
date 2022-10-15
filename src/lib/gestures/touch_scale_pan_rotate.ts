import {
    add_point,
    get_angle_between_points,
    get_center,
    get_distance_between_points,
    sub_point,
    type Point
} from '../crop_window/geometry';

export type TouchScalePanRotateEvent = {
    detail: TouchScalePanRotate;
};
export type TouchScalePanRotate = {
    focal_point: Point;
    pan: Point;
    rotation: number;
    scale: number;
};

const MIN_ROTATION: number = 25;
const MIN_PAN: number = 35;
const MIN_SCALE: number = 1.25;

function scale_unlocked(s: number): boolean {
    return s > MIN_SCALE || s < 1 / MIN_SCALE;
}

function rotation_unlocked(r: number): boolean {
    return r < -MIN_ROTATION || r > MIN_ROTATION;
}

function pan_unlocked(p: Point): boolean {
    return get_distance_between_points(p, { x: 0, y: 0 }) > MIN_PAN;
}

export function touch_scale_pan_rotate(node: HTMLElement) {
    let touches: { p: Point; identifier: number }[] = [];
    let rafTimeout: number | undefined;
    let rotation_accumulated: number = 0;
    let pan_accumulated: Point = { x: 0, y: 0 };
    let scale_accumulated: number = 1;

    function point_from_touch(t: Touch): Point {
        let rect = node.getBoundingClientRect();
        return sub_point(
            {
                x: t.clientX,
                y: t.clientY
            },
            rect
        );
    }

    function update_touch(t: Touch) {
        let existing_touch_index = touches.findIndex((tt) => tt.identifier == t.identifier);
        if (existing_touch_index != -1) {
            touches[existing_touch_index].p = point_from_touch(t);
        } else {
            touches.push({ p: point_from_touch(t), identifier: t.identifier });
        }
    }

    function touch_by_identifier(identifier: number): Point | undefined {
        let existing_touch_index = touches.findIndex((tt) => tt.identifier == identifier);
        if (existing_touch_index != -1) {
            return touches[existing_touch_index].p;
        }
    }

    function handle_touchstart(event: TouchEvent) {
        // https://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
        event.preventDefault();

        for (let t of event.changedTouches) {
            update_touch(t);
        }

        rotation_accumulated = 0;
        pan_accumulated = { x: 0, y: 0 };
        scale_accumulated = 1;

        if (touches.length > 1) {
            node.dispatchEvent(
                new CustomEvent('number_of_touch_points_changed', {
                    detail: null
                })
            );
        }

        window.addEventListener('touchmove', handle_touchmove);
        window.addEventListener('touchend', handle_touchend);
    }

    function handle_touchmove(event: TouchEvent) {
        if (event.touches.length == 1) {
            const old_focal_point = touch_by_identifier(event.touches[0].identifier);
            const focal_point = point_from_touch(event.touches[0]);

            if (!focal_point) throw 'no focal_point';
            let pan = { x: 0, y: 0 };
            if (old_focal_point) {
                pan = sub_point(focal_point, old_focal_point);
            }

            let e: TouchScalePanRotate = {
                focal_point,
                pan,
                rotation: 0,
                scale: 1
            };

            dispatch_touch_scale_pan_rotate(e, event.touches);
        }

        if (event.touches.length >= 2) {
            let old1 = touch_by_identifier(event.touches[0].identifier);
            let old2 = touch_by_identifier(event.touches[1].identifier);

            let new1 = point_from_touch(event.touches[0]);
            let new2 = point_from_touch(event.touches[1]);

            const old_focal_point = old1 && old2 ? get_center(old1, old2) : undefined;
            const focal_point = get_center(new1, new2);

            let rotation: number = 0;
            if (old1 && old2) {
                rotation =
                    get_angle_between_points(new1, new2) - get_angle_between_points(old1, old2);
                if (!rotation_unlocked(rotation_accumulated)) {
                    rotation_accumulated += rotation;
                }
            }

            let pan: Point = { x: 0, y: 0 };
            if (old_focal_point) {
                pan = sub_point(focal_point, old_focal_point);
                if (!pan_unlocked(pan_accumulated)) {
                    pan_accumulated = add_point(pan_accumulated, pan);
                }
            }

            let scale: number = 1;
            if (old1 && old2) {
                scale =
                    get_distance_between_points(new1, new2) /
                    get_distance_between_points(old1, old2);
                if (!scale_unlocked(scale_accumulated)) {
                    scale_accumulated *= scale;
                }
            }

            let e: TouchScalePanRotate = {
                focal_point,
                pan: pan_unlocked(pan_accumulated) ? pan : { x: 0, y: 0 },
                rotation: rotation_unlocked(rotation_accumulated) ? rotation : 0,
                scale: scale_unlocked(scale_accumulated) ? scale : 1
            };

            dispatch_touch_scale_pan_rotate(e, event.touches);
        }
    }

    function dispatch_touch_scale_pan_rotate(e: TouchScalePanRotate, touches: TouchList) {
        if (rafTimeout) window.cancelAnimationFrame(rafTimeout);
        rafTimeout = window.requestAnimationFrame(() => {
            node.dispatchEvent(new CustomEvent('touch_scale_pan_rotate', { detail: e }));

            for (let t of touches) {
                update_touch(t);
            }
        });
    }

    function handle_touchend(event: TouchEvent) {
        touches = [];
        rotation_accumulated = 0;
        scale_accumulated = 1;
        pan_accumulated = { x: 0, y: 0 };
        for (let t of event.touches) {
            update_touch(t);
        }

        node.dispatchEvent(
            new CustomEvent('touchend_scale_pan_rotate', {
                detail: null
            })
        );
        window.removeEventListener('touchmove', handle_touchmove);
        window.removeEventListener('touchend', handle_touchend);
    }

    node.addEventListener('touchstart', handle_touchstart);
    return {
        destroy() {
            node.removeEventListener('touchstart', handle_touchstart);
        }
    };
}
