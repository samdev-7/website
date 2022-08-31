<script>
    import { onMount } from 'svelte';

    export let playback_id;
    export let _class = undefined;

    let video;
    let src = `https://stream.mux.com/${playback_id}.m3u8`

    onMount(() => {
		if (!video) return;

		video.controls = true;
		let hls;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // This will run in safari, where HLS is supported natively
            video.src = src;
        // @ts-ignore
        } else if (Hls.isSupported()) {
            // This will run in all other modern browsers
            // @ts-ignore
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
	});
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video class="{_class}" bind:this={video} poster={`https://image.mux.com/${playback_id}/thumbnail.jpg`} controls preload="metadata"/>
