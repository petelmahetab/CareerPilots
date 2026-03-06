"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Fetch user's existing app data ────────────────────────────
export async function getUserCareerData() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        plan: true,
        name: true,
        bio: true,
        experience: true,
        skills: true,
        industry: true,
        resume: {
          select: { id: true, content: true, createdAt: true },
          // ✅ NO take here — resume is one-to-one in your schema
        },
        assessments: {
          select: { quizScore: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        coverLetter: {
          select: { id: true, createdAt: true },
          // ✅ NO take here either if coverLetter is also one-to-one
        },
      },
    });

    if (!user) return null;

    // ── CareerScore isolated — safe if model not yet in client ──
    let careerScore = [];
    try {
      const existing = await db.careerScore.findFirst({
        where: { user: { clerkUserId: userId } },
        orderBy: { createdAt: "desc" },
      });
      careerScore = existing ? [existing] : [];
    } catch {
      careerScore = [];
    }

    return { ...user, careerScore };

  } catch (error) {
    console.error("getUserCareerData error:", error);
    return null;
  }
}

// ── Generate Career Score via Groq ────────────────────────────
export async function generateCareerScore(formData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Please sign in first." };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        plan: true,
        bio: true,
        experience: true,
        skills: true,
        industry: true,
        resume: {
          select: { content: true },
          // ✅ NO take — one-to-one relation
        },
        assessments: {
          select: { quizScore: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) return { success: false, error: "User not found." };
    if (user.plan !== "pro") return { success: false, error: "Pro access required." };

    // ── Build context ─────────────────────────────────────────
    const resumeContent = user.resume?.content
      ? JSON.stringify(user.resume.content).slice(0, 1500)
      : "No resume created yet";

    const avgAssessmentScore = user.assessments?.length > 0
      ? Math.round(
          user.assessments.reduce((s, a) => s + (a.quizScore || 0), 0) /
          user.assessments.length
        )
      : 0;

    const assessmentSummary = user.assessments?.length > 0
      ? `${user.assessments.length} assessments taken, average score: ${avgAssessmentScore}%`
      : "No assessments taken yet";

    // ── Prompt ────────────────────────────────────────────────
    const prompt = `You are an expert career coach AI. Analyze this job seeker's profile and generate a detailed career health assessment.

USER PROFILE:
- Industry: ${user.industry || formData.industry || "Not specified"}
- Years of Experience: ${user.experience || formData.yearsExp || "Not specified"}
- Current Skills: ${Array.isArray(user.skills) ? user.skills.join(", ") : "Not listed"}
- Target Role: ${formData.targetRole || "Not specified"}
- Job Search Status: ${formData.jobSearchStatus || "Not specified"}
- LinkedIn Profile: ${formData.linkedinUrl ? "Provided" : "Not provided"}
- LinkedIn Connections: ${formData.linkedinConnections || "Unknown"}
- Resume in App: ${user.resume ? "Yes - created" : "No"}
- Resume Content Preview: ${resumeContent}
- Interview Assessments: ${assessmentSummary}
- Additional Context: ${formData.additionalContext || "None"}

Respond ONLY with valid JSON — no markdown, no code fences, no explanation:
{
  "overallScore": 72,
  "overallGrade": "B",
  "summary": "2-3 sentence honest summary of their career readiness",
  "categories": [
    {
      "id": "resume",
      "name": "Resume Quality",
      "score": 78,
      "grade": "B+",
      "status": "good",
      "feedback": "Specific 1-2 sentence feedback based on their actual data",
      "quickWin": "One specific actionable thing they can do today",
      "linkedFeature": "/resume",
      "linkedFeatureLabel": "Improve Resume"
    },
    {
      "id": "skills",
      "name": "Skills & Tech Stack",
      "score": 65,
      "grade": "C+",
      "status": "needs-work",
      "feedback": "Specific feedback about their skills vs target role",
      "quickWin": "One specific skill to learn first",
      "linkedFeature": "/interview",
      "linkedFeatureLabel": "Practice Skills"
    },
    {
      "id": "interview",
      "name": "Interview Readiness",
      "score": 82,
      "grade": "A-",
      "status": "strong",
      "feedback": "Based on their assessment scores",
      "quickWin": "One thing to sharpen before next interview",
      "linkedFeature": "/interview",
      "linkedFeatureLabel": "Practice More"
    },
    {
      "id": "linkedin",
      "name": "Online Presence",
      "score": 55,
      "grade": "C",
      "status": "needs-work",
      "feedback": "Assessment of their LinkedIn and online visibility",
      "quickWin": "Most impactful profile update to make today",
      "linkedFeature": "/career-roadmap",
      "linkedFeatureLabel": "Build Presence"
    }
  ],
  "skillGaps": [
    {
      "skill": "Skill name",
      "priority": "high",
      "reason": "Why this skill matters for their target role",
      "linkedFeature": "/interview",
      "linkedFeatureLabel": "Practice This"
    }
  ],
  "actionPlan": {
    "week1": { "theme": "Foundation", "tasks": ["Task 1", "Task 2", "Task 3"] },
    "week2": { "theme": "Build",      "tasks": ["Task 1", "Task 2", "Task 3"] },
    "week3": { "theme": "Accelerate", "tasks": ["Task 1", "Task 2", "Task 3"] },
    "week4": { "theme": "Launch",     "tasks": ["Task 1", "Task 2", "Task 3"] }
  },
  "topStrength": "Their single biggest career asset in one sentence",
  "biggestGap": "Their single biggest gap to address in one sentence"
}

status must be one of: "strong", "good", "needs-work"
skillGaps: 3-5 items, priority: "high", "medium", or "low"`;

    // ── Call Groq ─────────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach AI. Respond with valid JSON only — no markdown, no code fences, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const rawText = completion.choices[0]?.message?.content?.trim();
    if (!rawText) return { success: false, error: "No response from AI. Please try again." };

    // ── Parse JSON ────────────────────────────────────────────
    let scoreData;
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      scoreData = JSON.parse(clean);
    } catch {
      console.error("JSON parse error:", rawText.slice(0, 300));
      return { success: false, error: "Failed to parse AI response. Please try again." };
    }

    // ── Save to DB ────────────────────────────────────────────
    try {
      await db.careerScore.upsert({
        where: { userId: user.id },
        update: { overallScore: scoreData.overallScore, data: scoreData, updatedAt: new Date() },
        create: { userId: user.id, overallScore: scoreData.overallScore, data: scoreData },
      });
    } catch (dbErr) {
      console.warn("CareerScore save skipped:", dbErr.message);
    }

    return { success: true, data: scoreData };

  } catch (error) {
    console.error("generateCareerScore error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}