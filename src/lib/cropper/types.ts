import type { Point } from "./geometry";

export type Options = {
    shape: "rect" | "round";
};

export const defaultOptions: Options = {
    shape: 'rect',
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
