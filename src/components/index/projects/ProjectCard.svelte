<script lang="ts">
    export let index: number
    export let project: {
        name: string;
        lang: string;
        short: string;
        desc: string;
        icon: string;
        link?: string;
        gh?: string;
    };

</script>

<a
    class="p-6 sm:border-2 border-slate-300 sm:rounded-xl sm:motion-reduce:hover:border-slate-400 sm:motion-reduce:hover:bg-slate-100 sm:motion-safe:hover:scale-110 sm:motion-safe:transition-transform
    {index % 2 === 0 ? 'sm:motion-safe:hover:rotate-1' : 'sm:motion-safe:hover:-rotate-1'}"
    href={project.link ? project.link : project.gh ? project.gh : ''}
    target="_blank"
    rel="noopener"
>
    <div class="space-y-4">
        <div class="flex">
            <div>
                <p class="inline text-xl font-medium">{project.name}</p>
                <p class="text-slate-700">{project.short} | {project.lang}</p>
            </div>
            <div class="ml-auto text-slate-800">
                <img
                    src={project.icon.startsWith('http')
                        ? project.icon
                        : `https://samliu.dev/${project.icon}`}
                    alt="Icon for {project.name}"
                    class="h-12"
                />
            </div>
        </div>
        <div>
            {project.desc}
        </div>
    </div>
</a>