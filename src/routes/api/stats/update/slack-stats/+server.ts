import type { RequestHandler } from './$types';

import { SLACK_USER_TOKEN } from '$env/static/private';
import { json } from '@sveltejs/kit';

import kv from "@vercel/kv";

type slackStat = {
    total_messages: number,
    latest_message_time: Date,
    latest_message_link: string
}

export type slackRecord = slackStat & {
    timestamp: string
}

const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${SLACK_USER_TOKEN}`
}

export const GET = (async () => {
    const record = await kv.json.get("slack-stats") as slackRecord | null;

    if (!record) {
        const result = await fetchResult(fetch);
        const record = { ...result, timestamp: new Date() };

        await kv.json.set("slack-stats", '$', record);

        return json(result);
    }

    const date = new Date(record.timestamp);

    // If the cache is older than a minute
    if (date.setMinutes(date.getMinutes() + 5) < new Date().getTime()) {
        const result = await fetchResult(fetch);

        await kv.json.set("slack-stats", '$', record);

        return json(result);
    } else {
        const result = {
            total_messages: record.total_messages,
            latest_message_time: record.latest_message_time
        }

        return json(result);
    }
}) satisfies RequestHandler;

async function fetchResult(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>): Promise<slackStat> {
    const messages = await fetchMessages(fetch);

    return {
        total_messages: messages.total,
        latest_message_time: new Date(messages.matches[0].ts * 1000),
        latest_message_link: messages.matches[0].permalink
    }
}

async function fetchMessages(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) {
    const res = await fetch('https://slack.com/api/search.messages?query=from%3A%40samliu&count=1', {
        method: 'POST',
        headers: headers
    });

    if (!res.ok) {
        console.error("Slack API request failed with status " + res.status + ".");
        return {
            total_messages: -1,
            latest_message_time: new Date(0)
        }
    }

    const data = await res.json();

    if (!data.ok) {
        console.error("Slack API request failed with error: " + data.error);
        return {
            total_messages: -1,
            latest_message_time: new Date(0)
        }
    }

    return data.messages;
}
