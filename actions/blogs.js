"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Domain label from industry string ────────────────────────
function getDomainLabel(industry = "") {
  const l = industry.toLowerCase();
  if (l.includes("frontend") || l.includes("front-end")) return "Frontend Development";
  if (l.includes("backend") || l.includes("back-end")) return "Backend Development";
  if (l.includes("full") || l.includes("stack")) return "Full-Stack Development";
  if (l.includes("data science") || l.includes("data analyst")) return "Data Science";
  if (l.includes("machine learning") || l.includes("ai/ml") || l.includes(" ml ")) return "AI and Machine Learning";
  if (l.includes("devops") || l.includes("cloud") || l.includes("sre")) return "DevOps and Cloud Engineering";
  if (l.includes("cyber") || l.includes("security") || l.includes("infosec")) return "Cybersecurity";
  if (l.includes("mobile") || l.includes("android") || l.includes("ios")) return "Mobile Development";
  if (l.includes("financ") || l.includes("investment") || l.includes("equity")) return "Finance and Investment";
  if (l.includes("bank") || l.includes("treasury")) return "Banking";
  if (l.includes("account") || l.includes("audit") || l.includes("cpa")) return "Accounting";
  if (l.includes("market") || l.includes("seo") || l.includes("brand") || l.includes("advertis")) return "Digital Marketing";
  if (l.includes("hr") || l.includes("human resource") || l.includes("recruit")) return "Human Resources";
  if (l.includes("sales") || l.includes("business development")) return "Sales and Business Development";
  if (l.includes("health") || l.includes("medic") || l.includes("clinical")) return "Healthcare";
  if (l.includes("legal") || l.includes("law") || l.includes("compliance")) return "Legal and Compliance";
  if (l.includes("educat") || l.includes("teach")) return "Education";
  if (l.includes("product")) return "Product Management";
  if (l.includes("design") || l.includes("ux") || l.includes("ui")) return "UX/UI Design";
  return industry || "Technology";
}

// ── Real browse URLs per domain ───────────────────────────────
const DOMAIN_SOURCES = {
  "Frontend Development": "https://dev.to/t/javascript",
  "Backend Development": "https://dev.to/t/backend",
  "Full-Stack Development": "https://dev.to/t/webdev",
  "Data Science": "https://www.kaggle.com/discussions",
  "AI and Machine Learning": "https://huggingface.co/blog",
  "DevOps and Cloud Engineering": "https://dev.to/t/devops",
  "Cybersecurity": "https://www.bleepingcomputer.com",
  "Mobile Development": "https://dev.to/t/mobile",
  "Finance and Investment": "https://www.investopedia.com/news",
  "Banking": "https://www.bankingdive.com",
  "Accounting": "https://www.accountingtoday.com",
  "Digital Marketing": "https://www.searchenginejournal.com",
  "Human Resources": "https://www.shrm.org/topics-tools/news",
  "Sales and Business Development": "https://blog.hubspot.com/sales",
  "Healthcare": "https://www.healthcareitnews.com",
  "Legal and Compliance": "https://www.law.com",
  "Education": "https://www.edutopia.org",
  "Product Management": "https://www.productboard.com/blog",
  "UX/UI Design": "https://uxdesign.cc",
};

// ── Generate articles via Groq ────────────────────────────────
async function fetchArticlesViaGroq(domain) {
  const sourceUrl = DOMAIN_SOURCES[domain] || "https://dev.to";

  const prompt = `You are a ${domain} industry curator. Generate 6 realistic, highly relevant knowledge items for ${domain} professionals — covering the latest trends, tools, tutorials, and news as of early 2025.

Mix types: 2 articles, 1 tool, 1 tutorial, 1 news item, 1 tip/guide.

Return ONLY a valid JSON array — no markdown, no code fences:
[
  {
    "title": "specific, realistic title a professional would click",
    "source": "realistic source name (e.g. Dev.to, Medium, TechCrunch, HBR, SHRM, Investopedia)",
    "summary": "1-2 sentence description of what this covers and why it matters for ${domain} professionals",
    "type": "article OR tool OR news OR tutorial",
    "publishedDate": "one of: Today, Yesterday, 2 days ago, 3 days ago, This week, Last week",
    "readTime": "one of: 3 min read, 5 min read, 7 min read, 10 min read"
  }
]

Rules:
- All 6 must be specifically relevant to ${domain}
- Titles must sound like real published content professionals would read
- Sources must be real, well-known publications for ${domain}
- Summaries must be concrete and specific — no vague descriptions
- Mix publishedDate values across all 6 items`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2000,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are a ${domain} industry expert and content curator. Generate realistic, specific, genuinely useful content. Return only valid JSON.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content || "";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Could not parse articles from AI response");

  const articles = JSON.parse(match[0]);
  if (!Array.isArray(articles) || articles.length === 0) throw new Error("No articles returned");

  return articles.map((a) => ({
    title: a.title || "Untitled",
    url: `https://www.google.com/search?q=${encodeURIComponent(a.title)}&tbm=nws`,
    source: a.source || "Web",
    summary: a.summary || "",
    type: a.type || "article",
    publishedDate: a.publishedDate || "Recent",
    readTime: a.readTime || "5 min read",
  }));
}

// ── Main exported action ──────────────────────────────────────
export async function getDomainFeed(forceRefresh = false) {
  try {
    const { userId } = await auth();
    if (!userId) return { articles: [], domain: "", industry: "", error: null };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    if (!user?.industry) {
      return { articles: [], domain: "", industry: "", error: null };
    }

    const industry = user.industry;
    const domain = getDomainLabel(industry);

    // ── Check 24h cache ───────────────────────────────────────
    let cached = null;
    try {
      cached = await db.domainFeed.findUnique({ where: { industry } });
    } catch {
      // Table may not exist yet if migration hasn't run
    }

    const now = new Date();
    const isStale = !cached || new Date(cached.nextUpdate) < now || forceRefresh;

    if (!isStale && cached) {
      return {
        articles: cached.articles,
        domain,
        industry,
        lastFetched: cached.lastFetched,
        cached: true,
        error: null,
      };
    }

    // ── Generate fresh via Groq ───────────────────────────────
    const articles = await fetchArticlesViaGroq(domain);
    const nextUpdate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // ── Cache to DB ───────────────────────────────────────────
    try {
      await db.domainFeed.upsert({
        where: { industry },
        update: { articles, lastFetched: now, nextUpdate },
        create: { industry, articles, lastFetched: now, nextUpdate },
      });
    } catch (dbErr) {
      console.warn("DomainFeed DB save skipped:", dbErr.message);
    }

    return { articles, domain, industry, lastFetched: now, cached: false, error: null };

  } catch (error) {
    console.error("getDomainFeed error:", error);
    return { articles: [], domain: "", industry: "", error: error.message, cached: false };
  }
}