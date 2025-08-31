CREATE TABLE "site_images" (
	"key" varchar PRIMARY KEY NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";