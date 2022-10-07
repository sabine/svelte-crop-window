# svelte-media-crop

A component for cropping images and videos that supports touch pinch, zoom, and rotate gestures, as well as mousewheel zoom, mouse-dragging the image, and rotating on right mouse button.

![image crop](https://github.com/sabine/svelte-media-crop/blob/main/docs/cropper.gif?raw=true)
![image crop](https://github.com/sabine/svelte-media-crop/blob/main/docs/video_crop.gif?raw=true)


Currently looking for contributors to help bring this into a good shape so other people than just me can use it.

If you can do code-review, that's very welcome.

This is a WIP in the sense that it's not a complete cropper component - just the crop window, which can be used to implement a full image cropper.

## Developing

Once you've cloned the project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```


## Acknowledgements

Big thanks goes to the Android library https://github.com/Yalantis/uCrop for being a great inspiration and to the developers for sharing their thought process in their [legendary blog post](https://yalantis.com/blog/how-we-created-ucrop-our-own-image-cropping-library-for-android/).
