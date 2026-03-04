"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateRoadmap({ domain, experience, goal }) {
  const prompt = `You are a world-class career mentor. Generate a detailed, week-by-week learning roadmap for someone who wants to become job-ready in "${domain}".

User profile:
- Experience level: ${experience}
- Goal: ${goal || "Get a job as a " + domain + " developer"}

Return ONLY a valid JSON object with this exact structure (no markdown, no backticks, no extra text):
{
  "title": "string - e.g. Full-Stack Developer Roadmap",
  "domain": "${domain}",
  "totalWeeks": number,
  "overview": "2-3 sentence summary of what they will learn",
  "phases": [
    {
      "phase": 1,
      "title": "string - phase name",
      "weeks": "string - e.g. Week 1-2",
      "description": "string - what this phase covers",
      "topics": [
        {
          "name": "string - topic name",
          "description": "string - 1 sentence what to learn",
          "estimatedHours": number,
          "resources": [
            {
              "type": "docs",
              "label": "string - resource name",
              "url": "string - REAL working URL"
            },
            {
              "type": "youtube",
              "label": "string - YouTube video/channel name",
              "url": "string - REAL YouTube URL like https://www.youtube.com/watch?v=..."
            },
            {
              "type": "course",
              "label": "string - course name",
              "url": "string - REAL URL to freeCodeCamp, The Odin Project, roadmap.sh etc"
            }
          ]
        }
      ]
    }
  ],
  "finalProject": {
    "title": "string - capstone project name",
    "description": "string - what to build",
    "techStack": ["string"]
  },
  "jobReadyChecklist": ["string - checklist items like portfolio, resume, LinkedIn etc"]
}

Use REAL, working URLs only. For YouTube, use real popular tutorial videos. For docs use official documentation. For courses use free resources like freeCodeCamp, The Odin Project, roadmap.sh, MDN, official docs. Generate 4-6 phases with 3-5 topics each. Be specific and practical.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4000,
    temperature: 0.4,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content || "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse roadmap. Please try again.");
  }
}