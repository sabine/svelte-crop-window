import type { SvelteComponentTyped } from 'svelte';
import type { Point } from './crop_window/geometry';
import type { OverlayOptions } from './overlay/Overlay.svelte';
import Overlay from './overlay/Overlay.svelte';


type IWantToAcceptAComponent<T extends Record<string, any>> = new (
    ...args: any
) => SvelteComponentTyped<T>;


export type Options<T> = {
    shape: 'rect' | 'round'; // determines how the to-be-cropped media "snaps back" to cover the crop area.
    crop_window_margin: number; // margin of the crop window, in pixels

    overlay: IWantToAcceptAComponent<{options: T, shape: 'rect' | 'round', show_lines: boolean}>; // The overlay which visually highlights the crop area and, possibly, some third lines. You can pass your own Svelte component here, for a custom overlay.
    overlay_options: T; // options for the overlay, customizable
};

export const defaultOptions: Options<OverlayOptions> = {
    shape: 'rect',
    crop_window_margin: 10,

    overlay: Overlay,
    overlay_options: {
        line_color: '#FFFFFF',
        overlay_color: '#222222'
    },
};

export type CropValue = {
    position: Point;
    aspect: number;
    rotation: number;
    scale: number;
};

export const defaultValue: CropValue = {
    position: { x: 0, y: 0 },
    aspect: 1.0,
    rotation: 0,
    scale: 0,
};

export type Media = {
    content_type: 'image' | 'video';
    url: string;
};
