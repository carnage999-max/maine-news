ALTER TABLE "authors" ADD COLUMN "role" text DEFAULT 'Reporter' NOT NULL;
--> statement-breakpoint
ALTER TABLE "authors" ADD COLUMN "email" text;
--> statement-breakpoint
ALTER TABLE "authors" ADD COLUMN "contact_info" text;
--> statement-breakpoint
INSERT INTO "authors" ("name", "role")
VALUES
    ('Seana Collins', 'Reporter'),
    ('Nathan Reardon', 'Reporter')
ON CONFLICT ("name") DO NOTHING;
