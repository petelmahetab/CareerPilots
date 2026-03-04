"use client";

import { useState } from "react";
import {
  Check, X, Zap, Star, Lock, ArrowRight,
  FileText, Map, GraduationCap, BarChart2,
  BrainCircuit, Target, Sparkles, Crown,
} from "lucide-react";
import Link from "next/link";

// ── Plan config ───────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "Everything to get started",
    color: "#6b7280",
    Icon: Star,
    cta: "Get Started",
    ctaHref: "/dashboard",
    popular: false,
    features: [
      { label: "AI Resume Builder", included: true, icon: FileText },
      { label: "ATS Score Checker", included: true, icon: Target },
      { label: "Resume Analyzer", included: true, icon: BrainCircuit },
      { label: "Interview Prep Quizzes", included: true, icon: GraduationCap },
      { label: "AI Cover Letter Generator", included: true, icon: FileText },
      { label: "Career Roadmap Generator", included: true, icon: Map },
      { label: "Industry Insights Dashboard", included: true, icon: BarChart2 },
      { label: "AI Career Score Card", included: false, icon: BrainCircuit },
      { label: "30-Day Personalized Action Plan", included: false, icon: Target },
      { label: "Skill Gap Analysis", included: false, icon: Zap },
      { label: "Priority AI responses", included: false, icon: Zap },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹299",
    period: "per month",
    tagline: "For serious job seekers",
    color: "#6366f1",
    Icon: Crown,
    cta: "Upgrade to Pro",
    ctaHref: "/api/checkout",
    popular: true,
    features: [
      { label: "AI Resume Builder", included: true, icon: FileText },
      { label: "ATS Score Checker", included: true, icon: Target },
      { label: "Resume Analyzer", included: true, icon: BrainCircuit },
      { label: "Interview Prep Quizzes", included: true, icon: GraduationCap },
      { label: "AI Cover Letter Generator", included: true, icon: FileText },
      { label: "Career Roadmap Generator", included: true, icon: Map },
      { label: "Industry Insights Dashboard", included: true, icon: BarChart2 },
      { label: "AI Career Score Card", included: true, icon: BrainCircuit },
      { label: "30-Day Personalized Action Plan", included: true, icon: Target },
      { label: "Skill Gap Analysis", included: true, icon: Zap },
      { label: "Priority AI responses", included: true, icon: Zap },
    ],
  },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel anytime from your account settings. You keep Pro access until the end of your billing period.",
  },
  {
    q: "Which payment methods are supported?",
    a: "UPI, credit/debit cards (Visa, Mastercard, RuPay), and net banking via Stripe — the same payment processor used by Amazon and Airbnb.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Payments are processed by Stripe, which is PCI DSS Level 1 certified — the highest level of payment security.",
  },
  {
    q: "What happens after I upgrade?",
    a: "You get immediate access to AI Career Score Card and all Pro features. No waiting, no manual approval.",
  },
];

// ── Pricing Card ─────────────────────────────────────────────
function PricingCard({ plan, isCurrentPlan }) {
  const PlanIcon = plan.Icon;
  return (
    <div
      className="relative rounded-2xl p-6 flex flex-col transition-all duration-300"
      style={{
        background: plan.popular
          ? "linear-gradient(160deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))"
          : "rgba(255,255,255,0.03)",
        border: plan.popular
          ? "1px solid rgba(99,102,241,0.5)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: plan.popular ? "0 0 40px rgba(99,102,241,0.15)" : "none",
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
          style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
        >
          <Sparkles className="w-3 h-3" /> Most Popular
        </div>
      )}

      {/* Plan header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: plan.color + "22" }}
            >
              <PlanIcon className="w-4 h-4" style={{ color: plan.color }} />
            </div>
            <span className="text-white font-bold text-lg">{plan.name}</span>
          </div>
          <p className="text-gray-400 text-xs">{plan.tagline}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white">{plan.price}</div>
          <div className="text-xs text-gray-500">{plan.period}</div>
        </div>
      </div>

      {/* CTA button */}
      <Link
        href={plan.ctaHref}
        className="w-full py-3 rounded-xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 mb-6 transition-all hover:opacity-90"
        style={{
          background: plan.popular
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "rgba(255,255,255,0.08)",
          border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {plan.popular && <Zap className="w-4 h-4" />}
        {plan.cta}
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-4" />

      {/* Features */}
      <div className="space-y-3 flex-1">
        {plan.features.map((feature, i) => {
          const FIcon = feature.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: feature.included ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                }}
              >
                {feature.included
                  ? <Check className="w-3 h-3 text-emerald-400" />
                  : <X className="w-3 h-3 text-gray-600" />}
              </div>
              <span
                className={`text-sm flex items-center gap-1.5 ${feature.included ? "text-gray-300" : "text-gray-600"}`}
              >
                {!feature.included && <Lock className="w-3 h-3 text-gray-700" />}
                {feature.label}
                {feature.label === "AI Career Score Card" && feature.included && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">NEW</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border overflow-hidden transition-all cursor-pointer"
      style={{ borderColor: open ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
      onClick={() => setOpen(p => !p)}
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{q}</span>
        <span className="text-gray-500 flex-shrink-0 text-lg">{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function PricingPage() {
  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-2"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Invest in your <br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>career growth</span>
          </h1>
          <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
            Start free with all core tools. Upgrade to Pro for the AI Career Score Card
            that tells you exactly what's blocking your job search.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-gray-500">
          {["🔒 Secured by Stripe", "💳 UPI & Cards accepted", "❌ Cancel anytime", "⚡ Instant access after payment"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* What Pro unlocks */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-bold text-lg">What Pro unlocks</span>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            The AI Career Score Card is the flagship Pro feature — a complete career health audit in 2 minutes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: BrainCircuit, color: "#6366f1", title: "Career Health Score", desc: "Get scored across Resume, Skills, LinkedIn, Interview Readiness & Job Strategy" },
              { icon: Target, color: "#8b5cf6", title: "30-Day Action Plan", desc: "Week-by-week personalized tasks linked directly to your app tools" },
              { icon: Zap, color: "#3b82f6", title: "Skill Gap Analysis", desc: "See exactly which skills are missing for your target role" },
              { icon: BarChart2, color: "#10b981", title: "Progress Tracking", desc: "Retake anytime and watch your score improve over time" },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + "22" }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}