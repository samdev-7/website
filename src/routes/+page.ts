import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
    const res = await fetch('/api/random');
    if (res.ok) {
        return {
            random: (await res.json()).random as number
        }
    }
    return {
        random: 0,
        error: new Error('Failed to load random number')
    }
}) satisfies PageLoad;