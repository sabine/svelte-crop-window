export type OverlayOptions = {
    overlay_color: string;
    line_color: string;
    show_third_lines: boolean;
};

export const defaultOverlayOptions: OverlayOptions = {
    overlay_color: 'rgb(11, 11, 11, 0.7)',
    line_color: 'rgba(167, 167, 167, 0.5)',
    show_third_lines: true
};
