<script lang="ts">
    /* This component only renders the transformed image or video */
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Media } from '../types';

    export let media: Media;

    export let position: {
        x: number;
        y: number;
    } = { x: 0, y: 0 };
    export let height: number = 1.0;
    export let rotation: number = 0;

    let image_el: HTMLImageElement;
    let video_el: HTMLVideoElement;

    let dispatch = createEventDispatcher();

    function media_loaded() {
        const media_el = image_el || video_el;

        if (media_el) {
            const naturalWidth = image_el?.naturalWidth || video_el?.videoWidth || 0;
            const naturalHeight = image_el?.naturalHeight || video_el?.videoHeight || 0;

            let media_size = {
                width: naturalWidth,
                height: naturalHeight
            };
            dispatch('media_size', media_size);
        }
    }

    onMount(() => {
        if (image_el && image_el.complete) {
            media_loaded();
        }
    });
</script>

{#if media && media.content_type == 'image'}
    <img
        on:load={media_loaded}
        bind:this={image_el}
        src={media.url}
        alt={'image to be cropped'}
        style={`transform: translateX(-50%) translateY(-50%) rotate(${rotation}deg);` +
            `height: ${height}px;` +
            `margin-left: ${position.x}px;` +
            `margin-top: ${position.y}px;`}
    />
{:else if media && media.content_type == 'video'}
    <video
        autoPlay
        loop
        muted={true}
        style={`transform: translateX(-50%) translateY(-50%) rotate(${rotation}deg);` +
            `height: ${height}px;` +
            `margin-left: ${position.x}px;` +
            `margin-top: ${position.y}px;`}
        on:loadedmetadata={media_loaded}
        bind:this={video_el}
        controls={false}
    >
        {#each Array.isArray(media.url) ? media.url : [{ src: media.url }] as item}
            <source src={item.src} />
        {/each}
    </video>
{/if}

<style>
    img,
    video {
        display: block;
        max-width: none;
        max-height: none;
        width: auto;
    }
</style>
