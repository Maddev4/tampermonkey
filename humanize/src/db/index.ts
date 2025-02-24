import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

// import console from "../utils/console";

dotenv.config();

const url = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "scrapper";

let db: Db | null = null;
let client: MongoClient | null = null;

// Singleton pattern: Connect once and reuse the connection
export const connectDB = async (): Promise<Db> => {
  if (db) return db; // Return the existing connection if already connected

  if (!client) {
    client = new MongoClient(url); // Create a new MongoClient if it doesn't exist
  }

  try {
    await client.connect();
    console.info("Connected to MongoDB");
    db = client.db(dbName); // Get the DB instance
    return db;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

export const disconnectDB = async () => {
  if (client) {
    await client.close();
    console.info("Disconnected from MongoDB");
  }
};
