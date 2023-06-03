import type { statsType } from "../routes/api/stats/+server";

export async function refreshStats() {
    const res = await fetch('/api/stats');
    const result: statsType = await res.json();

    return result;
} 