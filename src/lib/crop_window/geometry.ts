export type Size = {
    width: number;
    height: number;
};

export type Point = {
    x: number;
    y: number;
};

export function rotate_point(p: Point, rotation: number): Point {
    let rot = (rotation / 180) * Math.PI;
    return {
        x: p.x * Math.cos(rot) - p.y * Math.sin(rot),
        y: p.y * Math.cos(rot) + p.x * Math.sin(rot)
    };
}
export function add_point(...args: Point[]): Point {
    let r: Point = {
        x: 0,
        y: 0
    };
    for (var i = 0; i < args.length; i++) {
        r.x += args[i].x;
        r.y += args[i].y;
    }
    return r;
}

export function sub_point(p: Point, offset: Point): Point {
    return {
        x: p.x - offset.x,
        y: p.y - offset.y
    };
}

export function mul_point(p: Point, v: number): Point {
    return {
        x: p.x * v,
        y: p.y * v
    };
}

export function rotate_point_around_center(p: Point, center: Point, rotation: number): Point {
    let { x, y } = rotate_point(
        {
            x: p.x - center.x,
            y: p.y - center.y
        },
        rotation
    );
    return {
        x: x + center.x,
        y: y + center.y
    };
}

export function get_center(a: Point, b: Point): Point {
    return {
        x: (b.x + a.x) / 2,
        y: (b.y + a.y) / 2
    };
}

export function get_angle_between_points(a: Point, b: Point): number {
    let angle = -Math.atan2(a.y - b.y, b.x - a.x) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
}

export function get_distance_between_points(a: Point, b: Point): number {
    return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
}
