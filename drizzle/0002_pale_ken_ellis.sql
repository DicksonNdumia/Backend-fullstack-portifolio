CREATE TYPE "public"."proficiency" AS ENUM('beginner', 'immediate', 'expert');--> statement-breakpoint
CREATE TABLE "blogComments" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text NOT NULL,
	"userId" integer NOT NULL,
	"blogId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devData" (
	"id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"cv" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"proficiency" "proficiency" DEFAULT 'beginner' NOT NULL,
	"experience" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projectReviews" (
	"id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"shortDescription" varchar(255) NOT NULL,
	"demo" varchar(255) NOT NULL,
	"github" varchar(255) NOT NULL,
	"toolId" integer NOT NULL,
	"languageId" integer NOT NULL,
	"features" varchar(255) NOT NULL,
	"hostingPlatform" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blogComments" ADD CONSTRAINT "blogComments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogComments" ADD CONSTRAINT "blogComments_blogId_blogs_id_fk" FOREIGN KEY ("blogId") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devData" ADD CONSTRAINT "devData_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectReviews" ADD CONSTRAINT "projectReviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projectReviews" ADD CONSTRAINT "projectReviews_id_projects_id_fk" FOREIGN KEY ("id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_toolId_tools_id_fk" FOREIGN KEY ("toolId") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_languageId_languages_id_fk" FOREIGN KEY ("languageId") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;