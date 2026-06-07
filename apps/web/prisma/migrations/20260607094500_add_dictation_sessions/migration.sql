-- This reuses the migration name already recorded by the shared Supabase database.
-- It is a standalone baseline for fresh databases and intentionally has no users table
-- or userId foreign key. See ../../README.md before using this migration against
-- the existing shared Supabase database.

CREATE TYPE "DictationMode" AS ENUM ('TYPING', 'WORD_BANK');
CREATE TYPE "DictationSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED');

CREATE TABLE "dictation_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "collectionId" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "mode" "DictationMode" NOT NULL,
  "status" "DictationSessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "questionOrder" JSONB NOT NULL,
  "completedQuestionIds" JSONB NOT NULL,
  "currentIndex" INTEGER NOT NULL DEFAULT 0,
  "exp" INTEGER NOT NULL DEFAULT 0,
  "combo" INTEGER NOT NULL DEFAULT 0,
  "maxCombo" INTEGER NOT NULL DEFAULT 0,
  "correctCount" INTEGER NOT NULL DEFAULT 0,
  "mistakeCount" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "dictation_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dictation_attempts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sessionId" UUID NOT NULL,
  "questionId" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "isCorrect" BOOLEAN NOT NULL,
  "elapsedMs" INTEGER NOT NULL,
  "expDelta" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "dictation_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dictation_sessions_userId_createdAt_idx"
ON "dictation_sessions"("userId", "createdAt");

CREATE INDEX "dictation_attempts_sessionId_createdAt_idx"
ON "dictation_attempts"("sessionId", "createdAt");

ALTER TABLE "dictation_attempts"
ADD CONSTRAINT "dictation_attempts_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "dictation_sessions"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
