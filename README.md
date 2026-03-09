# CareerPilot 🚀

An AI-powered career coaching platform built with Next.js 16, helping professionals with resume building, interview prep, cover letters, and industry insights.

**Live:** [career-pilots.vercel.app](https://career-pilots.vercel.app)

---

## Features

- **AI Resume Builder** — Build and score ATS-optimized resumes with AI feedback
- **ATS Templates** — 5 domain-specific resume templates (Pro: all 5, Free: 1)
- **Cover Letter Generator** — AI-generated cover letters tailored to job descriptions
- **Interview Prep** — Mock interviews with AI scoring and improvement tips
- **Industry Insights** — Real-time salary ranges, growth rates, and market trends
- **Domain Feed** — Curated daily articles and news for your industry
- **Career Score** — Analyze your profile strength across key career dimensions
- **Roadmap Guide** — Personalized career roadmap based on your goals
- **Pro Plan** — Upgrade flow with admin approval system via email

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Clerk v6 |
| Database | Supabase (PostgreSQL) + Prisma 6 |
| AI | Groq (Llama 3.3 70B) |
| Email | Resend |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/petelmahetab/CareerPilots.git
cd CareerPilots
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create `.env` in the root:

```env
# Database (Supabase Transaction Pooler — required for Vercel)
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DATABASE_URL_UNPOOLED="postgresql://postgres:PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# AI
GROQ_API_KEY=gsk_...

# Email
RESEND_API_KEY=re_...
ADMIN_EMAIL=your@email.com
APPROVAL_SECRET=your_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run

```bash
npm run dev
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Set all env variables (use Transaction Pooler URL with `?pgbouncer=true` for `DATABASE_URL`)
4. Set build command: `npx prisma generate && next build`
5. Add `.npmrc` with `legacy-peer-deps=true`

---

## Project Structure

```
├── app/
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── resume/
│   │   ├── ai-cover-letter/
│   │   ├── interview/
│   │   ├── career-score/
│   │   ├── guide/
│   │   └── pricing/
│   ├── api/
│   │   ├── approve-pro/
│   │   └── inngest/
│   └── page.js
├── actions/          # Server actions
├── components/       # UI components
├── prisma/           # Schema & migrations
└── proxy.ts          # Clerk middleware (Next.js 16)
```

---

## License

MIT © [petelmahetab](https://github.com/petelmahetab)
