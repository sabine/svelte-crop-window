import type { Point } from "./geometry";

export type Options = {
    shape: "rect" | "round";
    outline_color: string;
    overlay_color: string;
};

export const defaultOptions: Options = {
    shape: 'rect',
    outline_color: "rgba(255, 255, 255, 0.4)",
    overlay_color: "rgba(21, 21, 21, 0.7)",
}

export type Value = {
    position: Point;
    aspect: number;
    rotation: number;
    scale: number;
};

export type Media = {
    content_type: "image" | "video";
    url: string;
};
