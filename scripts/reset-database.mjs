import postgres from 'postgres';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

console.log('🗑️  Dropping all existing tables...');

try {
  await sql.unsafe(`
    DROP TABLE IF EXISTS secret_ratings CASCADE;
    DROP TABLE IF EXISTS secret_access CASCADE;
    DROP TABLE IF EXISTS secrets CASCADE;
    DROP TABLE IF EXISTS room_questions CASCADE;
    DROP TABLE IF EXISTS room_members CASCADE;
    DROP TABLE IF EXISTS rooms CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS __drizzle_migrations CASCADE;
  `);

  console.log('✅ All tables dropped successfully!');
  console.log('📝 Now running fresh migration...');

  // Apply the latest migration
  const migration = readFileSync('src/lib/db/migrations/0000_noisy_baron_strucker.sql', 'utf8');
  await sql.unsafe(migration);

  console.log('✅ Migration applied successfully!');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
} finally {
  await sql.end();
}
