<script>
    export let time;
    export let text;
    export let mux = [];
    export let images = [];

    import MuxVideo from "$lib/utils/MuxVideo.svelte";
</script>

<div class="my-6">
    <p class="font-medium">{time}</p>
    <div class="mt-1 text-black dark:text-white">
        <p class="">{@html text}</p>
    </div>
    <div class="mt-2 flex flex-wrap space-x-8 xs:-md:space-x-1 -xs:space-x-0 -xs:space-y-2">
        {#each images as image}
        <div class="flex -xs:w-full">
            <img loading="lazy" class="max-h-64 drop-shadow-md rounded-md -xs:mx-auto" src="{image}" alt=""/>
        </div>
        {/each}
        {#each mux as mux}
            <MuxVideo _class="max-h-64 drop-shadow-md rounded-md" playback_id={mux}/>
        {/each}
    </div>
</div>