ALTER TABLE "devLanguage" DROP CONSTRAINT "devLanguage_userId_devData_id_fk";
--> statement-breakpoint
ALTER TABLE "devLanguage" ADD CONSTRAINT "devLanguage_userId_devData_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."devData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dev_language_user_name_idx" ON "devLanguage" USING btree ("userId","name");