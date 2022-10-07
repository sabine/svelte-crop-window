declare module '@composi/gestures';

declare namespace svelte.JSX {
    import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@utils/use_directives/draggable";
    import type { MouseDragEndEvent, MouseDragMoveEvent, MouseDragStartEvent } from "@utils/use_directives/mouse_draggable";
    import type { TouchScalePanRotateEvent } from "@components/by_entity/media/inputs/new_cropper/touch_scale_pan_rotate";
    interface HTMLAttributes<T> {
        // use:mouse_draggable
        onmouse_draggable_start?: (e: MouseDragStartEvent) => void;
        onmouse_draggable_move?: (e: MouseDragMoveEvent) => void;
        onmouse_draggable_end?: (e: MouseDragEndEvent) => void;

        // use:touch_zoom_pan_rotate
        ontouch_scale_pan_rotate?: (e: TouchScalePanRotateEvent) => void;
        onnumber_of_touch_points_changed?: (e: CustomEvent<null>) => void;
        ontouchend_scale_pan_rotate?: (e: CustomEvent<null>) => void;


        ongesturestart?: (e: Event) => void;
        ongesturechange?: (e: Event) => void;
    }
}
