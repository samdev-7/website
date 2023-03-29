import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = (() => {
    return json({
        random: Math.random()
    })
}) satisfies RequestHandler;