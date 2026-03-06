"use client";

import { useState, useEffect } from "react";
import {
  BrainCircuit, Target, Zap, Globe, ArrowRight,
  ChevronRight, RotateCcw, Lock, Crown, CheckCircle,
  AlertCircle, TrendingUp, Calendar, Loader2,
  FileText, Map, GraduationCap, BarChart2, Award, Flame,
} from "lucide-react";
import Link from "next/link";
import { getUserCareerData, generateCareerScore } from "@/actions/career-score";

// ── Helpers ───────────────────────────────────────────────────
const GRADE_COLOR = {
  strong:       { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", bar: "#34d399" },
  good:         { text: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    bar: "#60a5fa" },
  "needs-work": { text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   bar: "#fbbf24" },
};

const PRIORITY_COLOR = {
  high:   { text: "text-red-400",   bg: "bg-red-400/10",   border: "border-red-400/20"   },
  medium: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  low:    { text: "text-blue-400",  bg: "bg-blue-400/10",  border: "border-blue-400/20"  },
};

const CATEGORY_ICONS = {
  resume:    FileText,
  skills:    Zap,
  interview: GraduationCap,
  linkedin:  Globe,
};

const WEEK_ICONS  = [Flame, TrendingUp, Zap, Award];
const WEEK_COLORS = [
  { accent: "#6366f1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.2)"  },
  { accent: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.2)"  },
  { accent: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
  { accent: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
];

function getOverallMeta(score) {
  if (score >= 80) return { stroke: "#34d399", text: "text-emerald-400", label: "Excellent" };
  if (score >= 65) return { stroke: "#60a5fa", text: "text-blue-400",    label: "Good"      };
  if (score >= 50) return { stroke: "#fbbf24", text: "text-amber-400",   label: "Fair"      };
  return                  { stroke: "#f87171", text: "text-red-400",     label: "Needs Work" };
}

// ── Animated counter ──────────────────────────────────────────
function useCountUp(target, duration = 1400, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return val;
}

// ── Score Ring ────────────────────────────────────────────────
function ScoreRing({ score, size = 150, stroke = 12, color = "#34d399", animate = false }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);
  const display = useCountUp(score, 1300, animate);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setDash((score / 100) * circ), 120);
    return () => clearTimeout(t);
  }, [score, circ, animate]);

  const offset = animate ? circ - dash : circ - (score / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white leading-none">{animate ? display : score}</span>
        <span className="text-xs text-gray-500 mt-1">/ 100</span>
      </div>
    </div>
  );
}

