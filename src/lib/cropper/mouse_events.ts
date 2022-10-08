export function pos_from_mouse_or_touch_event(event: MouseEvent | TouchEvent): {
    x: number;
    y: number;
} {
    let pos: MouseEvent | Touch;
    if (event.type === 'touchstart') {
        pos = (event as TouchEvent).touches[0];
    } else {
        if (event.type === 'touchmove') {
            pos = (event as TouchEvent).changedTouches[0];
        } else {
            pos = event as MouseEvent;
        }
    }
    return {
        x: pos.clientX,
        y: pos.clientY
    };
}

export type MouseDragMove = {
    x: number;
    y: number;
    dx: number;
    dy: number;
    mouse_button: number;
};
export type MouseDragStartEnd = {
    x: number;
    y: number;
    mouse_button: number;
};

export type MouseDragMoveEvent = {
    detail: MouseDragMove;
};

export type MouseDragStartEvent = {
    detail: MouseDragStartEnd;
};

export type MouseDragEndEvent = {
    detail: MouseDragStartEnd;
};

function prevent_context_menu(event: Event) {
    event.preventDefault();
    return false;
}

export function mouse_draggable(node: HTMLElement) {
    let x: number | undefined;
    let y: number | undefined;
    let mouse_button: number | undefined;

    function handle_dragstart(event: MouseEvent) {
        // https://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
        event.preventDefault();

        if (mouse_button === undefined) {
            mouse_button = event.button;
            let p = pos_from_mouse_or_touch_event(event);
            let detail: MouseDragStartEnd = {
                x: p.x,
                y: p.y,
                mouse_button
            };

            node.dispatchEvent(
                new CustomEvent('mouse_draggable_start', {
                    detail
                })
            );
            window.addEventListener('mousemove', handle_dragmove);
            window.addEventListener('mouseup', handle_dragend);
        }
    }
    function handle_dragmove(event: MouseEvent) {
        event.preventDefault();

        let p = pos_from_mouse_or_touch_event(event);

        const dx = p.x - (x || p.x);
        const dy = p.y - (y || p.y);
        x = p.x;
        y = p.y;
        let detail: MouseDragMove = {
            x,
            y,
            dx,
            dy,
            mouse_button: mouse_button || 0
        };
        node.dispatchEvent(
            new CustomEvent('mouse_draggable_move', {
                detail
            })
        );
    }
    function handle_dragend(event: MouseEvent) {
        event.preventDefault();
        x = undefined;
        y = undefined;
        mouse_button = undefined;

        let p = pos_from_mouse_or_touch_event(event);
        let detail: MouseDragStartEnd = {
            x: p.x,
            y: p.y,
            mouse_button: mouse_button || 0
        };
        node.dispatchEvent(
            new CustomEvent('mouse_draggable_end', {
                detail
            })
        );
        window.removeEventListener('mousemove', handle_dragmove);
        window.removeEventListener('mouseup', handle_dragend);
    }
    node.addEventListener('mousedown', handle_dragstart);
    node.addEventListener('contextmenu', prevent_context_menu);
    return {
        destroy() {
            node.removeEventListener('mousedown', handle_dragstart);
            node.removeEventListener('contextmenu', prevent_context_menu);
        }
    };
}

/*
export function clamp(x: number, min: number, max: number) {
    if (x < min) return min;
    if (x > max) return max;
    return x;
}
*/
