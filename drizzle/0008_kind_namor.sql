CREATE INDEX "review_user_idx" ON "projectReviews" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "review_project_idx" ON "projectReviews" USING btree ("projectId");