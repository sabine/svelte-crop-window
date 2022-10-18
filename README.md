# svelte-crop-window

A crop window component for images and videos that supports touch gestures (pinch zoom, rotate, pan), as well as mousewheel zoom, mouse-dragging the image, and rotating on right mouse button.

Currently looking for contributors and feedback to help improve this component.

![video cropper](/static/videocrop.gif)

If you can do code-review, that's very welcome.

Here's a [demo page](https://sabine.github.io/svelte-crop-window/).

## `CropWindow.svelte` Component

### Props

| name      | type                                                                    | required | purpose                                                                                      |
| --------- | ----------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `media`   | `Media`                     | ✓        | image or video to be cropped                                                                 |
| `value`   | `CropValue` | ✓        | value that describes [how to crop](https://github.com/sabine/svelte-crop-window#how-to-crop) |
| `options` | `Options`                                                               |          | options for the crop window and overlay, see below                                           |

```typescript
type Media = {
    content_type: 'image' | 'video';
    url: string;
}

type CropValue = {
    position: { x: number; y: number };
    aspect: number;
    rotation: number;
    scale: number; }
}
```

### Options

| name                 | type                | purpose                                                                                                                                                                                                                                                            |
| -------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shape`              | `'rect' \| 'round'` | shape of the crop area                                                                                                                                                                                                                                             |
| `crop_window_margin` | `number`            | Margin of the crop window, in pixels. The crop window will always scale to the maximum possible size in its containing element.                                                                                                                                    |
| `overlay`            | a Svelte component  | The overlay component which visually highlights the crop area. You can pass your own Svelte component with props `options: T, gesture_in_progress: boolean, shape: 'rect' \| 'round'` here, or use the included [Overlay.svelte](/src/lib/overlay/Overlay.svelte). |
| `overlay_options`    | `T`                 | Options for your overlay component. See below for the options of the included overlay component.                                                                                                                                                                   |

## `Overlay.svelte` Component

### Options

| name               | type      | purpose                                                              |
| ------------------ | --------- | -------------------------------------------------------------------- |
| `overlay_color`    | `string`  | the color of the overlay that covers everything except the crop area |
| `line_color`       | `string`  | the color of the lines                                               |
| `show_third_lines` | `boolean` | whether to show third lines or not when a gesture is in progress     |

## How to Crop

### Display in HTML Without Actually Cropping:

```html
<div
    style="position:relative; overflow:hidden;
        height:{HEIGHT}px; width:{value.aspect * HEIGHT}px;
        border-radius: {options.shape == 'round' ? '50%' : '0'}"
>
    <video
        style="transform: translateX(-50%) translateY(-50%) rotate({value.rotation}deg);
    height: {value.scale * HEIGHT}px;
    margin-left: {HEIGHT * value.aspect / 2 + value.position.x * HEIGHT}px;
    margin-top: {HEIGHT / 2 + value.position.y * HEIGHT}px;
    max-width:none"
        src="{url}"
    />
</div>
```

Note: You must choose a `HEIGHT`, because the crop value is normalized against the target height.

### Pseudo Code to Crop

1. Choose a `target_height` and calculate the `target_width` for the cropped image:

```javascript
let target_width = value.aspect * target_height;
```

2. Calculate factor `s` by which to scale:

```javascript
let s = (value.scale * target_height) / media.height;
```

3. Scale media by `s`:

```javascript
let resized_media = scale(media, s);
```

4. Rotate media by `value.rotation`:

```javascript
let resized_and_rotated_media = rotate(resized_media, value.rotation);
```

5. Calculate top left position of the area to extract:

```javascript
let left = (resized_and_rotated_media.width - target_width) / 2.0 - value.x * target_height;
let top = (resized_and_rotated_media.height - target_height) / 2.0 - value.y * target_height;
```

6. Extract area:

```javascript
let cropped_media = extract_area(resized_and_rotated_media, left, top, target_width, target_height);
```

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
