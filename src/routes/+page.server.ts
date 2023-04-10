import type { PageServerLoad } from './$types';

import { GITHUB_PAT } from '$env/static/private';

const headers = {
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Authorization": `Bearer ${GITHUB_PAT}`
} 

export const load = (async ({ fetch }) => {
  const result = {
    "total_commits": await getTotalCommits(fetch),
    "total_files": await getTotalFiles(fetch),
    "total_repos": await getRepos(fetch),
  }

  return result;
}) satisfies PageServerLoad;

async function getTotalCommits(fetch: { (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>; (arg0: string, arg1: { headers: { Accept: string; "X-GitHub-Api-Version": string; Authorization: string; }; }): unknown; }): Promise<number> {
  const res = await fetch('https://api.github.com/search/commits?q=author:SamDev-7&per_page=1', { headers });

  if (!res.ok) {
    return -1;
  }

  const data = await res.json();
  return data.total_count;
}

async function getTotalFiles(fetch: { (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>; (arg0: string, arg1: { headers: { Accept: string; "X-GitHub-Api-Version": string; Authorization: string; }; }): unknown; }): Promise<number> {
  const res = await fetch('https://api.github.com/search/code?q=user:SamDev-7&per_page=1', { headers });

  if (!res.ok) {
    return -1;
  }

  const data = await res.json();
  return data.total_count;
}

async function getRepos(fetch: { (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>; (arg0: string, arg1: { headers: { Accept: string; "X-GitHub-Api-Version": string; Authorization: string; }; }): unknown; }): Promise<number> {
  const res = await fetch('https://api.github.com/user/repos', { headers });

  const data = await res.json()

  if (!res.ok) {
    return -1;
  }

  return data.length;
}