ALTER TABLE "projects" DROP CONSTRAINT "projects_languageId_languages_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_languageId_devLanguage_id_fk" FOREIGN KEY ("languageId") REFERENCES "public"."devLanguage"("id") ON DELETE cascade ON UPDATE no action;