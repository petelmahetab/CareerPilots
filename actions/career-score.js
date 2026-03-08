"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Domain detection ──────────────────────────────────────────
const IT_KEYWORDS = [
  "software", "developer", "engineer", "frontend", "backend", "full stack",
  "fullstack", "web", "mobile", "devops", "cloud", "data science", "machine learning",
  "ai", "ml", "cybersecurity", "infosec", "blockchain", "sre", "platform",
  "tech", "it ", "information technology", "computer science", "programming",
];

function detectDomain(industry = "") {
  const lower = industry.toLowerCase();

  if (IT_KEYWORDS.some((kw) => lower.includes(kw))) {
    // Specific IT sub-domain
    if (lower.includes("front"))                         return { category: "IT", domain: "Frontend Development" };
    if (lower.includes("back"))                          return { category: "IT", domain: "Backend Development" };
    if (lower.includes("full") || lower.includes("stack")) return { category: "IT", domain: "Full-Stack Development" };
    if (lower.includes("data science") || lower.includes("data analyst")) return { category: "IT", domain: "Data Science" };
    if (lower.includes("ml") || lower.includes("machine learning") || lower.includes("ai")) return { category: "IT", domain: "AI/ML Engineering" };
    if (lower.includes("devops") || lower.includes("cloud") || lower.includes("sre")) return { category: "IT", domain: "DevOps/Cloud" };
    if (lower.includes("cyber") || lower.includes("security") || lower.includes("infosec")) return { category: "IT", domain: "Cybersecurity" };
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("ios")) return { category: "IT", domain: "Mobile Development" };
    return { category: "IT", domain: "Software Engineering" };
  }

  // Non-IT domains
  if (lower.includes("financ") || lower.includes("investment") || lower.includes("trading") || lower.includes("equity")) return { category: "Finance", domain: "Finance & Investment" };
  if (lower.includes("bank") || lower.includes("credit") || lower.includes("treasury")) return { category: "Finance", domain: "Banking" };
  if (lower.includes("account") || lower.includes("audit") || lower.includes("cpa") || lower.includes("tax")) return { category: "Finance", domain: "Accounting" };
  if (lower.includes("market") || lower.includes("seo") || lower.includes("brand") || lower.includes("advertis")) return { category: "Marketing", domain: "Digital Marketing" };
  if (lower.includes("hr") || lower.includes("human resource") || lower.includes("recruit") || lower.includes("talent")) return { category: "HR", domain: "Human Resources" };
  if (lower.includes("sales") || lower.includes("business development") || lower.includes("crm")) return { category: "Sales", domain: "Sales & Business Development" };
  if (lower.includes("health") || lower.includes("medic") || lower.includes("clinical") || lower.includes("hospital")) return { category: "Healthcare", domain: "Healthcare" };
  if (lower.includes("legal") || lower.includes("law") || lower.includes("attorney") || lower.includes("compliance")) return { category: "Legal", domain: "Legal & Compliance" };
  if (lower.includes("educat") || lower.includes("teach") || lower.includes("school") || lower.includes("curriculum")) return { category: "Education", domain: "Education & Teaching" };
  if (lower.includes("supply") || lower.includes("logistics") || lower.includes("procurement") || lower.includes("operations")) return { category: "Operations", domain: "Supply Chain & Operations" };
  if (lower.includes("consult"))  return { category: "Business", domain: "Consulting" };
  if (lower.includes("product"))  return { category: "IT", domain: "Product Management" };
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui")) return { category: "IT", domain: "UX/UI Design" };

  return { category: "General", domain: industry || "Professional" };
}

