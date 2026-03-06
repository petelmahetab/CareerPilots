import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import GuidePage from "./_components/guide-page";

export default async function GuidePageWrapper() {
  const { userId } = await auth();

  let userIndustry = null;

  if (userId) {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });
    userIndustry = user?.industry || null;
  }

  return <GuidePage userIndustry={userIndustry} />;
}