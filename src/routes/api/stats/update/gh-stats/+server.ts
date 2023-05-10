import type { RequestHandler } from './$types';

import { GITHUB_PAT } from '$env/static/private';
import { json } from '@sveltejs/kit';

import kv from "@vercel/kv";

type ghStat = {
    total_commits: number,
    total_repos: number,
    latest_commit_message: string,
    latest_commit_link: string,
    most_stars_name: string,
    most_stars_link: string,
}

export type ghRecord = ghStat & {
    timestamp: string
}

const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${GITHUB_PAT}`
}

export const GET: RequestHandler = (async () => {
    const record = await kv.json.get("gh-stats") as ghRecord | null;

    if (!record) {
        const result = await fetchResult(fetch);
        const record = { ...result, timestamp: new Date() };

        await kv.json.set("gh-stats", '$', record);

        return json(result);
    }

    const date = new Date(record.timestamp);

    // If the cache is older than a minute
    if (date.setMinutes(date.getMinutes() + 1) < new Date().getTime()) {
        const result = await fetchResult(fetch);

        await kv.json.set("gh-stats", '$', record);

        return json(result);
    } else {
        const result = {
            total_commits: record.total_commits,
            total_repos: record.total_repos,
            latest_commit_message: record.latest_commit_message,
            latest_commit_link: record.latest_commit_link,
            most_stars_name: record.most_stars_name,
            most_stars_link: record.most_stars_link
        }

        return json(result);
    }
});

async function fetchResult(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>): Promise<ghStat> {
    const [commits, repos] = await Promise.all([fetchCommits(fetch), fetchRepos(fetch)])

    return {
        total_commits: commits.total_count,
        total_repos: repos.total_count,
        latest_commit_message: commits.items[0].commit.message,
        latest_commit_link: commits.items[0].html_url,
        most_stars_name: repos.items[0].name,
        most_stars_link: repos.items[0].html_url
    }
}

async function fetchCommits(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) {
    const res = await fetch('https://api.github.com/search/commits?q=author:SamDev-7&sort=author-date&order=acs&per_page=1', { headers });

    if (!res.ok) {
        console.error("Error fetching commits with status " + res.status + ".")
        return -1;
    }

    const data = await res.json();
    return data;
}

async function fetchRepos(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) {
    const res = await fetch('https://api.github.com/search/repositories?q=user:SamDev-7&sort=stars&order=desc&per_page=1', { headers });

    const data = await res.json()

    if (!res.ok) {
        console.error("Error fetching repos with status " + res.status + ".")
        return -1;
    }

    return data;
}