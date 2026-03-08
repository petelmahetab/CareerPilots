"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ROADMAP_RESOURCES = {
  "Full-Stack": [
    { type: "docs",    label: "MDN Web Docs",                    url: "https://developer.mozilla.org/en-US/docs/Learn" },
    { type: "youtube", label: "Traversy Media",                  url: "https://www.youtube.com/c/TraversyMedia" },
    { type: "course",  label: "The Odin Project",                url: "https://www.theodinproject.com/paths/full-stack-javascript" },
    { type: "docs",    label: "roadmap.sh — Full Stack",         url: "https://roadmap.sh/full-stack" },
    { type: "course",  label: "freeCodeCamp",                    url: "https://www.freecodecamp.org/learn" },
    { type: "youtube", label: "Fireship",                        url: "https://www.youtube.com/c/Fireship" },
  ],
  "Frontend": [
    { type: "docs",    label: "MDN Web Docs",                    url: "https://developer.mozilla.org/en-US/docs/Learn" },
    { type: "youtube", label: "Kevin Powell — CSS",              url: "https://www.youtube.com/kepowob" },
    { type: "course",  label: "freeCodeCamp — Web Design",       url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
    { type: "docs",    label: "React Official Docs",             url: "https://react.dev/learn" },
    { type: "course",  label: "roadmap.sh — Frontend",          url: "https://roadmap.sh/frontend" },
    { type: "docs",    label: "JavaScript.info",                 url: "https://javascript.info" },
  ],
  "Backend": [
    { type: "docs",    label: "Node.js Official Docs",           url: "https://nodejs.org/en/docs" },
    { type: "youtube", label: "Traversy Media — Node.js",        url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4" },
    { type: "course",  label: "roadmap.sh — Backend",           url: "https://roadmap.sh/backend" },
    { type: "docs",    label: "Express.js Guide",                url: "https://expressjs.com/en/guide/routing.html" },
    { type: "course",  label: "freeCodeCamp — APIs",             url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/" },
    { type: "docs",    label: "PostgreSQL Tutorial",             url: "https://www.postgresqltutorial.com" },
  ],
  "Data Science": [
    { type: "course",  label: "Kaggle Learn",                    url: "https://www.kaggle.com/learn" },
    { type: "youtube", label: "StatQuest",                       url: "https://www.youtube.com/c/joshstarmer" },
    { type: "docs",    label: "Pandas Docs",                     url: "https://pandas.pydata.org/docs/user_guide/index.html" },
    { type: "course",  label: "freeCodeCamp — Data Analysis",    url: "https://www.freecodecamp.org/learn/data-analysis-with-python/" },
    { type: "course",  label: "Google ML Crash Course",          url: "https://developers.google.com/machine-learning/crash-course" },
    { type: "docs",    label: "roadmap.sh — Data Science",       url: "https://roadmap.sh/ai-data-scientist" },
  ],
  "AI/ML": [
    { type: "course",  label: "fast.ai — Practical Deep Learning", url: "https://course.fast.ai" },
    { type: "youtube", label: "Andrej Karpathy — Zero to Hero",  url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" },
    { type: "docs",    label: "PyTorch Tutorials",               url: "https://pytorch.org/tutorials/" },
    { type: "youtube", label: "3Blue1Brown — Neural Networks",   url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi" },
    { type: "docs",    label: "Hugging Face NLP Course",         url: "https://huggingface.co/learn/nlp-course/chapter1/1" },
    { type: "course",  label: "Kaggle — Intro to ML",            url: "https://www.kaggle.com/learn/intro-to-machine-learning" },
  ],
  "DevOps": [
    { type: "docs",    label: "roadmap.sh — DevOps",             url: "https://roadmap.sh/devops" },
    { type: "youtube", label: "TechWorld with Nana",             url: "https://www.youtube.com/c/TechWorldwithNana" },
    { type: "docs",    label: "Docker Get Started",              url: "https://docs.docker.com/get-started/" },
    { type: "docs",    label: "Kubernetes Tutorials",            url: "https://kubernetes.io/docs/tutorials/" },
    { type: "course",  label: "AWS Free Training",               url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/" },
    { type: "youtube", label: "Fireship — Docker 100s",          url: "https://www.youtube.com/watch?v=Gjnup-PuquQ" },
  ],
  "Cybersecurity": [
    { type: "course",  label: "TryHackMe",                       url: "https://tryhackme.com" },
    { type: "docs",    label: "roadmap.sh — Cybersecurity",      url: "https://roadmap.sh/cyber-security" },
    { type: "youtube", label: "NetworkChuck",                    url: "https://www.youtube.com/c/NetworkChuck" },
    { type: "course",  label: "PortSwigger Web Academy",         url: "https://portswigger.net/web-security" },
    { type: "docs",    label: "OWASP Top 10",                    url: "https://owasp.org/www-project-top-ten/" },
    { type: "youtube", label: "John Hammond",                    url: "https://www.youtube.com/c/JohnHammond010" },
  ],
  "Finance": [
    { type: "course",  label: "Khan Academy — Finance",          url: "https://www.khanacademy.org/economics-finance-domain/core-finance" },
    { type: "docs",    label: "Investopedia — Finance",          url: "https://www.investopedia.com/financial-term-dictionary-4769738" },
    { type: "course",  label: "CFI Free Courses",                url: "https://corporatefinanceinstitute.com/free-courses/" },
    { type: "youtube", label: "YouTube — Finance Career",        url: "https://www.youtube.com/results?search_query=finance+career+roadmap" },
    { type: "course",  label: "Coursera — Financial Markets",    url: "https://www.coursera.org/learn/financial-markets-global" },
    { type: "docs",    label: "Investopedia — Investing Basics", url: "https://www.investopedia.com/investing-4427685" },
  ],
  "Banking": [
    { type: "course",  label: "Khan Academy — Banking & Money",  url: "https://www.khanacademy.org/economics-finance-domain/core-finance/money-and-banking" },
    { type: "docs",    label: "Investopedia — Banking",          url: "https://www.investopedia.com/banking-4427754" },
    { type: "youtube", label: "YouTube — Banking Career",        url: "https://www.youtube.com/results?search_query=banking+career+path+guide" },
    { type: "course",  label: "CFI — Banking Career Path",       url: "https://corporatefinanceinstitute.com/resources/career/investment-banking-career-path/" },
    { type: "course",  label: "Coursera — Business & Finance",   url: "https://www.coursera.org/learn/wharton-business-financial-modeling" },
    { type: "docs",    label: "Investopedia — How Banks Work",   url: "https://www.investopedia.com/articles/basics/07/banking.asp" },
  ],
  "Marketing": [
    { type: "course",  label: "Google Digital Garage",           url: "https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing" },
    { type: "course",  label: "HubSpot Academy",                 url: "https://academy.hubspot.com/" },
    { type: "youtube", label: "YouTube — Digital Marketing",     url: "https://www.youtube.com/results?search_query=digital+marketing+roadmap+beginners" },
    { type: "docs",    label: "Neil Patel Blog",                 url: "https://neilpatel.com/blog/" },
    { type: "docs",    label: "Moz — SEO Learning Center",       url: "https://moz.com/learn/seo" },
    { type: "course",  label: "Coursera — Marketing Analytics",  url: "https://www.coursera.org/learn/marketing-analytics" },
  ],
  "HR": [
    { type: "docs",    label: "SHRM — HR Topics",                url: "https://www.shrm.org/topics-tools/topics" },
    { type: "course",  label: "Coursera — HR Management",        url: "https://www.coursera.org/learn/human-resource-management" },
    { type: "youtube", label: "YouTube — HR Career Roadmap",     url: "https://www.youtube.com/results?search_query=hr+career+path+roadmap" },
    { type: "docs",    label: "Indeed — HR Career Guide",        url: "https://www.indeed.com/career-advice/finding-a-job/hr-interview-questions" },
    { type: "docs",    label: "OPM — HR Resources",              url: "https://www.opm.gov/policy-data-oversight/" },
    { type: "youtube", label: "YouTube — HR Interview Questions", url: "https://www.youtube.com/results?search_query=hr+interview+questions+answers" },
  ],
  "Sales": [
    { type: "docs",    label: "HubSpot Blog — Sales",            url: "https://blog.hubspot.com/sales" },
    { type: "course",  label: "Salesforce Trailhead",            url: "https://trailhead.salesforce.com/content/learn/trails/build-your-sales-skills" },
    { type: "youtube", label: "YouTube — Sales Career Roadmap",  url: "https://www.youtube.com/results?search_query=sales+career+roadmap+beginners" },
    { type: "course",  label: "Coursera — Art of Sales",         url: "https://www.coursera.org/specializations/the-art-of-sales-mastering-the-selling-process" },
    { type: "docs",    label: "Close.io — Sales Resources",      url: "https://www.close.com/resources/" },
    { type: "youtube", label: "YouTube — Consultative Selling",  url: "https://www.youtube.com/results?search_query=consultative+selling+techniques" },
  ],
  "Healthcare": [
    { type: "docs",    label: "WHO — Health Topics",             url: "https://www.who.int/health-topics" },
    { type: "course",  label: "Coursera — Healthcare Mgmt",      url: "https://www.coursera.org/learn/healthcare-management" },
    { type: "youtube", label: "YouTube — Healthcare Career",     url: "https://www.youtube.com/results?search_query=healthcare+career+path+guide" },
    { type: "course",  label: "Khan Academy — Health & Medicine", url: "https://www.khanacademy.org/science/health-and-medicine" },
    { type: "docs",    label: "MedlinePlus Encyclopedia",        url: "https://medlineplus.gov/encyclopedia.html" },
    { type: "docs",    label: "CDC Resources",                   url: "https://www.cdc.gov/" },
  ],
  "Education": [
    { type: "docs",    label: "Edutopia — Teaching",             url: "https://www.edutopia.org/" },
    { type: "course",  label: "Coursera — Education for All",    url: "https://www.coursera.org/learn/education-for-all" },
    { type: "youtube", label: "YouTube — Teaching Career",       url: "https://www.youtube.com/results?search_query=teaching+career+roadmap+guide" },
    { type: "docs",    label: "Khan Academy for Teachers",       url: "https://www.khanacademy.org/" },
    { type: "docs",    label: "TeachThought Resources",          url: "https://www.teachthought.com/" },
    { type: "course",  label: "Google Teach From Home",          url: "https://teachfromhome.google/intl/en/" },
  ],
  "Legal": [
    { type: "docs",    label: "Cornell Law — Legal Dictionary",  url: "https://www.law.cornell.edu/wex" },
    { type: "course",  label: "Coursera — Intro to Law",         url: "https://www.coursera.org/learn/intro-to-law" },
    { type: "youtube", label: "YouTube — Law Career Roadmap",    url: "https://www.youtube.com/results?search_query=law+career+path+roadmap" },
    { type: "docs",    label: "Legal Information Institute",     url: "https://www.law.cornell.edu/" },
    { type: "docs",    label: "FindLaw — Legal Topics",          url: "https://www.findlaw.com/" },
    { type: "course",  label: "edX — Introduction to Law",      url: "https://www.edx.org/learn/law" },
  ],
  "Accounting": [
    { type: "course",  label: "AccountingCoach — Free Lessons",  url: "https://www.accountingcoach.com/" },
    { type: "youtube", label: "YouTube — Accounting Career",     url: "https://www.youtube.com/results?search_query=accounting+career+path+roadmap" },
    { type: "docs",    label: "Investopedia — Accounting",       url: "https://www.investopedia.com/accounting-4427688" },
    { type: "course",  label: "Khan Academy — Accounting",       url: "https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-statements" },
    { type: "docs",    label: "ACCA Study Resources",            url: "https://www.accaglobal.com/gb/en/student/exam-support-resources.html" },
    { type: "course",  label: "Coursera — Financial Accounting", url: "https://www.coursera.org/learn/financial-accounting" },
  ],
};

function getResources(domain, count = 3) {
  const pool = ROADMAP_RESOURCES[domain] || ROADMAP_RESOURCES["Full-Stack"];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export async function generateRoadmap({ domain, experience, goal }) {
  const prompt = `You are a world-class career mentor. Generate a learning roadmap for "${domain}".

User profile:
- Experience: ${experience}
- Goal: ${goal || `Build a strong career in ${domain}`}

Return ONLY valid JSON, no markdown, no backticks:
{
  "title": "string",
  "domain": "${domain}",
  "totalWeeks": number,
  "overview": "2-3 sentences",
  "phases": [
    {
      "phase": 1,
      "title": "string",
      "weeks": "Week 1-2",
      "description": "string",
      "topics": [
        { "name": "string", "description": "string", "estimatedHours": number }
      ]
    }
  ],
  "finalProject": { "title": "string", "description": "string", "techStack": ["string"] },
  "jobReadyChecklist": ["string"]
}

Rules: 4-6 phases, 3-5 topics each. Scale to ${experience}. No URLs.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4000,
    temperature: 0.5,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content || "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let roadmap;
  try {
    roadmap = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) roadmap = JSON.parse(match[0]);
    else throw new Error("Failed to parse roadmap. Please try again.");
  }

  roadmap.phases = roadmap.phases?.map((phase) => ({
    ...phase,
    topics: phase.topics?.map((topic) => ({
      ...topic,
      resources: getResources(domain, 3),
    })),
  }));

  return roadmap;
}