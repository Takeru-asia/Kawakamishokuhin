-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('REQUEST', 'BUG', 'QUESTION', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'REVIEWED', 'DONE');

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "page_url" VARCHAR(500),
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "submitted_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedbacks_status_idx" ON "feedbacks"("status");

-- CreateIndex
CREATE INDEX "feedbacks_created_at_idx" ON "feedbacks"("created_at");

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
