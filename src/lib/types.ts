import type { SvelteComponentTyped } from 'svelte';
import type { Point } from './crop_window/geometry';
import { defaultOverlayOptions, type OverlayOptions } from './overlay/overlay';
import Overlay from './overlay/Overlay.svelte';
export { type Point } from './crop_window/geometry';

type IWantToAcceptAComponent<T extends Record<string, any>> = new (
    ...args: any
) => SvelteComponentTyped<T>;

export type OverlayComponent<T> = IWantToAcceptAComponent<{
    options: T;
    shape: 'rect' | 'round';
    gesture_in_progress: boolean;
}>;

export type CropShape = 'rect' | 'round';

export type Options<T> = {
    /* shape of the crop area */
    shape: CropShape;

    /* margin of the crop window wrt to its containing HTMLElement, in pixels */
    crop_window_margin: number;

    /* The overlay which visually highlights the crop area.
    You can pass your own Svelte component here, for a custom overlay.
    Look at the included Overlay.svelte to see how to create your own. */
    overlay: OverlayComponent<T>;

    /* The options for the overlay component. */
    overlay_options: T;
};

export const defaultOptions: Options<OverlayOptions> = {
    shape: 'rect',
    crop_window_margin: 10,

    overlay: Overlay,
    overlay_options: defaultOverlayOptions
};

export type CropValue = {
    position: Point;
    aspect: number;
    rotation: number;
    scale: number;
};

export type Media = {
    content_type: 'image' | 'video';
    url: string;
};

export const defaultValue: CropValue = {
    position: { x: 0, y: 0 },
    aspect: 1.0,
    rotation: 0,
    scale: 0
};
