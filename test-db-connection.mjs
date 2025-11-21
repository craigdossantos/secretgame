// Quick test of database connection and insert
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { createId } from '@paralleldrive/cuid2';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

console.log('🔌 Testing database connection...');
console.log('📍 Connection string:', connectionString?.substring(0, 50) + '...');

try {
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  console.log('✅ Connection established');

  // Test a simple query
  console.log('\n🔍 Testing SELECT query...');
  const result = await db.execute(sql`SELECT NOW() as current_time`);
  console.log('✅ Query successful:', result);

  // Test inserting a room
  console.log('\n🏗️  Testing INSERT into rooms table...');
  const testRoomId = createId();
  const testInviteCode = 'TEST' + Math.random().toString(36).substring(2, 8).toUpperCase();

  await db.execute(sql`
    INSERT INTO rooms (id, name, owner_id, invite_code, max_members, setup_mode, created_at)
    VALUES (
      ${testRoomId},
      'Test Room',
      'test-user-id',
      ${testInviteCode},
      20,
      true,
      NOW()
    )
  `);

  console.log('✅ INSERT successful, room ID:', testRoomId);

  // Verify the insert
  console.log('\n🔍 Verifying INSERT...');
  const verification = await db.execute(sql`
    SELECT * FROM rooms WHERE id = ${testRoomId}
  `);
  console.log('✅ Verification result:', verification);

  // Clean up
  console.log('\n🧹 Cleaning up test data...');
  await db.execute(sql`DELETE FROM rooms WHERE id = ${testRoomId}`);
  console.log('✅ Cleanup complete');

  await client.end();
  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
}
