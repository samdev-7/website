import type { resultType } from "../routes/api/stats/+server";

export async function refreshStats() {
    const res = await fetch('/api/stats');
    const result: resultType = await res.json();

    return result;
} 