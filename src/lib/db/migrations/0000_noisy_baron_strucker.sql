CREATE TABLE "room_members" (
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "room_members_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "room_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"question_id" text,
	"question" text,
	"category" varchar(100),
	"suggested_level" integer,
	"difficulty" varchar(20),
	"question_type" varchar(50),
	"answer_config" jsonb,
	"allow_anonymous" boolean DEFAULT false,
	"created_by" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"owner_id" text NOT NULL,
	"invite_code" varchar(20) NOT NULL,
	"max_members" integer DEFAULT 20 NOT NULL,
	"setup_mode" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "secret_access" (
	"id" text PRIMARY KEY NOT NULL,
	"secret_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "secret_access_buyer_id_secret_id_unique" UNIQUE("buyer_id","secret_id")
);
--> statement-breakpoint
CREATE TABLE "secret_ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"secret_id" text NOT NULL,
	"rater_id" text NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "secret_ratings_rater_id_secret_id_unique" UNIQUE("rater_id","secret_id")
);
--> statement-breakpoint
CREATE TABLE "secrets" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"author_id" text NOT NULL,
	"question_id" text,
	"body" text NOT NULL,
	"self_rating" integer NOT NULL,
	"importance" integer NOT NULL,
	"avg_rating" numeric(3, 1),
	"buyers_count" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"answer_type" varchar(50) DEFAULT 'text',
	"answer_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"name" varchar(255) NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_questions" ADD CONSTRAINT "room_questions_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_questions" ADD CONSTRAINT "room_questions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_access" ADD CONSTRAINT "secret_access_secret_id_secrets_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."secrets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_access" ADD CONSTRAINT "secret_access_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_ratings" ADD CONSTRAINT "secret_ratings_secret_id_secrets_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."secrets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_ratings" ADD CONSTRAINT "secret_ratings_rater_id_users_id_fk" FOREIGN KEY ("rater_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_question_id_room_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."room_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "room_questions_room_idx" ON "room_questions" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "secret_access_secret_idx" ON "secret_access" USING btree ("secret_id");--> statement-breakpoint
CREATE INDEX "secret_access_buyer_idx" ON "secret_access" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "secret_ratings_secret_idx" ON "secret_ratings" USING btree ("secret_id");--> statement-breakpoint
CREATE INDEX "secrets_room_created_at_idx" ON "secrets" USING btree ("room_id","created_at");--> statement-breakpoint
CREATE INDEX "secrets_author_idx" ON "secrets" USING btree ("author_id");