import { MongoClient } from "mongodb"
import { MONGO_URI } from '$env/static/private';

const client = new MongoClient(MONGO_URI);
await client.connect();

export const cacheDB = client.db('cache')
export const statsCol = cacheDB.collection('stats')
