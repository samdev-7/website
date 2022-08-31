<script>
    export let name;
    export let link = undefined;
    export let lang;
    export let icon;
    export let dark_icon = undefined;
    export let short;
    export let description;
    export let github_link = undefined;
</script>

<!-- Language Card -->
<div class="bg-white dark:bg-slate-900 dark:border-slate-600 2xs:border-2 2xs:rounded-md text-left px-6 py-4 transition-transform 2xs:hover:scale-105 2xs:hover:drop-shadow-xl flex flex-col 2xs:min-h-full">
    <!-- Title Section -->
    <div class="">
        <div class="float-left">
            <p class="text-xl font-medium">{name}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">{lang} | {short}</p>
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
    <div class="mt-6 mb-2">
        <div>
            <p>{@html description}</p>
        </div>  
    </div>

    <div class="text-slate-500 dark:text-slate-400 float-right flex space-x-2 mt-auto ml-auto">
        {#if link}
        <a class="" href={link} target="_blank" title="External Link" rel="noopener">
            <svg class=" hover:text-slate-900 dark:hover:text-slate-100" xmlns="http://www.w3.org/2000/svg" height="1.25em" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
        </a>
        {/if}
        {#if github_link}
        <a class="" href={github_link} target="_blank" title="External Link" rel="noopener">
            <svg class="hover:text-slate-900 dark:hover:text-slate-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1.25em" fill="currentColor" >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
        </a>
        {/if}
    </div>
    
</div>