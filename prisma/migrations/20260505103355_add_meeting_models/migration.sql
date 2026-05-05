-- CreateEnum
CREATE TYPE "TranscriptSource" AS ENUM ('UPLOAD', 'RECORDING', 'LIVE');

-- CreateTable
CREATE TABLE "meeting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "participants" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" "TranscriptSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_item" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "assignee" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_file" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audio_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meeting_userId_idx" ON "meeting"("userId");

-- CreateIndex
CREATE INDEX "meeting_date_idx" ON "meeting"("date");

-- CreateIndex
CREATE UNIQUE INDEX "transcript_meetingId_key" ON "transcript"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "summary_meetingId_key" ON "summary"("meetingId");

-- CreateIndex
CREATE INDEX "action_item_meetingId_idx" ON "action_item"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "audio_file_meetingId_key" ON "audio_file"("meetingId");

-- AddForeignKey
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript" ADD CONSTRAINT "transcript_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary" ADD CONSTRAINT "summary_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_item" ADD CONSTRAINT "action_item_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_file" ADD CONSTRAINT "audio_file_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
