import type { PageServerLoad } from './$types';
import { statsCol } from '$lib/mongo';

type resultType = {
  total_commits: number,
  total_files: number,
  total_repos: number,
  total_messages: number,
  latest_message_time: Date
}

export const load = (async ({ fetch }) => {
  let ghRecord = await statsCol.findOne({ source: "github" })

  if (!ghRecord) {
    await fetch('/api/update/gh-stats');
    ghRecord = await statsCol.findOne({ source: "github" })
  }

  let slackRecord = await statsCol.findOne({ source: "hc_slack" })

  if (!slackRecord) {
    await fetch('/api/update/slack-stats');
    slackRecord = await statsCol.findOne({ source: "hc_slack" })
  }

  if (!ghRecord || !slackRecord) {
    throw new Error("Failed to load stats, missing records in database.");
  }

  const result: resultType = {
    total_commits: ghRecord.total_commits,
    total_files: ghRecord.total_files,
    total_repos: ghRecord.total_repos,
    total_messages: slackRecord.total_messages,
    latest_message_time: slackRecord.latest_message_time
  }

  return result;
}) satisfies PageServerLoad;