import type { RequestHandler } from './$types';

import { CLOUDFLARE_TOKEN, CLOUDFLARE_ZONE_ID } from '$env/static/private';

import { json } from '@sveltejs/kit';

import { statsCol } from '$lib/mongo';
import { getCountryByCode } from '$lib/countries';

type cfStat = {
    total_unique_visitors: number,
    most_visitor_location: string
}

export type cfRecord = cfStat & {
    source: "cloudflare",
    timestamp: Date
}

const headers = {
    Authorization: `Bearer ${CLOUDFLARE_TOKEN}`
}

export const GET: RequestHandler = (async () => {
    const record = await statsCol.findOne({ source: "cloudflare" }) as cfRecord | null;

    if (!record) {
        const result = await fetchResult(fetch);

        statsCol.insertOne({
            source: "cloudflare",
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
            source: "cloudflare"
        }, {
            $set: {
                timestamp: new Date(),
                ...result
            }
        })

        return json(result);
    } else {
        const result = {
            total_unique_visitors: record.total_unique_visitors,
            most_visitor_location: record.most_visitor_location
        }

        return json(result);
    }
});

async function fetchResult(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>): Promise<cfStat> {
    const visitors = await fetchVisitors(fetch);

    return {
        total_unique_visitors: visitors.total,
        most_visitor_location: visitors.most_locations
    }
}

async function fetchVisitors(fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) {
    const today = new Date();

    const query = `query {
        viewer {
         zones (filter: {zoneTag: "${CLOUDFLARE_ZONE_ID}"}) {
           httpRequests1dGroups(
            limit: 10000,
            filter: {date_gt: "${new Date(today.getFullYear() - 1, today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds()).toISOString().slice(0, 10)}"},
           ) {
             sum {
              countryMap {
                clientCountryName, requests
              }
            },
              uniq {
                uniques
              }
            }
          }
        }
      }`
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
    });

    if (!res.ok) {
        throw new Error("Error fetching cloudflare stats with status " + res.status + ".")
    }

    const data = await res.json();

    const most_locations: string = data.data.viewer.zones[0].httpRequests1dGroups[0].sum.countryMap.reduce((a: { requests: number; }, b: { requests: number; }) => a.requests > b.requests ? a : b).clientCountryName;

    return {
        total: data.data.viewer.zones[0].httpRequests1dGroups[0].uniq.uniques,
        most_locations: getCountryByCode(most_locations)
    };
}