// ── Pro Gate ──────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
          <Lock className="w-9 h-9 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Pro Feature</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            The AI Career Score Card is a Pro-only feature. Upgrade to get your complete career health audit.
          </p>
        </div>
        <Link href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Crown className="w-4 h-4" /> Get Pro Access <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function Questionnaire({ userData, onSubmit, loading }) {
  const [form, setForm] = useState({
    targetRole: "",
    yearsExp: userData?.experience?.toString() || "",
    jobSearchStatus: "",
    linkedinUrl: "",
    linkedinConnections: "",
    industry: userData?.industry || "",
    additionalContext: "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const base = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    outline: "none",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
  };

  const prefilled = [];
  if (userData?.resume?.length > 0)     prefilled.push("Resume");
  if (userData?.assessments?.length > 0) prefilled.push(`${userData.assessments.length} Assessments`);
  if (userData?.skills?.length > 0)      prefilled.push(`${userData.skills.length} Skills`);
  if (userData?.industry)                prefilled.push("Industry");

  const canSubmit = form.targetRole.trim() && form.jobSearchStatus;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
            <Crown className="w-3.5 h-3.5" /> Pro Feature
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">AI Career Score Card</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
            Answer a few questions and our AI will analyze your full profile — resume, assessments, skills — and generate your personalized career health score.
          </p>
        </div>

        {/* Pre-filled notice */}
        {prefilled.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-indigo-300 text-sm font-semibold">Data auto-loaded from your profile</p>
              <p className="text-indigo-400/70 text-xs mt-0.5">{prefilled.join(" · ")} — already pulled from your account</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5 rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Target Role <span className="text-red-400">*</span>
            </label>
            <input style={base} placeholder="e.g. Frontend Developer, Product Manager"
              value={form.targetRole} onChange={e => set("targetRole", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Years of Experience
              </label>
              <select style={{ ...base, cursor: "pointer" }}
                value={form.yearsExp} onChange={e => set("yearsExp", e.target.value)}>
                <option value="" style={{ background: "#111" }}>Select...</option>
                <option value="0"  style={{ background: "#111" }}>Student / Fresher</option>
                <option value="1"  style={{ background: "#111" }}>Less than 1 year</option>
                <option value="2"  style={{ background: "#111" }}>1–2 years</option>
                <option value="4"  style={{ background: "#111" }}>3–5 years</option>
                <option value="7"  style={{ background: "#111" }}>5–10 years</option>
                <option value="10" style={{ background: "#111" }}>10+ years</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Job Search Status <span className="text-red-400">*</span>
              </label>
              <select style={{ ...base, cursor: "pointer" }}
                value={form.jobSearchStatus} onChange={e => set("jobSearchStatus", e.target.value)}>
                <option value=""                     style={{ background: "#111" }}>Select...</option>
                <option value="actively-searching"   style={{ background: "#111" }}>Actively Searching</option>
                <option value="open-to-opportunities" style={{ background: "#111" }}>Open to Opportunities</option>
                <option value="not-searching"        style={{ background: "#111" }}>Not Currently Searching</option>
                <option value="student"              style={{ background: "#111" }}>Student / Fresher</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                LinkedIn URL
              </label>
              <input style={base} placeholder="linkedin.com/in/yourname"
                value={form.linkedinUrl} onChange={e => set("linkedinUrl", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                LinkedIn Connections
              </label>
              <select style={{ ...base, cursor: "pointer" }}
                value={form.linkedinConnections} onChange={e => set("linkedinConnections", e.target.value)}>
                <option value=""        style={{ background: "#111" }}>Select...</option>
                <option value="under-100" style={{ background: "#111" }}>Under 100</option>
                <option value="100-300"   style={{ background: "#111" }}>100–300</option>
                <option value="300-500"   style={{ background: "#111" }}>300–500</option>
                <option value="500plus"   style={{ background: "#111" }}>500+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Anything else the AI should know?
            </label>
            <textarea style={{ ...base, resize: "none" }} rows={3}
              placeholder="e.g. 3 personal projects on GitHub, recently got AWS certified, targeting remote roles..."
              value={form.additionalContext} onChange={e => set("additionalContext", e.target.value)} />
          </div>
        </div>

        {/* Submit */}
        <button onClick={() => onSubmit(form)} disabled={!canSubmit || loading}
          className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your profile...</>
            : <><BrainCircuit className="w-4 h-4" /> Generate My Career Score <ArrowRight className="w-4 h-4" /></>
          }
        </button>

        {!canSubmit && (
          <p className="text-center text-xs text-gray-600">
            Fill in Target Role and Job Search Status to continue
          </p>
        )}
      </div>
    </div>
  );
}

function GeneratingLoader() {
  const steps = [
    "Reading your resume...",
    "Analyzing assessment scores...",
    "Evaluating skill gaps...",
    "Scoring interview readiness...",
    "Building your 30-day plan...",
    "Finalizing career score...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(p => (p + 1) % steps.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(99,102,241,0.2)" }} />
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <BrainCircuit className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Analyzing your profile</h2>
          <p className="text-indigo-300 text-sm font-medium">{steps[step]}</p>
        </div>
        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i <= step ? "#6366f1" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Results ───────────────────────────────────────────────────
function Results({ data, onRetake }) {
  const [animated, setAnimated] = useState(false);
  const meta = getOverallMeta(data.overallScore);

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
              <Crown className="w-3.5 h-3.5" /> Career Score Card
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Your Career Health Report</h1>
          </div>
          <button onClick={onRetake}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <RotateCcw className="w-3.5 h-3.5" /> Retake
          </button>
        </div>

        {/* Overall Score Hero */}
        <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8"
          style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.2)" }}>
          <ScoreRing score={data.overallScore} color={meta.stroke} animate={animated} />
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className={`text-3xl font-black ${meta.text}`}>{data.overallGrade}</span>
              <span className={`text-sm px-3 py-1 rounded-lg font-bold ${meta.text}`}
                style={{ background: `${meta.stroke}15`, border: `1px solid ${meta.stroke}30` }}>
                {meta.label}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-lg">{data.summary}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Top Strength</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{data.topStrength}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Focus Area</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{data.biggestGap}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" /> Category Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.categories?.map((cat) => {
              const colors = GRADE_COLOR[cat.status] || GRADE_COLOR["good"];
              const Icon   = CATEGORY_ICONS[cat.id] || BrainCircuit;
              return (
                <div key={cat.id} className="rounded-2xl p-5 space-y-4"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{cat.name}</div>
                        <div className={`text-xs font-semibold ${colors.text}`}>{cat.grade}</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-black ${colors.text}`}>{cat.score}</div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: animated ? `${cat.score}%` : "0%", background: colors.bar, transitionDelay: "400ms" }} />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{cat.feedback}</p>
                  <div className="flex items-start gap-2 p-3 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Zap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <span className="font-semibold text-indigo-300">Quick win: </span>{cat.quickWin}
                    </p>
                  </div>
                  <Link href={cat.linkedFeature || "/dashboard"}
                    className={`flex items-center gap-1 text-xs font-semibold ${colors.text} hover:opacity-80 transition-opacity`}>
                    {cat.linkedFeatureLabel} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Gaps */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" /> Skill Gap Analysis
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {data.skillGaps?.map((gap, i) => {
              const colors = PRIORITY_COLOR[gap.priority] || PRIORITY_COLOR.medium;
              return (
                <div key={i} className="flex items-center gap-4 p-4"
                  style={{
                    borderBottom: i < data.skillGaps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                  }}>
                  <div className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider flex-shrink-0 ${colors.text} ${colors.bg} border ${colors.border}`}>
                    {gap.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{gap.skill}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{gap.reason}</div>
                  </div>
                  <Link href={gap.linkedFeature || "/interview"}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex-shrink-0">
                    {gap.linkedFeatureLabel} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-Day Action Plan */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> 30-Day Action Plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.actionPlan && Object.entries(data.actionPlan).map(([key, week], i) => {
              const c    = WEEK_COLORS[i] || WEEK_COLORS[0];
              const Icon = WEEK_ICONS[i]  || Flame;
              return (
                <div key={key} className="rounded-2xl p-5 space-y-4"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: c.accent }}>
                        Week {i + 1}
                      </div>
                      <div className="text-sm font-bold text-white">{week.theme}</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${c.accent}20` }}>
                      <Icon className="w-4 h-4" style={{ color: c.accent }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {week.tasks?.map((task, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: c.accent }} />
                        <p className="text-xs text-gray-300 leading-relaxed">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Feature Links */}
        <div className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Map className="w-4 h-4 text-indigo-400" /> Jump to Features to Improve Your Score
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Resume Builder",    href: "/resume",           Icon: FileText,      color: "#6366f1" },
              { label: "Interview Prep",    href: "/interview",        Icon: GraduationCap, color: "#8b5cf6" },
              { label: "Career Roadmap",    href: "/career-roadmap",   Icon: Map,           color: "#3b82f6" },
              { label: "Industry Insights", href: "/industry-insights", Icon: BarChart2,    color: "#10b981" },
            ].map(({ label, href, Icon, color }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center hover:opacity-80 transition-opacity group"
                style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Retake */}
        <div className="text-center pb-6">
          <button onClick={onRetake}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Retake assessment to update your score
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CareerScorePage() {
  const [userData,    setUserData]    = useState(null);
  const [isPro,       setIsPro]       = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [state,       setState]       = useState("questionnaire");
  const [results,     setResults]     = useState(null);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserCareerData();
        if (!data) { setPageLoading(false); return; }

        setUserData(data);

        // ── Key fix: explicitly check plan field ──────────────
        const userIsPro = data.plan === "pro";
        setIsPro(userIsPro);

        // Load existing score if available
        if (userIsPro && data.careerScore?.length > 0 && data.careerScore[0]?.data) {
          setResults(data.careerScore[0].data);
          setState("results");
        }
      } catch (err) {
        console.error("Page load error:", err);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setState("generating");
    setError(null);
    const res = await generateCareerScore(formData);
    setSubmitting(false);
    if (res.success) {
      setResults(res.data);
      setState("results");
    } else {
      setError(res.error || "Something went wrong. Please try again.");
      setState("questionnaire");
    }
  };

  const handleRetake = () => {
    setResults(null);
    setState("questionnaire");
  };

  // ── Loading ────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // ── Pro gate ───────────────────────────────────────────────
  if (!isPro) return <ProGate />;

  // ── Generating ─────────────────────────────────────────────
  if (state === "generating") return <GeneratingLoader />;

  // ── Results ────────────────────────────────────────────────
  if (state === "results" && results) {
    return <Results data={results} onRetake={handleRetake} />;
  }

  // ── Questionnaire ──────────────────────────────────────────
  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-300"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      <Questionnaire userData={userData} onSubmit={handleSubmit} loading={submitting} />
    </>
  );
}