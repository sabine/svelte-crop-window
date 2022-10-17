# svelte-crop-window

A crop window component for images and videos that supports touch gestures (pinch zoom, rotate, pan), as well as mousewheel zoom, mouse-dragging the image, and rotating on right mouse button.

Currently looking for contributors and feedback to help improve this component.

![video cropper](https://sabine.github.io/svelte-crop-window/videocrop.gif)

If you can do code-review, that's very welcome.

Here's a [demo page](https://sabine.github.io/svelte-crop-window/).

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
