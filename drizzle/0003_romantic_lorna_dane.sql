ALTER TABLE "blogComments" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "blogComments" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "blogs" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "blogs" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "devData" RENAME COLUMN "updatedAt" TO "userId";--> statement-breakpoint
ALTER TABLE "languages" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "languages" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "projectReviews" RENAME COLUMN "createdAt" TO "projectId";--> statement-breakpoint
ALTER TABLE "projectReviews" RENAME COLUMN "updatedAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "tools" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "tools" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "devData" DROP CONSTRAINT "devData_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projectReviews" DROP CONSTRAINT "projectReviews_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "languages" ALTER COLUMN "proficiency" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "languages" ALTER COLUMN "proficiency" SET DEFAULT 'beginner'::text;--> statement-breakpoint
DROP TYPE "public"."proficiency";--> statement-breakpoint
CREATE TYPE "public"."proficiency" AS ENUM('beginner', 'intermediate', 'expert');--> statement-breakpoint
ALTER TABLE "languages" ALTER COLUMN "proficiency" SET DEFAULT 'beginner'::"public"."proficiency";--> statement-breakpoint
ALTER TABLE "languages" ALTER COLUMN "proficiency" SET DATA TYPE "public"."proficiency" USING "proficiency"::"public"."proficiency";--> statement-breakpoint
ALTER TABLE "devData" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "devData" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "devData" ALTER COLUMN "createdAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projectReviews" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "projectReviews" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "devData" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "devData" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "projectReviews" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "devData" ADD CONSTRAINT "devData_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectReviews" ADD CONSTRAINT "projectReviews_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devData" ADD CONSTRAINT "devData_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "devData" ADD CONSTRAINT "devData_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");