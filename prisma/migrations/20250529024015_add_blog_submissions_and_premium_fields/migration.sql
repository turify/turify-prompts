-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premium_expires_at" TIMESTAMP(3),
ADD COLUMN     "premium_type" TEXT;

-- CreateTable
CREATE TABLE "blog_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blog_url" TEXT NOT NULL,
    "article_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "review_notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,

    CONSTRAINT "blog_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "blog_submissions" ADD CONSTRAINT "blog_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
