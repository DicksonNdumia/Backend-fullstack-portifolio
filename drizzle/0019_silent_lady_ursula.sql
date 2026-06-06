ALTER TABLE "languages" DROP CONSTRAINT "languages_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "languages" ADD CONSTRAINT "languages_userId_devData_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."devData"("id") ON DELETE no action ON UPDATE no action;