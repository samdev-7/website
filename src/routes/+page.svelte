<script lang="ts">
    import { randomGreeting } from "../lib/random-greeting";
    import type { PageData } from './$types';

    export let data: PageData;
    let random = data.random;

    let greeting = randomGreeting(random); 
</script>

<div class="w-screen h-screen flex">
    <div class="m-auto">
        {greeting}
    </div>
</div>