ALTER TABLE "posts" ADD COLUMN "is_headline" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "headline_until" timestamp;
