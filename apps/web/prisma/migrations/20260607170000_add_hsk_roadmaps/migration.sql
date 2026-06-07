CREATE TYPE "StudyPlanLessonStatus" AS ENUM (
  'LOCKED',
  'AVAILABLE',
  'IN_PROGRESS',
  'COMPLETED'
);

CREATE TABLE "hsk_study_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "hskLevel" INTEGER NOT NULL,
  "intake" JSONB NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "durationWeeks" INTEGER NOT NULL,
  "weeklyMinutes" INTEGER NOT NULL,
  "strategy" JSONB NOT NULL,
  "model" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hsk_study_plans_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hsk_study_plans_hskLevel_check" CHECK ("hskLevel" BETWEEN 1 AND 6),
  CONSTRAINT "hsk_study_plans_durationWeeks_check" CHECK ("durationWeeks" BETWEEN 2 AND 16)
);

CREATE TABLE "hsk_study_plan_weeks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "studyPlanId" UUID NOT NULL,
  "weekNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "milestone" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hsk_study_plan_weeks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hsk_study_plan_weeks_weekNumber_check" CHECK ("weekNumber" > 0)
);

CREATE TABLE "hsk_study_plan_lessons" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "weekId" UUID NOT NULL,
  "position" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "activities" JSONB NOT NULL,
  "collectionId" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "mode" "DictationMode" NOT NULL,
  "estimatedMinutes" INTEGER NOT NULL,
  "status" "StudyPlanLessonStatus" NOT NULL DEFAULT 'LOCKED',
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hsk_study_plan_lessons_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hsk_study_plan_lessons_position_check" CHECK ("position" > 0),
  CONSTRAINT "hsk_study_plan_lessons_estimatedMinutes_check" CHECK ("estimatedMinutes" BETWEEN 1 AND 180)
);

ALTER TABLE "dictation_sessions"
ADD COLUMN "studyPlanLessonId" UUID;

CREATE UNIQUE INDEX "hsk_study_plans_userId_hskLevel_key"
ON "hsk_study_plans"("userId", "hskLevel");

CREATE INDEX "hsk_study_plans_userId_updatedAt_idx"
ON "hsk_study_plans"("userId", "updatedAt");

CREATE UNIQUE INDEX "hsk_study_plan_weeks_studyPlanId_weekNumber_key"
ON "hsk_study_plan_weeks"("studyPlanId", "weekNumber");

CREATE INDEX "hsk_study_plan_weeks_studyPlanId_weekNumber_idx"
ON "hsk_study_plan_weeks"("studyPlanId", "weekNumber");

CREATE UNIQUE INDEX "hsk_study_plan_lessons_weekId_position_key"
ON "hsk_study_plan_lessons"("weekId", "position");

CREATE INDEX "hsk_study_plan_lessons_weekId_status_position_idx"
ON "hsk_study_plan_lessons"("weekId", "status", "position");

CREATE INDEX "dictation_sessions_studyPlanLessonId_status_idx"
ON "dictation_sessions"("studyPlanLessonId", "status");

ALTER TABLE "hsk_study_plan_weeks"
ADD CONSTRAINT "hsk_study_plan_weeks_studyPlanId_fkey"
FOREIGN KEY ("studyPlanId") REFERENCES "hsk_study_plans"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hsk_study_plan_lessons"
ADD CONSTRAINT "hsk_study_plan_lessons_weekId_fkey"
FOREIGN KEY ("weekId") REFERENCES "hsk_study_plan_weeks"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dictation_sessions"
ADD CONSTRAINT "dictation_sessions_studyPlanLessonId_fkey"
FOREIGN KEY ("studyPlanLessonId") REFERENCES "hsk_study_plan_lessons"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
