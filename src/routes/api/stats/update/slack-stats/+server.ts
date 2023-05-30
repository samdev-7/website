import type { RequestHandler } from './$types';

import { SLACK_USER_TOKEN } from '$env/static/private';
import { json } from '@sveltejs/kit';

import { statsCol } from '$lib/mongo';

type slackStat = {
    total_messages: number,
    latest_message_time: Date,
    latest_message_link: string
}

export type slackRecord = slackStat & {
    source: "hc_slack",
    timestamp: Date
}

const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${SLACK_USER_TOKEN}`
}

export const GET = (async () => {
    const record = await statsCol.findOne({ source: "hc_slack" })
    if (!record) {
        const result = await fetchResult(fetch);

        statsCol.insertOne({
            source: "hc_slack",
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
            source: "hc_slack"
        }, {
            $set: {
                timestamp: new Date(),
                ...result
            }
        })

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
        headers
    });

    if (!res.ok) {
        throw new Error(`Error fetching Slack stats with status ${res.status}.`)
    }

    const data = await res.json();

    if (!data.ok) {
        throw new Error(`Slack error with status ${res.status}.`)
    }

    return data.messages;
}
