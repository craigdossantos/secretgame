import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  primaryKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  inviteCode: varchar('invite_code', { length: 20 }).unique().notNull(),
  maxMembers: integer('max_members').default(20).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const roomMembers = pgTable(
  'room_members',
  {
    roomId: text('room_id').references(() => rooms.id).notNull(),
    userId: text('user_id').references(() => users.id).notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roomId, table.userId] }),
  })
);

export const secrets = pgTable(
  'secrets',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id').references(() => rooms.id).notNull(),
    authorId: text('author_id').references(() => users.id).notNull(),
    body: text('body').notNull(),
    selfRating: integer('self_rating').notNull(), // 1-5
    importance: integer('importance').notNull(), // 1-5
    avgRating: numeric('avg_rating', { precision: 3, scale: 1 }),
    buyersCount: integer('buyers_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isHidden: boolean('is_hidden').default(false).notNull(),
  },
  (table) => ({
    roomCreatedAtIdx: index('secrets_room_created_at_idx').on(
      table.roomId,
      table.createdAt
    ),
  })
);

export const secretAccess = pgTable(
  'secret_access',
  {
    id: text('id').primaryKey(),
    secretId: text('secret_id').references(() => secrets.id).notNull(),
    buyerId: text('buyer_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueBuyerSecret: unique().on(table.buyerId, table.secretId),
    secretIdx: index('secret_access_secret_idx').on(table.secretId),
  })
);

export const secretRatings = pgTable(
  'secret_ratings',
  {
    id: text('id').primaryKey(),
    secretId: text('secret_id').references(() => secrets.id).notNull(),
    raterId: text('rater_id').references(() => users.id).notNull(),
    rating: integer('rating').notNull(), // 1-5
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueRaterSecret: unique().on(table.raterId, table.secretId),
    secretIdx: index('secret_ratings_secret_idx').on(table.secretId),
  })
);

export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type RoomMember = typeof roomMembers.$inferSelect;
export type Secret = typeof secrets.$inferSelect;
export type SecretAccess = typeof secretAccess.$inferSelect;
export type SecretRating = typeof secretRatings.$inferSelect;