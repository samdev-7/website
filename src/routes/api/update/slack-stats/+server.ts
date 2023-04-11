import type { RequestHandler } from './$types';

import { SLACK_USER_TOKEN } from '$env/static/private';
import { json } from '@sveltejs/kit';

import { statsCol } from '$lib/mongo';

const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${SLACK_USER_TOKEN}`
}

export const GET = (async () => {
    const record = await statsCol.findOne({ source: "hc_slack" })
    if (!record) {
        const data = await getMessages(fetch);

        const result = {
            "total_messages": data.total_messages,
            "latest_message_time": data.latest_message_time
        }

        statsCol.insertOne({
            "source": "hc_slack",
            "timestamp": new Date(),
            ...result
        })

        return json(result);
    }

    const date = new Date(record.timestamp.getTime());

    // If the cache is older than a minute
    if (date.setMinutes(date.getMinutes() + 1) < new Date().getTime()) {
        const data = await getMessages(fetch);

        const result = {
            "total_messages": data.total_messages,
            "latest_message_time": data.latest_message_time
        }

        statsCol.updateOne({
            "source": "hc_slack"
        }, {
            $set: {
                "timestamp": new Date(),
                ...result
            }
        })

        return json(result);
    } else {
        const result = {
            "total_messages": record.total_messages,
            "latest_message_time": record.latest_message_time
        }

        return json(result);
    }
}) satisfies RequestHandler;

async function getMessages(fetch: { (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>; (arg0: string, arg1: { headers: { Accept: string; "X-GitHub-Api-Version": string; Authorization: string; }; }): unknown; }): Promise<{ total_messages: number; latest_message_time: Date; }> {
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


    return {
        total_messages: data.messages.total,
        latest_message_time: new Date(data.messages.matches[0].ts * 1000)
    };
}
