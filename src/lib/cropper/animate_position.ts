import type { Point } from './geometry';

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export type AnimationState = {
    start: DOMHighResTimeStamp | null;
    start_position: Point | undefined;
    end_position: Point | undefined;
    start_scale: number;
    end_scale: number;
};

export let NO_ANIMATION: AnimationState = {
    start: null,
    start_position: undefined,
    end_position: undefined,
    start_scale: 1,
    end_scale: 1
};

function animate(animation: AnimatePosition) {
    if (animation.rafTimeout) window.cancelAnimationFrame(animation.rafTimeout);
    animation.rafTimeout = window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
        if (!animation.start_time) animation.start_time = timestamp;

        const elapsed = Math.min((timestamp - animation.start_time) / 400, 1.0);
        let z = easeInOutCubic(elapsed);

        if (!animation.start_position || !animation.end_position)
            throw 'animation lacks start or end position';

        animation.on_progress(
            {
                x: animation.start_position.x * (1 - z) + z * animation.end_position.x,
                y: animation.start_position.y * (1 - z) + z * animation.end_position.y
            },
            animation.start_scale * (1 - z) + z * animation.end_scale
        );

        if (elapsed < 1.0) {
            animate(animation);
        } else {
            animation.on_end();
            if (animation.rafTimeout) window.cancelAnimationFrame(animation.rafTimeout);
        }
    });
}

export class AnimatePosition {
    start_time: DOMHighResTimeStamp | null = null;
    start_position: Point | undefined;
    end_position: Point | undefined;
    start_scale: number = 1;
    end_scale: number = 1;

    rafTimeout: number | null = null;

    start = (
        start_position: Point,
        end_position: Point,
        start_scale: number,
        end_scale: number
    ) => {
        this.start_time = null;
        this.start_position = start_position;
        this.end_position = end_position;
        this.start_scale = start_scale;
        this.end_scale = end_scale;

        animate(this);
    };
    abort = () => {
        if (this.rafTimeout) window.cancelAnimationFrame(this.rafTimeout);

        this.start_time = null;
        this.start_position = undefined;
        this.end_position = undefined;
        this.start_scale = 1;
        this.end_scale = 1;
    };

    on_progress: (position: Point, scale: number) => void;
    on_end: () => void;

    constructor(on_progress: (position: Point, scale: number) => void, on_end: () => void) {
        this.on_progress = on_progress;
        this.on_end = on_end;
    }
}
