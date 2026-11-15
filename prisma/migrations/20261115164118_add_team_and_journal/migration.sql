-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "shortBio" TEXT,
    "photoUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disciplines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "twitterUrl" TEXT,
    "websiteUrl" TEXT,
    "joinedAt" TIMESTAMP(3),
    "location" TEXT,
    "yearsExperience" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalPost" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT NOT NULL DEFAULT 'STUDIO',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authorId" INTEGER,
    "readTimeMinutes" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_slug_key" ON "TeamMember"("slug");

-- CreateIndex
CREATE INDEX "TeamMember_published_idx" ON "TeamMember"("published");

-- CreateIndex
CREATE INDEX "TeamMember_featured_idx" ON "TeamMember"("featured");

-- CreateIndex
CREATE INDEX "TeamMember_sortOrder_idx" ON "TeamMember"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "JournalPost_slug_key" ON "JournalPost"("slug");

-- CreateIndex
CREATE INDEX "JournalPost_published_publishedAt_idx" ON "JournalPost"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "JournalPost_category_idx" ON "JournalPost"("category");

-- CreateIndex
CREATE INDEX "JournalPost_featured_idx" ON "JournalPost"("featured");

-- AddForeignKey
ALTER TABLE "JournalPost" ADD CONSTRAINT "JournalPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
