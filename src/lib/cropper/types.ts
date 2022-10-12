import type { SvelteComponentTyped } from 'svelte';
import type { Point } from './geometry';
import type { OverlayOptions } from './Overlay.svelte';
import Overlay from './Overlay.svelte';

export type IWantToAcceptAComponent<T extends Record<string, any>> = new (
    ...args: any
) => SvelteComponentTyped<T>;


export type Options<T> = {
    shape: 'rect' | 'round';
    crop_window_margin: number;

    overlay: IWantToAcceptAComponent<{options: T, shape: 'rect' | 'round', show_lines: boolean}>
    overlay_options: T;
};

export const defaultOptions: Options<OverlayOptions> = {
    shape: 'rect',
    crop_window_margin: 10,

    overlay: Overlay,
    overlay_options: {
        outline_color: 'rgb(255, 255, 255)',
        overlay_color: 'rgb(31, 31, 31)'
    },
};

export type Value = {
    position: Point;
    aspect: number;
    rotation: number;
    scale: number;
};

export const defaultValue: Value = {
    position: { x: 0, y: 0 },
    aspect: 1.0,
    rotation: 0,
    scale: 0,
};

export type Media = {
    content_type: 'image' | 'video';
    url: string;
};
