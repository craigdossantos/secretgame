import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  primaryKey,
  unique,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Rooms table
export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  inviteCode: varchar('invite_code', { length: 20 }).unique().notNull(),
  maxMembers: integer('max_members').default(20).notNull(),
  setupMode: boolean('setup_mode').default(true), // true = setup, false = play mode
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Room members join table
export const roomMembers = pgTable(
  'room_members',
  {
    roomId: text('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roomId, table.userId] }),
  })
);

// Room questions - stores both selected question IDs and custom questions
export const roomQuestions = pgTable(
  'room_questions',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
    questionId: text('question_id'), // From data/questions.md, null for custom
    question: text('question'), // Custom question text
    category: varchar('category', { length: 100 }),
    suggestedLevel: integer('suggested_level'), // 1-5
    difficulty: varchar('difficulty', { length: 20 }), // 'easy' | 'medium' | 'hard'
    questionType: varchar('question_type', { length: 50 }), // 'text' | 'slider' | 'multipleChoice' | etc.
    answerConfig: jsonb('answer_config'), // Type-specific config (options, min/max, etc.)
    allowAnonymous: boolean('allow_anonymous').default(false),
    createdBy: text('created_by').references(() => users.id), // null for curated questions
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    roomIdx: index('room_questions_room_idx').on(table.roomId),
  })
);

// Secrets/Answers table - stores all answer types
export const secrets = pgTable(
  'secrets',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
    authorId: text('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    questionId: text('question_id').references(() => roomQuestions.id), // Link to room question
    body: text('body').notNull(), // Main text content
    selfRating: integer('self_rating').notNull(), // 1-5 spiciness
    importance: integer('importance').notNull(), // 1-5 importance
    avgRating: numeric('avg_rating', { precision: 3, scale: 1 }),
    buyersCount: integer('buyers_count').default(0).notNull(),
    isHidden: boolean('is_hidden').default(false).notNull(),
    isAnonymous: boolean('is_anonymous').default(false), // Hide author identity
    answerType: varchar('answer_type', { length: 50 }).default('text'), // 'text' | 'slider' | 'multipleChoice' | 'imageUpload'
    answerData: jsonb('answer_data'), // Type-specific answer data
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    roomCreatedAtIdx: index('secrets_room_created_at_idx').on(
      table.roomId,
      table.createdAt
    ),
    authorIdx: index('secrets_author_idx').on(table.authorId),
  })
);

// Secret access - tracks who unlocked which secrets
export const secretAccess = pgTable(
  'secret_access',
  {
    id: text('id').primaryKey(),
    secretId: text('secret_id').references(() => secrets.id, { onDelete: 'cascade' }).notNull(),
    buyerId: text('buyer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueBuyerSecret: unique().on(table.buyerId, table.secretId),
    secretIdx: index('secret_access_secret_idx').on(table.secretId),
    buyerIdx: index('secret_access_buyer_idx').on(table.buyerId),
  })
);

// Secret ratings
export const secretRatings = pgTable(
  'secret_ratings',
  {
    id: text('id').primaryKey(),
    secretId: text('secret_id').references(() => secrets.id, { onDelete: 'cascade' }).notNull(),
    raterId: text('rater_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    rating: integer('rating').notNull(), // 1-5
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueRaterSecret: unique().on(table.raterId, table.secretId),
    secretIdx: index('secret_ratings_secret_idx').on(table.secretId),
  })
);

// Type exports
export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type RoomMember = typeof roomMembers.$inferSelect;
export type RoomQuestion = typeof roomQuestions.$inferSelect;
export type Secret = typeof secrets.$inferSelect;
export type SecretAccess = typeof secretAccess.$inferSelect;
export type SecretRating = typeof secretRatings.$inferSelect;
