import postgres from 'postgres';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

const migration = readFileSync('src/lib/db/migrations/0002_clever_nextwave.sql', 'utf8');

try {
  await sql.unsafe(migration);
  console.log('✅ Migration 0002 applied successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  await sql.end();
}
