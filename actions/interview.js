"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Detect IT domain ──────────────────────────────────────────
function isITDomain(industry = "") {
  const lower = industry.toLowerCase();
  const itKeywords = [
    "tech", "software", "engineering", "data", "cyber",
    "developer", "devops", "cloud", "ai", "ml", "web",
    "mobile", "backend", "frontend", "fullstack", "full-stack",
    "information", "computer", "programming", "coding",
  ];
  return itKeywords.some((kw) => lower.includes(kw));
}

// ── Verified free resource links per domain ───────────────────
// These are real, always-free, no-login-required links
const DOMAIN_RESOURCES = {
  // ── Finance / Banking ──────────────────────────────────────
  finance: [
    { label: "Investopedia — Financial Concepts",        url: "https://www.investopedia.com/financial-term-dictionary-4769738", type: "article" },
    { label: "Khan Academy — Finance & Capital Markets", url: "https://www.khanacademy.org/economics-finance-domain/core-finance", type: "video" },
    { label: "CFA Institute — Free Learning Resources",  url: "https://www.cfainstitute.org/en/research/foundation", type: "docs" },
    { label: "Investopedia — Banking Basics",            url: "https://www.investopedia.com/banking-4427754", type: "article" },
    { label: "YouTube — Finance Interview Prep",         url: "https://www.youtube.com/results?search_query=finance+interview+questions", type: "video" },
    { label: "Corporate Finance Institute — Free Courses", url: "https://corporatefinanceinstitute.com/free-courses/", type: "docs" },
  ],
  banking: [
    { label: "Investopedia — Banking & Loans",           url: "https://www.investopedia.com/banking-4427754", type: "article" },
    { label: "Khan Academy — Banking and Money",         url: "https://www.khanacademy.org/economics-finance-domain/core-finance/money-and-banking", type: "video" },
    { label: "RBI Learning — Banking Basics (India)",    url: "https://www.rbi.org.in/scripts/FS_Overview.aspx?fn=2752", type: "docs" },
    { label: "YouTube — Banking Interview Questions",    url: "https://www.youtube.com/results?search_query=banking+interview+questions", type: "video" },
    { label: "Investopedia — How Banks Work",            url: "https://www.investopedia.com/articles/basics/07/banking.asp", type: "article" },
    { label: "FFIEC — Banking Study Materials",          url: "https://www.ffiec.gov/exam/index.htm", type: "docs" },
  ],
  // ── HR / Human Resources ──────────────────────────────────
  hr: [
    { label: "SHRM — HR Topics & Glossary",              url: "https://www.shrm.org/topics-tools/topics", type: "docs" },
    { label: "YouTube — HR Interview Questions",         url: "https://www.youtube.com/results?search_query=hr+interview+questions+answers", type: "video" },
    { label: "Indeed — HR Career Guide",                 url: "https://www.indeed.com/career-advice/finding-a-job/hr-interview-questions", type: "article" },
    { label: "Coursera — Human Resource Management (Free Audit)", url: "https://www.coursera.org/learn/human-resource-management", type: "docs" },
    { label: "YouTube — HR Management Concepts",        url: "https://www.youtube.com/results?search_query=human+resource+management+concepts", type: "video" },
    { label: "OPM — HR Practitioner Resources",         url: "https://www.opm.gov/policy-data-oversight/classification-qualifications/", type: "docs" },
  ],
  // ── Marketing ─────────────────────────────────────────────
  marketing: [
    { label: "Google Digital Garage — Free Marketing Course", url: "https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing", type: "docs" },
    { label: "HubSpot Academy — Free Marketing Certifications", url: "https://academy.hubspot.com/", type: "docs" },
    { label: "YouTube — Digital Marketing Interview Questions", url: "https://www.youtube.com/results?search_query=digital+marketing+interview+questions", type: "video" },
    { label: "Neil Patel Blog — Marketing Guides",       url: "https://neilpatel.com/blog/", type: "article" },
    { label: "Moz — SEO Learning Center",                url: "https://moz.com/learn/seo", type: "docs" },
    { label: "Think with Google — Marketing Insights",   url: "https://www.thinkwithgoogle.com/", type: "article" },
  ],
  // ── Healthcare / Medical ───────────────────────────────────
  healthcare: [
    { label: "WHO — Health Topics A-Z",                  url: "https://www.who.int/health-topics", type: "docs" },
    { label: "YouTube — Healthcare Interview Questions", url: "https://www.youtube.com/results?search_query=healthcare+interview+questions", type: "video" },
    { label: "MedlinePlus — Medical Encyclopedia",       url: "https://medlineplus.gov/encyclopedia.html", type: "article" },
    { label: "Coursera — Healthcare Management (Free)",  url: "https://www.coursera.org/learn/healthcare-management", type: "docs" },
    { label: "CDC — Health & Clinical Resources",        url: "https://www.cdc.gov/", type: "docs" },
    { label: "NCBI — Free Medical Research Papers",      url: "https://www.ncbi.nlm.nih.gov/", type: "article" },
  ],
  // ── Education / Teaching ──────────────────────────────────
  education: [
    { label: "Edutopia — Teaching Strategies",           url: "https://www.edutopia.org/", type: "article" },
    { label: "YouTube — Teaching Interview Questions",   url: "https://www.youtube.com/results?search_query=teacher+interview+questions+and+answers", type: "video" },
    { label: "Khan Academy — Free Teaching Resources",   url: "https://www.khanacademy.org/", type: "docs" },
    { label: "TeachThought — Pedagogy Resources",        url: "https://www.teachthought.com/", type: "article" },
    { label: "Coursera — Education for All (Free)",      url: "https://www.coursera.org/learn/education-for-all", type: "docs" },
    { label: "YouTube — Classroom Management Tips",      url: "https://www.youtube.com/results?search_query=classroom+management+strategies+teachers", type: "video" },
  ],
  // ── Sales ─────────────────────────────────────────────────
  sales: [
    { label: "HubSpot Blog — Sales Guides",              url: "https://blog.hubspot.com/sales", type: "article" },
    { label: "YouTube — Sales Interview Questions",      url: "https://www.youtube.com/results?search_query=sales+interview+questions+and+answers", type: "video" },
    { label: "Salesforce Trailhead — Free Sales Training", url: "https://trailhead.salesforce.com/content/learn/trails/build-your-sales-skills", type: "docs" },
    { label: "LinkedIn Sales Blog",                      url: "https://www.linkedin.com/business/sales/blog", type: "article" },
    { label: "YouTube — Consultative Selling Techniques", url: "https://www.youtube.com/results?search_query=consultative+selling+techniques", type: "video" },
    { label: "Close.io — Sales Resources",               url: "https://www.close.com/resources/", type: "docs" },
  ],
  // ── Law / Legal ───────────────────────────────────────────
  legal: [
    { label: "Cornell Law School — Free Legal Dictionary", url: "https://www.law.cornell.edu/wex", type: "docs" },
    { label: "YouTube — Law Interview Questions",        url: "https://www.youtube.com/results?search_query=law+interview+questions+answers", type: "video" },
    { label: "FindLaw — Legal Topics",                   url: "https://www.findlaw.com/", type: "article" },
    { label: "Coursera — Introduction to Law (Free)",    url: "https://www.coursera.org/learn/intro-to-law", type: "docs" },
    { label: "Legal Information Institute (LII)",        url: "https://www.law.cornell.edu/", type: "docs" },
    { label: "YouTube — Legal Concepts Explained",       url: "https://www.youtube.com/results?search_query=legal+concepts+explained+simply", type: "video" },
  ],
  // ── Accounting ────────────────────────────────────────────
  accounting: [
    { label: "AccountingCoach — Free Accounting Lessons", url: "https://www.accountingcoach.com/", type: "docs" },
    { label: "YouTube — Accounting Interview Questions", url: "https://www.youtube.com/results?search_query=accounting+interview+questions+answers", type: "video" },
    { label: "Investopedia — Accounting Basics",         url: "https://www.investopedia.com/accounting-4427688", type: "article" },
    { label: "Khan Academy — Accounting & Financial Statements", url: "https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-statements", type: "video" },
    { label: "ACCA — Free Study Resources",              url: "https://www.accaglobal.com/gb/en/student/exam-support-resources.html", type: "docs" },
    { label: "CPA Exam Free Notes — AICPA",              url: "https://www.aicpa-cima.com/resources", type: "docs" },
  ],
  // ── Default fallback for any other domain ─────────────────
  default: [
    { label: "YouTube — Interview Questions & Answers",  url: "https://www.youtube.com/results?search_query=interview+questions+and+answers", type: "video" },
    { label: "Indeed — Interview Preparation Guide",     url: "https://www.indeed.com/career-advice/interviewing", type: "article" },
    { label: "Glassdoor — Interview Questions Database", url: "https://www.glassdoor.com/Interview/index.htm", type: "article" },
    { label: "LinkedIn Learning — Free Trial Courses",   url: "https://www.linkedin.com/learning/", type: "docs" },
    { label: "Coursera — Career Development (Free Audit)", url: "https://www.coursera.org/browse/personal-development", type: "docs" },
    { label: "YouTube — How to Answer Common Interview Questions", url: "https://www.youtube.com/results?search_query=common+interview+questions+how+to+answer", type: "video" },
  ],
};

