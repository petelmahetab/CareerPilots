"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

// ── Auto-create user if they don't exist in DB ────────────────
async function ensureUser(userId) {
  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    const clerkUser = await currentUser();
    user = await db.user.create({
      data: {
        clerkUserId: userId,
        email:       clerkUser?.emailAddresses?.[0]?.emailAddress || "",
        name:        `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
        imageUrl:    clerkUser?.imageUrl || null,
        // ✅ NO isOnboarded — your schema uses industry presence to check this
        plan:        "free",
      },
    });
    console.log("✅ New user auto-created in DB:", userId);
  }

  return user;
}

// ── Check onboarding status ───────────────────────────────────
export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await ensureUser(userId);
    // isOnboarded = true when industry is set
    return { isOnboarded: !!user?.industry };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}

// ── Update user profile after onboarding ─────────────────────
export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  try {
    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = await tx.industryInsight.findUnique({
          where: { industry: data.industry },
        });

        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);
          industryInsight = await db.industryInsight.create({
            data: {
              industry:   data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            industry:   data.industry,
            experience: data.experience,
            bio:        data.bio,
            skills:     data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      { timeout: 10000 }
    );

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}