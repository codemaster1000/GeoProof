import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Open the SQLite database (creates if not exists)
const sqlite = openDatabaseSync('geoproof.db');

// Create the Drizzle ORM client
export const db = drizzle(sqlite, { schema });

export type Database = typeof db;
