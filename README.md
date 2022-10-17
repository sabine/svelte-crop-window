# svelte-crop-window

A crop window component for images and videos that supports touch gestures (pinch zoom, rotate, pan), as well as mousewheel zoom, mouse-dragging the image, and rotating on right mouse button.

Currently looking for contributors and feedback to help improve this component.

![video cropper](https://sabine.github.io/svelte-crop-window/videocrop.gif)

If you can do code-review, that's very welcome.

Here's a [demo page](https://sabine.github.io/svelte-crop-window/).

## Props

## `Options`
| name  | type | purpose
| ------------- | ------------- | ---------- |
| media | `{ url: string, content_type: 'image' | 'video' }` | image or video to be cropped |
| options | `Options` | options for the `CropWindow` component |
| value | `{ position: Point; aspect: number; rotation: number; scale: number; }: CropValue` | value that describes how to crop |
| shape | `'rect' | 'round'` | shape of the crop area |
| crop_window_margin | `number` | Margin of the crop window, in pixels. The crop window will always scale to the maximum possible size in its containing element. |
| overlay | a Svelte component | The overlay component which visually highlights the crop area. You can pass your own Svelte component with props `options: T, gesture_in_progress: boolean, shape: 'rect' | 'round'` here, or use the included [Overlay.svelte](/src/lib/overlay/Overlay.svelte).
| overlay_options| `T` | Options for your overlay component. The included overlay allows you to set the color of the overlay (`overlay_color: string`), the color of the lines (`line_color: string`), and whether to show third lines or not (`show_third_lines: boolean`). |

## Developing

Once you've cloned the project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Acknowledgements

One big inspiration for this component was the Android library
[uCrop by Yalantis](https://github.com/Yalantis/uCrop). What is particularly
valuable is that the developers shared their thought process in
[this blog post](https://yalantis.com/blog/how-we-created-ucrop-our-own-image-cropping-library-for-android/).

Another very helpful resource was [svelte-easy-crop](https://github.com/ValentinH/svelte-easy-crop)
which gave me a basic understanding of how to implement a crop window component in Svelte
(and HTML/JS in general).

There's no code being reused between either of these components and this one (all
calculations had to be recreated from textbook math).
