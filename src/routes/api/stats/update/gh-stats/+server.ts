import type { RequestHandler } from './$types';

import { GITHUB_PAT } from "$env/static/private";
import { statsCol } from "$lib/mongo";

import { json } from "@sveltejs/kit";

type ghStat = {
    total_aditions: number,
    total_repos: number,
    latest_commit_message: string,
    latest_commit_link: string,
    most_stars_name: string,
    most_stars_link: string,
}

export type ghRecord = ghStat & {
    source: "github",
    timestamp: Date
}

type ghRepo = {
    nameWithOwner: string,
    visibility: "PUBLIC" | "PRIVATE",
    stargazerCount: number
}

type ghContribution = {
    additions: number,
    deletions: number,
    commits: number
}

type rawGhContributionWeek = {
    w: number,
    a: number,
    d: number,
    c: number
}

type rawGhContribution = {
    total: number,
    weeks: [rawGhContributionWeek],
    author: {
        login: string,
        id: number,
        node_id: string,
        avatar_url: string,
        gravatar_id: string,
        url: string,
        html_url: string,
        followers_url: string,
        following_url: string,
        gists_url: string,
        starred_url: string,
        subscriptions_url: string,
        organizations_url: string,
        repos_url: string,
        events_url: string,
        received_events_url: string,
        type: string,
        site_admin: boolean
    }
}

const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${GITHUB_PAT}`
}

export const GET: RequestHandler = (async () => {
    const record = await statsCol.findOne({ source: "github" }) as ghRecord | null;

    if (!record) {
        const result = await fetchResult(fetch);

        statsCol.insertOne({
            source: "github",
            timestamp: new Date(),
            ...result
        })

        return json(result);
    }

    const date = new Date(record.timestamp.getTime());

    // If the cache is older than a minute
    if (date.setMinutes(date.getMinutes() + 1) < new Date().getTime()) {
        const result = await fetchResult(fetch);

        statsCol.updateOne({
            source: "github"
        }, {
            $set: {
                timestamp: new Date(),
                ...result
            }
        })

        return json(result);
    } else {
        const result = {
            total_commits: record.total_aditions,
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
    const repos = await fetchRepos(fetch)
    const [additions, latest_commit] = await Promise.all([fetchAdditions(fetch, repos.public_repos), fetchLatestCommit(fetch)])

    return {
        total_aditions: additions,
        total_repos: repos.total_repos,
        latest_commit_message: latest_commit.items[0].commit.message,
        latest_commit_link: latest_commit.items[0].html_url,
        most_stars_name: repos.most_star_repo.nameWithOwner.split('/')[1],
        most_stars_link: `https://github.com/${repos.most_star_repo.nameWithOwner}`
    }
}

async function fetchAdditions(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>, repos: ghRepo[]) {
    const additions = (await Promise.all(repos.map(async (repo: ghRepo) => {
        const contributions = await fetchContributions(fetch, repo)
        return contributions.additions
    }))).reduce((acc, addition) => acc + addition, 0)
    return additions
}

async function fetchRepos(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) {

    const query = `query {
        viewer {
          repositoriesContributedTo (
            contributionTypes: COMMIT
            first: 100
            orderBy: {
              field: PUSHED_AT
              direction: DESC
            }
            includeUserRepositories: true
          ) {
            totalCount
            edges {
              node {
                nameWithOwner
                visibility
                stargazerCount
              }
            }
          }
        }
      }`

    const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
    });


    if (!res.ok) {
        throw new Error(`Error fetching repos with status ${res.status}.`)
    }

    const data = await res.json()

    const total_repos = data.data.viewer.repositoriesContributedTo.totalCount as number
    const all_repos = data.data.viewer.repositoriesContributedTo.edges.map((edge: { node: ghRepo }) => edge.node) as ghRepo[]
    const public_repos = all_repos.filter((repo: ghRepo) => repo.visibility === "PUBLIC") as ghRepo[]
    const own_public_repos = public_repos.filter((repo: ghRepo) => repo.nameWithOwner.split("/")[0] === "SamDev-7") as ghRepo[]

    own_public_repos.sort((a: ghRepo, b: ghRepo) => b.stargazerCount - a.stargazerCount)
    const most_star_repo = own_public_repos[0]

    return {
        total_repos,
        public_repos,
        own_public_repos,
        most_star_repo
    }
}

async function fetchContributions(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>, repo: ghRepo): Promise<ghContribution> {
    const res = await fetch(`https://api.github.com/repos/${repo.nameWithOwner}/stats/contributors?per_page=100`, { headers });

    if (!res.ok) {
        throw new Error(`Error fetching contributions with status ${res.status}.`)
    }

    const all_contributions = await res.json() as rawGhContribution[];
    let contributions = null
    try {
        contributions = all_contributions.filter((contribution: rawGhContribution) => contribution.author.login === "SamDev-7")
    } catch (e) {
        return {
            additions: 0,
            deletions: 0,
            commits: 0
        }
    }

    const additions = contributions.reduce(
        (acc: number, contribution: rawGhContribution) => acc + contribution.weeks.reduce((acc2: number, week: rawGhContributionWeek) => acc2 + week.a, 0), 0
    )
    const deletions = contributions.reduce(
        (acc: number, contribution: rawGhContribution) => acc + contribution.weeks.reduce((acc2: number, week: rawGhContributionWeek) => acc2 + week.d, 0), 0
    )
    const commits = contributions.reduce(
        (acc: number, contribution: rawGhContribution) => acc + contribution.total, 0
    )

    return {
        additions,
        deletions,
        commits
    }
}

async function fetchLatestCommit(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) {
    const res = await fetch('https://api.github.com/search/commits?q=author:SamDev-7&sort=author-date&order=acs&per_page=1', { headers });

    if (!res.ok) {
        throw new Error(`Error fetching commits with status ${res.status}.`)
    }

    const data = await res.json();
    return data;
}