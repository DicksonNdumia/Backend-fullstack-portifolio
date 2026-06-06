CREATE TABLE "devLanguage" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"proficiency" "proficiency" DEFAULT 'beginner' NOT NULL,
	"experience" text NOT NULL,
	"userId" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "languages" DROP CONSTRAINT "languages_userId_devData_id_fk";
--> statement-breakpoint
ALTER TABLE "devLanguage" ADD CONSTRAINT "devLanguage_userId_devData_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."devData"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "languages" DROP COLUMN "proficiency";--> statement-breakpoint
ALTER TABLE "languages" DROP COLUMN "experience";--> statement-breakpoint
ALTER TABLE "languages" DROP COLUMN "userId";