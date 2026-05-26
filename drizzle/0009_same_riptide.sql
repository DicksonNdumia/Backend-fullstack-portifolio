ALTER TABLE "blogs" ADD COLUMN "userId" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "userId" integer;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;