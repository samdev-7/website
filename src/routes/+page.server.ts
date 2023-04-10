import type { PageServerLoad } from './$types';
import { statsCol } from '$lib/mongo';

export const load = (async ({ fetch }) => {
  const record = await statsCol.findOne({ source: "github" })

  if (!record) {
    const res = await fetch('/api/cron/gh-stats');
    const data = await res.json();

    return data;
  }

  const result = {
    "total_commits": record.total_commits,
    "total_files": record.total_files,
    "total_repos": record.total_repos,
  }

  return result;
}) satisfies PageServerLoad;