// ── Domain-specific evaluation criteria ──────────────────────
const DOMAIN_CRITERIA = {
  IT: {
    categories: ["resume", "skills", "interview", "linkedin"],
    skillsBenchmark: "technical skills (languages, frameworks, tools) vs industry standards",
    resumeNote: "GitHub links, project descriptions, quantified impact, tech stack clarity",
    interviewNote: "DSA, system design, coding assessments, behavioral questions",
    linkedinNote: "open to work flag, portfolio links, GitHub pinned repos, tech endorsements",
    extraContext: "GitHub activity, open-source contributions, personal projects, certifications (AWS, GCP, etc.)",
  },
  Finance: {
    categories: ["resume", "skills", "certifications", "linkedin"],
    skillsBenchmark: "financial modeling, Excel, Bloomberg, valuation, CFA/CPA progress",
    resumeNote: "deal experience, AUM managed, quantified P&L impact, financial instruments handled",
    interviewNote: "technical finance interviews, case studies, mental math, market knowledge",
    linkedinNote: "CFA/CPA badges, finance thought leadership, connections in finance sector",
    extraContext: "certifications (CFA, CPA, FRM, CMA), deal experience, software (Bloomberg, FactSet)",
  },
  Marketing: {
    categories: ["resume", "skills", "portfolio", "linkedin"],
    skillsBenchmark: "SEO/SEM, Google Analytics, social media, content strategy, paid ads",
    resumeNote: "campaign ROI, traffic growth %, conversion rates, tools used (HubSpot, Marketo)",
    interviewNote: "case studies, marketing strategy questions, data interpretation",
    linkedinNote: "content engagement, personal brand, thought leadership posts, endorsements",
    extraContext: "certifications (Google Ads, HubSpot, Meta Blueprint), portfolio of campaigns",
  },
  HR: {
    categories: ["resume", "skills", "certifications", "linkedin"],
    skillsBenchmark: "recruiting, HRIS tools, L&D, comp & benefits, employment law knowledge",
    resumeNote: "hires made, time-to-fill metrics, programs launched, headcount managed",
    interviewNote: "behavioral interviews, HR case scenarios, employment law questions",
    linkedinNote: "SHRM/CIPD certifications, HR community engagement, recruiter network",
    extraContext: "certifications (SHRM-CP, PHR, CIPD), HRIS tools (Workday, SAP, BambooHR)",
  },
  Sales: {
    categories: ["resume", "skills", "track_record", "linkedin"],
    skillsBenchmark: "CRM tools, prospecting, closing techniques, quota attainment, negotiation",
    resumeNote: "quota %, revenue generated, deal sizes, top accounts managed",
    interviewNote: "sales role plays, objection handling, pipeline management questions",
    linkedinNote: "social selling index, client testimonials, sales awards, network size",
    extraContext: "CRM tools (Salesforce, HubSpot), sales methodology (MEDDIC, Challenger Sale)",
  },
  Healthcare: {
    categories: ["resume", "skills", "certifications", "linkedin"],
    skillsBenchmark: "clinical skills, patient care, medical knowledge, healthcare software, compliance",
    resumeNote: "patient outcomes, specialties covered, departments worked, volume handled",
    interviewNote: "clinical scenario questions, HIPAA knowledge, patient case discussions",
    linkedinNote: "medical board certifications, publications, hospital affiliations",
    extraContext: "licenses (RN, MD, etc.), specializations, EHR tools (Epic, Cerner), publications",
  },
  Legal: {
    categories: ["resume", "skills", "certifications", "linkedin"],
    skillsBenchmark: "legal research, drafting, compliance, negotiation, specific law areas",
    resumeNote: "cases handled, deal value, jurisdictions, firms/clients worked for",
    interviewNote: "legal reasoning, case analysis, hypothetical scenarios",
    linkedinNote: "bar admission, publications, legal community engagement",
    extraContext: "bar certifications, jurisdictions, legal software (LexisNexis, Westlaw)",
  },
  Education: {
    categories: ["resume", "skills", "certifications", "linkedin"],
    skillsBenchmark: "curriculum design, pedagogy, classroom management, ed-tech tools, assessment",
    resumeNote: "student outcomes, subjects taught, grade levels, curriculum developed",
    interviewNote: "lesson planning, classroom scenarios, teaching philosophy questions",
    linkedinNote: "teaching certifications, educational community, publications",
    extraContext: "teaching license, subjects/grades, ed-tech tools (Canvas, Google Classroom)",
  },
  Operations: {
    categories: ["resume", "skills", "certifications", "linkedin"],
    skillsBenchmark: "supply chain, ERP tools, process optimization, vendor management, KPIs",
    resumeNote: "cost savings, process improvements, vendor performance, SLA achievements",
    interviewNote: "operations case studies, process improvement scenarios",
    linkedinNote: "APICS/SCM certifications, operations network, thought leadership",
    extraContext: "certifications (APICS, Six Sigma, PMP), ERP tools (SAP, Oracle)",
  },
  Business: {
    categories: ["resume", "skills", "portfolio", "linkedin"],
    skillsBenchmark: "strategy, problem solving, stakeholder management, Excel/PPT, industry knowledge",
    resumeNote: "projects delivered, clients served, revenue impact, frameworks used",
    interviewNote: "case interviews, consulting frameworks (MECE, BCG matrix), fit interviews",
    linkedinNote: "MBA/certifications, thought leadership, consulting firm network",
    extraContext: "MBA, consulting certifications, notable clients, published frameworks",
  },
  General: {
    categories: ["resume", "skills", "interview", "linkedin"],
    skillsBenchmark: "core professional skills relevant to the target role and industry",
    resumeNote: "quantified achievements, relevant experience, clear career progression",
    interviewNote: "behavioral interviews, technical/functional knowledge, communication",
    linkedinNote: "professional photo, headline, recommendations, activity",
    extraContext: "any relevant certifications, portfolio, volunteer work, side projects",
  },
};

