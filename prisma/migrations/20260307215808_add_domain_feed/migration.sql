-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "ProRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainFeed" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "articles" JSONB NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextUpdate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProRequest_userId_idx" ON "ProRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerScore_userId_key" ON "CareerScore"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DomainFeed_industry_key" ON "DomainFeed"("industry");

-- CreateIndex
CREATE INDEX "DomainFeed_industry_idx" ON "DomainFeed"("industry");

-- AddForeignKey
ALTER TABLE "ProRequest" ADD CONSTRAINT "ProRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerScore" ADD CONSTRAINT "CareerScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
