<script>
    export let name;
    export let link;
    export let icon;
    export let dark_icon = undefined;
    export let short = "Programming Language";
    export let description;
</script>

<!-- Language Card -->
<a rel="noopener" href={link} id={name.replace('*', '')} target="_blank" class="scroll-mt-20">
    <div class="bg-white dark:bg-slate-900 dark:border-slate-600 2xs:border-2 2xs:rounded-md text-left px-6 py-4 transition-transform 2xs:hover:scale-105 2xs:hover:drop-shadow-xl flex flex-col 2xs:min-h-full">
        <!-- Title Section -->
        <div class="">
            <div class="float-left">
                <p class="text-xl font-medium">{name}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">{short}</p>
            </div>
            <div class="float-right">
                {#if dark_icon}
                    <img class="h-12 dark:hidden" src={icon} height="48px" alt="The {name} icon"/>
                    <img class="h-12 hidden dark:block" src={dark_icon} height="48px" alt="The {name} icon"/>
                {:else}
                    <img class="h-12" src={icon} height="48px" alt="The {name} icon"/>
                {/if}
            </div>
        </div>

        <!-- Description Section -->
        <div class="mt-6">
            <p>{@html description}</p>
        </div>
    </div>
</a>