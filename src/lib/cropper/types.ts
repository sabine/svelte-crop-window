import type { Point } from "./geometry";

export type CropShape = "rect" | "round";

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
