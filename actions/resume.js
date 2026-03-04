"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const improvedContent = response.choices[0].message.content.trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}


export async function scoreResumeAgainstJD(resumeContent, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
    Analyze this resume against the job description and return JSON only:
    
    RESUME: ${resumeContent}
    JOB DESCRIPTION: ${jobDescription}
    
    Return:
    {
      "score": 0-100,
      "matchedKeywords": ["keyword1", "keyword2"],
      "missingKeywords": ["keyword1", "keyword2"],
      "suggestions": ["specific fix 1", "specific fix 2"],
      "verdict": "Strong Match | Moderate Match | Weak Match"
    }
  `;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const text = response.choices[0].message.content;
  return JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
}

export async function tailorResumeToJob(resumeContent, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const prompt = `
    You are an expert resume writer. Tailor this resume to match the job description.
    Keep all facts 100% truthful — only reword, reorder, and emphasize relevant points.
    
    RESUME:
    ${resumeContent}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    Return ONLY valid JSON, no extra text:
    {
      "tailoredSummary": "rewritten professional summary targeting this JD",
      "tailoredSkills": "reordered and expanded skills section matching JD keywords",
      "keyChanges": ["change 1", "change 2", "change 3"],
      "matchScore": 0-100
    }
  `;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const text = response.choices[0].message.content;
    return JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw new Error("Failed to tailor resume");
  }
}

export async function improveBulletPoints(bullets, jobTitle) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
    You are an expert resume coach. Rewrite each of these resume bullet points 
    for a ${jobTitle} role. Add strong action verbs, quantifiable metrics, 
    and business impact. Keep each bullet under 2 lines.
    
    BULLETS:
    ${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}
    
    Return ONLY valid JSON, no extra text:
    {
      "improved": [
        {
          "original": "original bullet text",
          "rewritten": "improved bullet with metrics and action verbs",
          "explanation": "what was improved and why"
        }
      ]
    }
  `;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const text = response.choices[0].message.content;
    return JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
  } catch (error) {
    console.error("Error improving bullets:", error);
    throw new Error("Failed to improve bullet points");
  }
}

export async function analyzeResume(resumeContent) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const prompt = `
    You are a senior hiring manager and resume expert in the ${user.industry} industry.
    Perform a deep analysis of this resume and identify strengths, weaknesses, and red flags.
    
    RESUME:
    ${resumeContent}
    
    Return ONLY valid JSON:
    {
      "overallScore": 0-100,
      "grade": "A | B | C | D | F",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "redFlags": ["red flag 1", "red flag 2"],
      "quickFixes": [
        { "issue": "issue description", "fix": "exact fix to apply", "priority": "High | Medium | Low" }
      ],
      "missingSection": ["certifications", "projects"],
      "summary": "2-3 sentence overall verdict on this resume"
    }
  `;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const text = response.choices[0].message.content;
    return JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume");
  }
}