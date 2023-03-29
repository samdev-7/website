<script lang="ts">
    import { greetings } from "../lib/random-greeting";
    import Typewriter from 'svelte-typewriter';

</script>

<div class="w-screen h-screen flex">
    <div class="m-auto">
        <div style="--cursor-color: #2563eb; --cursor-width: 0.20ch">
            <Typewriter mode="loopRandom" interval={75} unwriteInterval={20} wordInterval={5000}>
                {#each greetings as greeting}
                    <h2 class="text-blue-600 text-3xl">{greeting}</h2>
                {/each}
            </Typewriter>
        </div>
    </div>
</div>