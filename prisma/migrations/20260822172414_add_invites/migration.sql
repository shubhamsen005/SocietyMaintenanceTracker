-- CreateTable
CREATE TABLE "public"."Invite" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_code_key" ON "public"."Invite"("code");

-- CreateIndex
CREATE INDEX "Invite_societyId_expiresAt_idx" ON "public"."Invite"("societyId", "expiresAt");

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "public"."Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
