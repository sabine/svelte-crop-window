import type { Point } from './geometry';

export type Options = {
    shape: 'rect' | 'round';
    outline_color: string;
    overlay_color: string;
    crop_window_margin: number;
};

export const defaultOptions: Options = {
    shape: 'rect',
    outline_color: 'rgb(255, 255, 255)',
    overlay_color: 'rgb(21, 21, 21)',
    crop_window_margin: 10,
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
