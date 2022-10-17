import type { SvelteComponentTyped } from 'svelte';
import type { Point } from './crop_window/geometry';
import type { OverlayOptions } from './overlay/Overlay.svelte';
import Overlay from './overlay/Overlay.svelte';


type IWantToAcceptAComponent<T extends Record<string, any>> = new (
    ...args: any
) => SvelteComponentTyped<T>;


export type Options<T> = {
    /* Shape of the crop window. */
    shape: 'rect' | 'round';

    /* margin of the crop window wrt to its containing HTMLElement, in pixels */
    crop_window_margin: number; 

    /* The overlay which visually highlights the crop area.
       You can pass your own Svelte component here, for a custom overlay.
       Look at the included Overlay.svelte to see how to create your own.
    */
    overlay: IWantToAcceptAComponent<{options: T, shape: 'rect' | 'round', gesture_in_progress: boolean}>;

    /* The options for the overlay depend on the overlay component you use. */
    overlay_options: T;
};

export const defaultOptions: Options<OverlayOptions> = {
    shape: 'rect',
    crop_window_margin: 10,

    overlay: Overlay,
    overlay_options: {
        overlay_color: '#222222',
        line_color: '#FFFFFF',
        show_third_lines: true,
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
