import type { PageLoad } from './$types';
import type { resultType } from './api/stats/+server';

export const load = (async ({ fetch }) => {
  const res = await fetch('/api/stats');
  const result: resultType = await res.json();

  return result;
}) satisfies PageLoad;