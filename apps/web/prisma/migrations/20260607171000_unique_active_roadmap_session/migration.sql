CREATE UNIQUE INDEX "dictation_sessions_one_active_per_study_plan_lesson"
ON "dictation_sessions"("studyPlanLessonId")
WHERE "studyPlanLessonId" IS NOT NULL AND "status" = 'ACTIVE';
