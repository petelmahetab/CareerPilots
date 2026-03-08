-- CreateTable
CREATE TABLE "AtsTemplate" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "templates" JSONB NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextUpdate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AtsTemplate_industry_key" ON "AtsTemplate"("industry");

-- CreateIndex
CREATE INDEX "AtsTemplate_industry_idx" ON "AtsTemplate"("industry");