// Category label map
const CATEGORY_LABELS = {
  resume:        { name: "Resume Quality",         linkedFeature: "/resume",    linkedFeatureLabel: "Improve Resume"    },
  skills:        { name: "Skills & Benchmarks",    linkedFeature: "/interview", linkedFeatureLabel: "Practice Skills"   },
  interview:     { name: "Interview Readiness",    linkedFeature: "/interview", linkedFeatureLabel: "Practice More"     },
  linkedin:      { name: "Online Presence",        linkedFeature: "/guide",     linkedFeatureLabel: "Build Presence"    },
  certifications:{ name: "Certifications & Creds", linkedFeature: "/guide",     linkedFeatureLabel: "Get Certified"     },
  portfolio:     { name: "Portfolio & Work",       linkedFeature: "/guide",     linkedFeatureLabel: "Build Portfolio"   },
  track_record:  { name: "Track Record & Results", linkedFeature: "/resume",    linkedFeatureLabel: "Update Resume"     },
};

// ── Fetch user data ───────────────────────────────────────────
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
        },
        assessments: {
          select: { quizScore: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        coverLetter: {
          select: { id: true, createdAt: true },
        },
      },
    });

    if (!user) return null;

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

// ── Generate Career Score ─────────────────────────────────────
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
        resume: { select: { content: true } },
        assessments: {
          select: { quizScore: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) return { success: false, error: "User not found." };
    if (user.plan !== "pro") return { success: false, error: "Pro access required." };

    // ── Detect domain ─────────────────────────────────────────
    const industry = user.industry || formData.industry || "";
    const { category, domain } = detectDomain(industry);
    const criteria = DOMAIN_CRITERIA[category] || DOMAIN_CRITERIA["General"];

    // ── Build context ─────────────────────────────────────────
    const resumeContent = user.resume?.content
      ? JSON.stringify(user.resume.content).slice(0, 1500)
      : "No resume created yet";

    const avgAssessmentScore =
      user.assessments?.length > 0
        ? Math.round(
            user.assessments.reduce((s, a) => s + (a.quizScore || 0), 0) /
              user.assessments.length
          )
        : 0;

    const assessmentSummary =
      user.assessments?.length > 0
        ? `${user.assessments.length} assessments taken, average score: ${avgAssessmentScore}%`
        : "No assessments taken yet";

    // Build the category JSON template dynamically
    const categoryTemplates = criteria.categories
      .map((catId) => {
        const catMeta = CATEGORY_LABELS[catId] || CATEGORY_LABELS["skills"];
        return `{
      "id": "${catId}",
      "name": "${catMeta.name}",
      "score": <0-100>,
      "grade": "<A+/A/A-/B+/B/B-/C+/C/C-/D>",
      "status": "<strong|good|needs-work>",
      "feedback": "<domain-specific 1-2 sentence feedback for ${domain}>",
      "quickWin": "<one specific action for ${domain} professional>",
      "linkedFeature": "${catMeta.linkedFeature}",
      "linkedFeatureLabel": "${catMeta.linkedFeatureLabel}"
    }`;
      })
      .join(",\n    ");

    // ── Prompt ────────────────────────────────────────────────
    const prompt = `You are an expert career coach specializing in ${domain}.

Analyze this ${domain} professional's profile and generate a domain-specific career health score.

USER PROFILE:
- Domain / Industry: ${domain} (${category})
- Years of Experience: ${user.experience || formData.yearsExp || "Not specified"}
- Current Skills: ${Array.isArray(user.skills) ? user.skills.join(", ") : "Not listed"}
- Target Role: ${formData.targetRole || "Not specified"}
- Job Search Status: ${formData.jobSearchStatus || "Not specified"}
- LinkedIn: ${formData.linkedinUrl ? "URL provided" : "Not provided"} | Connections: ${formData.linkedinConnections || "Unknown"}
- Resume in App: ${user.resume ? "Yes" : "No"}
- Resume Preview: ${resumeContent}
- Assessments: ${assessmentSummary}
- Additional Context: ${formData.additionalContext || "None"}

DOMAIN-SPECIFIC EVALUATION NOTES FOR ${domain.toUpperCase()}:
- Skills benchmark: ${criteria.skillsBenchmark}
- Resume focus: ${criteria.resumeNote}
- Interview/assessment: ${criteria.interviewNote}
- LinkedIn/presence: ${criteria.linkedinNote}
- Key extras to consider: ${criteria.extraContext}

SCORING LOGIC:
- Compare skills/experience against typical ${domain} professionals at this experience level
- For IT: weight GitHub, projects, and technical assessments heavily
- For Finance/Accounting: weight certifications (CFA, CPA, CMA) and quantified deal/portfolio experience
- For Marketing: weight campaign results, certifications, and portfolio
- For HR: weight SHRM/PHR certifications and measurable HR outcomes
- For Sales: weight quota attainment, revenue numbers, CRM tool proficiency
- For Healthcare/Legal/Education: weight licenses, certifications, and specialized experience
- Resume with no content = max 40 in resume score
- 0 assessments = max 45 in interview score
- No LinkedIn = max 50 in linkedin/online presence score
- Scale scores realistically — not everyone should score 80+

Respond ONLY with valid JSON, no markdown, no code fences:
{
  "overallScore": <weighted average of category scores>,
  "overallGrade": "<letter grade>",
  "domain": "${domain}",
  "summary": "<2-3 sentence honest career readiness summary specific to ${domain}>",
  "categories": [
    ${categoryTemplates}
  ],
  "skillGaps": [
    {
      "skill": "<skill name specific to ${domain}>",
      "priority": "<high|medium|low>",
      "reason": "<why this skill is critical for ${domain} at their experience level>",
      "linkedFeature": "/guide",
      "linkedFeatureLabel": "Learn This"
    }
  ],
  "actionPlan": {
    "week1": { "theme": "<theme>", "tasks": ["<${domain}-specific task>", "<task>", "<task>"] },
    "week2": { "theme": "<theme>", "tasks": ["<task>", "<task>", "<task>"] },
    "week3": { "theme": "<theme>", "tasks": ["<task>", "<task>", "<task>"] },
    "week4": { "theme": "<theme>", "tasks": ["<task>", "<task>", "<task>"] }
  },
  "topStrength": "<their biggest asset as a ${domain} professional in one sentence>",
  "biggestGap": "<their single most critical gap for ${domain} in one sentence>"
}

Rules:
- status: "strong" (75-100), "good" (55-74), "needs-work" (0-54)
- skillGaps: 3-5 items, all specific to ${domain}
- All tasks in actionPlan must be ${domain}-specific — no generic advice
- overallScore = weighted average (resume 25%, skills 35%, ${criteria.categories[2] || "interview"} 25%, ${criteria.categories[3] || "linkedin"} 15%)`;

    // ── Call Groq ─────────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert career coach specializing in ${domain}. You generate precise, domain-specific career assessments. Respond with valid JSON only.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2500,
    });

    const rawText = completion.choices[0]?.message?.content?.trim();
    if (!rawText) return { success: false, error: "No response from AI. Please try again." };

    // ── Parse JSON ────────────────────────────────────────────
    let scoreData;
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      scoreData = JSON.parse(clean);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try { scoreData = JSON.parse(match[0]); }
        catch { return { success: false, error: "Failed to parse AI response. Please try again." }; }
      } else {
        return { success: false, error: "Failed to parse AI response. Please try again." };
      }
    }

    // Attach domain metadata
    scoreData.domain   = domain;
    scoreData.category = category;

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