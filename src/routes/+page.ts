import type { PageLoad } from './$types';
import type { statsType } from './api/stats/+server';

export const load = (async ({ fetch }) => {
  const stats_res = await fetch('/api/stats');
  const stats: statsType = await stats_res.json();

  return {
    stats
  };
}) satisfies PageLoad;