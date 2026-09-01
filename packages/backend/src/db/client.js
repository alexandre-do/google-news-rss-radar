import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

let client;
let db;

export async function getDb() {
  if (db) return db;
  client = new MongoClient(env.mongoUri);
  await client.connect();
  db = client.db(env.mongoDb);
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}
