CREATE TABLE "deploy_keys" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"last_used_at" timestamp with time zone,
	"name" text NOT NULL,
	"project_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deploy_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "deploy_keys_key_hash_key" ON "deploy_keys" ("key_hash");--> statement-breakpoint
CREATE INDEX "deploy_keys_project_id_idx" ON "deploy_keys" ("project_id");--> statement-breakpoint
ALTER TABLE "deploy_keys" ADD CONSTRAINT "deploy_keys_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;