"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Domain label (same logic as blogs.js) ─────────────────────
function getDomainLabel(industry = "") {
  const l = industry.toLowerCase();
  if (l.includes("frontend") || l.includes("front-end"))        return "Frontend Developer";
  if (l.includes("backend")  || l.includes("back-end"))         return "Backend Developer";
  if (l.includes("full") || l.includes("stack"))                return "Full-Stack Developer";
  if (l.includes("data science") || l.includes("data analyst")) return "Data Scientist";
  if (l.includes("machine learning") || l.includes("ai/ml"))    return "AI/ML Engineer";
  if (l.includes("devops") || l.includes("cloud") || l.includes("sre")) return "DevOps Engineer";
  if (l.includes("cyber") || l.includes("security"))            return "Cybersecurity Analyst";
  if (l.includes("mobile") || l.includes("android") || l.includes("ios")) return "Mobile Developer";
  if (l.includes("financ") || l.includes("investment"))         return "Finance Analyst";
  if (l.includes("bank") || l.includes("treasury"))             return "Banking Professional";
  if (l.includes("account") || l.includes("audit") || l.includes("cpa")) return "Accountant";
  if (l.includes("market") || l.includes("seo") || l.includes("brand")) return "Digital Marketer";
  if (l.includes("hr") || l.includes("human resource") || l.includes("recruit")) return "HR Professional";
  if (l.includes("sales") || l.includes("business development")) return "Sales Professional";
  if (l.includes("health") || l.includes("medic") || l.includes("clinical")) return "Healthcare Professional";
  if (l.includes("legal") || l.includes("law") || l.includes("compliance")) return "Legal Professional";
  if (l.includes("educat") || l.includes("teach"))              return "Education Professional";
  if (l.includes("product"))                                     return "Product Manager";
  if (l.includes("design") || l.includes("ux") || l.includes("ui")) return "UX/UI Designer";
  return industry || "Professional";
}

// ── Template style names ──────────────────────────────────────
const TEMPLATE_STYLES = [
  { style: "Experienced Professional", level: "5+ years experience, senior roles" },
  { style: "Career Changer",           level: "transitioning into the field" },
  { style: "Fresh Graduate",           level: "0-1 year experience, entry level" },
  { style: "Technical Specialist",     level: "deep technical expertise focus" },
  { style: "Leadership & Management",  level: "team lead or manager targeting" },
];

// ── Generate one ATS resume template ─────────────────────────
async function generateSingleTemplate(role, style, level) {
  const prompt = `Generate a complete ATS-optimized resume for a ${role} — ${style} (${level}).

The resume must:
- Be fully ATS-parseable (no tables, no columns, no graphics)
- Use strong action verbs and quantified achievements
- Include relevant keywords for ${role} roles
- Be tailored for the ${style} profile

Return ONLY a valid JSON object — no markdown, no code fences:
{
  "name": "Alex Johnson",
  "contact": {
    "email": "alex.johnson@email.com",
    "phone": "+1 (555) 000-0000",
    "linkedin": "linkedin.com/in/alexjohnson",
    "location": "San Francisco, CA",
    "github": "github.com/alexjohnson"
  },
  "summary": "3-4 sentence professional summary with ATS keywords for ${role}",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "dates": "Jan 2022 – Present",
      "bullets": [
        "Action verb + specific achievement + quantified result",
        "Action verb + specific achievement + quantified result",
        "Action verb + specific achievement + quantified result"
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "school": "University Name",
      "location": "City, State",
      "dates": "2018 – 2022",
      "gpa": "3.8/4.0"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2", "tool3"]
  },
  "certifications": ["Cert 1", "Cert 2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "1-2 sentence description with technologies and impact",
      "tech": ["tech1", "tech2"]
    }
  ],
  "atsScore": <number between 85-98>,
  "atsNotes": ["ATS tip 1 specific to this template", "ATS tip 2", "ATS tip 3"]
}

Make all content realistic and specific to a ${role}. Experience: 2-3 jobs. Projects: 2 items. Certifications: 2-3 relevant ones.`;

  const response = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  2500,
    temperature: 0.75,
    messages: [
      {
        role:    "system",
        content: `You are an expert resume writer specializing in ATS-optimized resumes for ${role} roles. Return only valid JSON.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw     = response.choices[0]?.message?.content || "";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match   = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Failed to parse template: ${style}`);
  return JSON.parse(match[0]);
}

// ── Main exported action ──────────────────────────────────────
export async function getAtsTemplates(forceRefresh = false) {
  try {
    const { userId } = await auth();
    if (!userId) return { templates: [], role: "", error: null };

    const user = await db.user.findUnique({
      where:  { clerkUserId: userId },
      select: { industry: true, plan: true },
    });

    if (!user) return { templates: [], role: "", error: null };

    const role = getDomainLabel(user.industry || "");

    // ── Check 7-day cache ─────────────────────────────────────
    let cached = null;
    try {
      cached = await db.atsTemplate.findUnique({
        where: { industry: user.industry || "general" },
      });
    } catch {
      // Table may not exist yet
    }

    const now     = new Date();
    const isStale = !cached || new Date(cached.nextUpdate) < now || forceRefresh;

    if (!isStale && cached) {
      return {
        templates:   cached.templates,
        role,
        lastFetched: cached.lastFetched,
        cached:      true,
        plan:        user.plan,
        error:       null,
      };
    }

    // ── Generate all 5 templates via Groq ─────────────────────
    // Generate sequentially to avoid rate limits
    const templates = [];
    for (const { style, level } of TEMPLATE_STYLES) {
      try {
        const data = await generateSingleTemplate(role, style, level);
        templates.push({ style, level, ...data });
      } catch (err) {
        console.warn(`Template "${style}" failed:`, err.message);
      }
    }

    if (templates.length === 0) {
      throw new Error("All templates failed to generate. Please try again.");
    }

    const nextUpdate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // ── Cache to DB ───────────────────────────────────────────
    try {
      await db.atsTemplate.upsert({
        where:  { industry: user.industry || "general" },
        update: { templates, lastFetched: now, nextUpdate },
        create: {
          industry:    user.industry || "general",
          templates,
          lastFetched: now,
          nextUpdate,
        },
      });
    } catch (dbErr) {
      console.warn("AtsTemplate DB save skipped:", dbErr.message);
    }

    return { templates, role, lastFetched: now, cached: false, plan: user.plan, error: null };

  } catch (error) {
    console.error("getAtsTemplates error:", error);
    return { templates: [], role: "", error: error.message, plan: "free" };
  }
}