function getResourcesForDomain(industry = "") {
  const lower = industry.toLowerCase();
  if (lower.includes("financ"))    return DOMAIN_RESOURCES.finance;
  if (lower.includes("bank"))      return DOMAIN_RESOURCES.banking;
  if (lower.includes("hr") || lower.includes("human resource")) return DOMAIN_RESOURCES.hr;
  if (lower.includes("market"))    return DOMAIN_RESOURCES.marketing;
  if (lower.includes("health") || lower.includes("medic")) return DOMAIN_RESOURCES.healthcare;
  if (lower.includes("educat") || lower.includes("teach")) return DOMAIN_RESOURCES.education;
  if (lower.includes("sales"))     return DOMAIN_RESOURCES.sales;
  if (lower.includes("legal") || lower.includes("law")) return DOMAIN_RESOURCES.legal;
  if (lower.includes("account"))   return DOMAIN_RESOURCES.accounting;
  return DOMAIN_RESOURCES.default;
}

// ── Pick 3 random resources from the pool ────────────────────
function pickResources(pool, count = 3) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}


export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true, experience: true },
  });

  if (!user) throw new Error("User not found");

  const seed = Math.random().toString(36).substring(7);
  const expLabel =
    !user.experience || user.experience === 0 ? "fresher/beginner" :
    user.experience <= 2                       ? `${user.experience} year` :
    user.experience <= 5                       ? "mid-level (3-5 years)" :
                                                  "senior (5+ years)";

  const skillsText = user.skills?.length
    ? `Their skills include: ${user.skills.join(", ")}.`
    : "";

  // ── IT Domain ─────────────────────────────────────────────
  if (isITDomain(user.industry)) {
    const prompt = `
You are a senior technical interviewer. Generate a quiz for a ${expLabel} ${user.industry} developer.
${skillsText}
Session: ${seed}

Generate EXACTLY 10 questions:
- 7 MCQ: real practical interview questions, not trivial
- 3 OUTPUT-BASED: show code, ask what it prints. Use ${user.skills?.[0] || "JavaScript"}. Keep code 5-10 lines. Use closures/async/scope gotchas.

Difficulty based on ${expLabel}:
- Fresher: fundamentals, basic syntax
- 1-2yr: patterns, frameworks
- Mid: architecture, performance
- Senior: system design, tradeoffs

Return ONLY valid JSON, no markdown:
{
  "questions": [
    {
      "type": "mcq",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string (must exactly match one option)",
      "explanation": "string"
    },
    {
      "type": "output",
      "question": "What is the output of the following code?",
      "code": "code here",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string (must exactly match one option)",
      "explanation": "string explaining why"
    }
  ]
}`;

    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.0,
      max_tokens: 3000,
    });

    const clean = res.choices[0].message.content.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(clean);
    return { questions: parsed.questions, isIT: true, domain: user.industry };
  }

  // ── Non-IT Domain ─────────────────────────────────────────
  // Groq generates topic names + key points ONLY — NO URLs
  const prompt = `
You are an expert interview coach for ${user.industry} professionals.
${skillsText}
Experience level: ${expLabel}.
Session: ${seed}

Generate:
- 8 MCQ: most commonly asked ${user.industry} interview questions. Practical, scenario-based.
- 2 theoretical study topics: most important topics interviewers ask about in ${user.industry}

For theoretical topics: provide topic name, why it's important, and 3 key points to cover.
DO NOT include any URLs or links. Only topic names and key points.

Return ONLY valid JSON, no markdown:
{
  "questions": [
    {
      "type": "mcq",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string (must exactly match one option)",
      "explanation": "string"
    }
  ],
  "theoreticalTopics": [
    {
      "topic": "string",
      "whyImportant": "string (1-2 sentences)",
      "keyPoints": ["point 1", "point 2", "point 3"]
    }
  ]
}`;

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 1.0,
    max_tokens: 3000,
  });

  const clean = res.choices[0].message.content.replace(/```(?:json)?\n?/g, "").trim();
  const parsed = JSON.parse(clean);

  // ── Attach REAL hardcoded resources to each topic ─────────
  const resourcePool = getResourcesForDomain(user.industry);
  const theoreticalTopics = (parsed.theoreticalTopics || []).map((t) => ({
    ...t,
    resources: pickResources(resourcePool, 3),
  }));

  return {
    questions:         parsed.questions,
    theoreticalTopics,
    isIT:              false,
    domain:            user.industry,
  };
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, i) => ({
    question:    q.question,
    answer:      q.correctAnswer,
    userAnswer:  answers[i],
    isCorrect:   q.correctAnswer === answers[i],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongText = wrongAnswers
      .map((q) => `Q: "${q.question}"\nCorrect: "${q.answer}"\nUser answered: "${q.userAnswer}"`)
      .join("\n\n");

    try {
      const tipRes = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `These ${user.industry} interview questions were answered wrong:\n\n${wrongText}\n\nGive a concise encouraging improvement tip (max 2 sentences). Focus on what to study, not the mistakes.`,
        }],
        max_tokens: 150,
      });
      improvementTip = tipRes.choices[0].message.content.trim();
    } catch (e) {
      console.error("Tip generation failed:", e);
    }
  }

  const assessment = await db.assessment.create({
    data: {
      userId:         user.id,
      quizScore:      score,
      questions:      questionResults,
      category:       "Technical",
      improvementTip,
    },
  });

  return assessment;
}


export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return await db.assessment.findMany({
    where:   { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
}