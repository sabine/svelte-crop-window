import type { Point } from './geometry';

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export type AnimationState = {
    start: DOMHighResTimeStamp | null;
    offset: Point | undefined;
    scale: number | undefined;
};

function animate(animation: AnimatePosition) {
    if (animation.rafTimeout) window.cancelAnimationFrame(animation.rafTimeout);
    animation.rafTimeout = window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
        if (!animation.start_time) animation.start_time = timestamp;

        const elapsed = Math.min((timestamp - animation.start_time) / animation.duration, 1.0);
        let z = easeInOutCubic(elapsed);

        if (animation.offset === undefined || animation.scale === undefined)
            throw 'animation lacks start or end position/scale';

        animation.on_progress(
            {
                x: (1 - z) * animation.offset.x,
                y: (1 - z) * animation.offset.y
            },
            (1 - z) * animation.scale + z * 1.0
        );

        if (elapsed < 1.0) {
            animate(animation);
        } else {
            animation.abort();
        }
    });
}

export class AnimatePosition {
    duration: number = 500;
    start_time: DOMHighResTimeStamp | null = null;
    offset: Point | undefined;
    scale: number | undefined;

    rafTimeout: number | null = null;

    start = (offset: Point, scale: number) => {
        this.start_time = null;
        this.offset = offset;
        this.scale = scale;

        animate(this);
    };
    abort = () => {
        if (this.rafTimeout) window.cancelAnimationFrame(this.rafTimeout);
        this.on_end();

        this.start_time = null;
        this.offset = undefined;
        this.scale = undefined;
    };

    on_progress: (position: Point, scale: number) => void;
    on_end: () => void;

    constructor(on_progress: (position: Point, scale: number) => void, on_end: () => void) {
        this.on_progress = on_progress;
        this.on_end = on_end;
    }
}
