CREATE TABLE "authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "lottery_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game" text NOT NULL,
	"numbers" text NOT NULL,
	"extra" text,
	"jackpot" text,
	"draw_date" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lottery_results_game_unique" UNIQUE("game")
);
--> statement-breakpoint
CREATE TABLE "maine_minute" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"tagline" text DEFAULT 'Everything that matters. One minute.' NOT NULL,
	"stories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "maine_minute_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"image" text,
	"author" text DEFAULT 'Staff' NOT NULL,
	"published_date" timestamp DEFAULT now() NOT NULL,
	"category" text DEFAULT 'local' NOT NULL,
	"content" text NOT NULL,
	"source_url" text,
	"is_original" boolean DEFAULT true NOT NULL,
	"is_national" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail" text,
	"duration" text,
	"views" text,
	"category" text DEFAULT 'local' NOT NULL,
	"published_date" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_slug_unique" UNIQUE("slug")
);
