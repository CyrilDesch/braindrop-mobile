import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

const expo = SQLite.openDatabaseSync("local.db", { useNewConnection: true });

// Enable foreign key constraints
expo.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expo, { schema });
