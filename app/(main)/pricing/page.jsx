"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Check, X, Zap, Star, Lock, ArrowRight,
  FileText, Map, GraduationCap, BarChart2,
  BrainCircuit, Target, Sparkles, Crown,
  Loader2, CheckCircle2, Send, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { submitProRequest } from "@/actions/subscription";

// ── Plan config ───────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "",
    period: "",
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
    price: "",
    period: "",
    tagline: "For serious job seekers",
    color: "#6366f1",
    Icon: Crown,
    cta: "Get Pro Access",
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
    q: "How do I get Pro access?",
    a: "Click 'Get Pro Access', tell us why you want Pro. Your name and email are auto-filled from your account. We review every request and approve within 24 hours.",
  },
  {
    q: "Is my request always approved?",
    a: "Yes — we approve all genuine requests. This process helps us understand our users better during the early access phase.",
  },
  {
    q: "What happens after I'm approved?",
    a: "You'll get an email confirmation on your registered email. Sign in and you'll have immediate access to AI Career Score Card and all Pro features.",
  },
  {
    q: "Will Pro stay free forever?",
    a: "Early access users keep their Pro benefits. Pricing will be introduced later for new users — early adopters are locked in.",
  },
];

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
};

const lockedInputStyle = {
  ...inputStyle,
  background: "rgba(255,255,255,0.02)",
  color: "#6b7280",
  cursor: "not-allowed",
  border: "1px solid rgba(255,255,255,0.05)",
};

// ── Pro Request Modal ─────────────────────────────────────────
function ProRequestModal({ onClose }) {

  const { user } = useUser();
  const clerkName = user?.fullName || user?.firstName || "";
  const clerkEmail = user?.primaryEmailAddress?.emailAddress || "";

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    // Pass Clerk's name and email — user can't fake these
    const res = await submitProRequest({
      name: clerkName,
      email: clerkEmail,
      reason,
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: "#111", border: "1px solid rgba(99,102,241,0.4)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.2)" }}
          >
            <Crown className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-white font-bold">Request Pro Access</div>
            <div className="text-xs text-gray-400">
              We review & approve within 24 hours
            </div>
          </div>
        </div>

        {/* Success state */}
        {result?.success ? (
          <div className="space-y-4 py-2">
            <div
              className="p-4 rounded-xl flex items-start gap-3"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-emerald-400 text-sm font-semibold">
                  Request submitted!
                </div>
                <div className="text-emerald-300/70 text-xs mt-1">
                  {result.message}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-semibold text-gray-400 border border-white/10 hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Error */}
            {result?.error && (
              <div
                className="p-3 rounded-xl text-xs text-red-400"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {result.error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-3">

           
              <div>
                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5 block">
                  Full Name
                  <span className="flex items-center gap-1 text-indigo-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span style={{ fontSize: "10px" }}>from your account</span>
                  </span>
                </label>
                <input
                  value={clerkName}
                  readOnly
                  style={lockedInputStyle}
                />
              </div>

  
              <div>
                <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5 block">
                  Email Address
                  <span className="flex items-center gap-1 text-indigo-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span style={{ fontSize: "10px" }}>from your account</span>
                  </span>
                </label>
                <input
                  value={clerkEmail}
                  readOnly
                  style={lockedInputStyle}
                />
              </div>

            
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Why do you want Pro access?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. I'm actively job hunting and want to use the AI Career Score Card to improve my chances..."
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
            </div>

            {/* Info note */}
            <div
              className="p-3 rounded-lg text-xs text-gray-400 flex items-start gap-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              Your name and email are taken directly from your signed-in account and cannot be changed. This keeps requests genuine.
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 border border-white/10 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Pricing Card ─────────────────────────────────────────────
function PricingCard({ plan, onUpgradeClick }) {
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
      {plan.popular && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
          style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
        >
          <Sparkles className="w-3 h-3" /> Most Popular
        </div>
      )}

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

      {plan.popular ? (
        <button
          onClick={onUpgradeClick}
          className="w-full py-3 rounded-xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 mb-6 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <Zap className="w-4 h-4" />
          {plan.cta}
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <Link
          href={plan.ctaHref}
          className="w-full py-3 rounded-xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 mb-6 transition-all hover:opacity-90"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {plan.cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      <div className="h-px bg-white/10 mb-4" />

      <div className="space-y-3 flex-1">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: feature.included
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(255,255,255,0.05)",
              }}
            >
              {feature.included ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <X className="w-3 h-3 text-gray-600" />
              )}
            </div>
            <span
              className={`text-sm flex items-center gap-1.5 ${
                feature.included ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {!feature.included && <Lock className="w-3 h-3 text-gray-700" />}
              {feature.label}
              {feature.label === "AI Career Score Card" && feature.included && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                  NEW
                </span>
              )}
            </span>
          </div>
        ))}
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
      style={{
        borderColor: open ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
      onClick={() => setOpen((p) => !p)}
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
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "hsl(var(--background))" }}>
      {showModal && <ProRequestModal onClose={() => setShowModal(false)} />}

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
            }}>
              career growth
            </span>
          </h1>
          <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
            Start free with all core tools. Request Pro access for the AI Career Score Card
            that tells you exactly what's blocking your job search.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} onUpgradeClick={() => setShowModal(true)} />
          ))}
        </div>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-blue-500">
          {[
            " Reviewed within 24 hours",
            " Your data is private",
            " Instant access after approval",
            " Free during early access",
          ].map((t) => (
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