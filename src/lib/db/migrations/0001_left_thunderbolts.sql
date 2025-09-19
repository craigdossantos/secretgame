ALTER TABLE "room_members" ALTER COLUMN "room_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "room_members" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "owner_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secret_access" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secret_access" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "secret_access" ALTER COLUMN "secret_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secret_access" ALTER COLUMN "buyer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secret_ratings" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secret_ratings" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "secret_ratings" ALTER COLUMN "secret_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secret_ratings" ALTER COLUMN "rater_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "room_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "author_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;