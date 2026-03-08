"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText, Copy, CheckCheck, Lock, Crown,
  RefreshCw, Loader2, AlertCircle, ChevronDown,
  ChevronUp, Star, ShieldCheck, ArrowRight, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getAtsTemplates } from "@/actions/resume-templates";

// ── Build plain-text resume from JSON data ────────────────────
function buildResumeText(t) {
  const lines = [];

  lines.push(t.name || "Your Name");
  const c = t.contact || {};
  const contactLine = [c.email, c.phone, c.location, c.linkedin, c.github]
    .filter(Boolean).join("  |  ");
  if (contactLine) lines.push(contactLine);
  lines.push("");

  if (t.summary) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push("─".repeat(50));
    lines.push(t.summary);
    lines.push("");
  }

  if (t.experience?.length) {
    lines.push("EXPERIENCE");
    lines.push("─".repeat(50));
    t.experience.forEach((exp) => {
      lines.push(`${exp.title}  |  ${exp.company}  |  ${exp.location}`);
      lines.push(exp.dates || "");
      (exp.bullets || []).forEach((b) => lines.push(`• ${b}`));
      lines.push("");
    });
  }

  if (t.education?.length) {
    lines.push("EDUCATION");
    lines.push("─".repeat(50));
    t.education.forEach((edu) => {
      lines.push(`${edu.degree}  —  ${edu.school}`);
      lines.push(`${edu.location || ""}  ${edu.dates || ""}${edu.gpa ? `  |  GPA: ${edu.gpa}` : ""}`);
      lines.push("");
    });
  }

  if (t.skills) {
    lines.push("SKILLS");
    lines.push("─".repeat(50));
    if (t.skills.technical?.length) lines.push(`Technical:  ${t.skills.technical.join(", ")}`);
    if (t.skills.tools?.length)     lines.push(`Tools:      ${t.skills.tools.join(", ")}`);
    if (t.skills.soft?.length)      lines.push(`Soft Skills: ${t.skills.soft.join(", ")}`);
    lines.push("");
  }

  if (t.certifications?.length) {
    lines.push("CERTIFICATIONS");
    lines.push("─".repeat(50));
    t.certifications.forEach((cert) => lines.push(`• ${cert}`));
    lines.push("");
  }

  if (t.projects?.length) {
    lines.push("PROJECTS");
    lines.push("─".repeat(50));
    t.projects.forEach((p) => {
      lines.push(p.name);
      lines.push(p.description || "");
      if (p.tech?.length) lines.push(`Tech: ${p.tech.join(", ")}`);
      lines.push("");
    });
  }

  return lines.join("\n");
}

// ── ATS Score Badge ───────────────────────────────────────────
function AtsScoreBadge({ score }) {
  const color =
    score >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    score >= 80 ? "text-blue-600 bg-blue-50 border-blue-200" :
                  "text-amber-600 bg-amber-50 border-amber-200";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      <ShieldCheck className="w-3 h-3" />
      ATS {score}%
    </span>
  );
}

// ── Copy Button ───────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
      style={{
        background:   copied ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
        borderColor:  copied ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.3)",
        color:        copied ? "#10b981" : "#6366f1",
      }}
    >
      {copied ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Resume</>}
    </button>
  );
}

// ── Single Template Card ──────────────────────────────────────
function TemplateCard({ template, index, isPro, isFirst }) {
  const [expanded, setExpanded] = useState(false);
  const isLocked  = !isPro && !isFirst;
  const resumeText = buildResumeText(template);

  return (
    <div className="relative rounded-2xl border overflow-hidden transition-all"
      style={{
        borderColor: isFirst ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)",
        background:  "rgba(255,255,255,0.02)",
      }}>

      {/* First template badge */}
      {isFirst && (
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
          <Star className="w-3 h-3" /> Free Preview
        </div>
      )}

      {/* Pro locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl"
          style={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.55)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)" }}>
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="text-center px-6">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Crown className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">Pro Template</span>
            </div>
            <p className="text-xs text-gray-400">Upgrade to access all 5 ATS templates</p>
          </div>
          <Link href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            Unlock Pro <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Card content — blurred if locked */}
      <div className={isLocked ? "blur-sm pointer-events-none select-none" : ""}>

        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className={isFirst ? "mt-8" : ""}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Template {index + 1}
                </span>
                {template.atsScore && <AtsScoreBadge score={template.atsScore} />}
              </div>
              <h3 className="text-base font-black text-white">{template.style}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{template.level}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!isLocked && <CopyButton text={resumeText} />}
              <button
                onClick={() => setExpanded(p => !p)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
              >
                {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Collapse</> : <><ChevronDown className="w-3.5 h-3.5" /> Preview</>}
              </button>
            </div>
          </div>

          {/* ATS Tips */}
          {template.atsNotes?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {template.atsNotes.map((note, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
                  ✓ {note}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Resume Preview — expandable */}
        {expanded && (
          <div className="px-5 pb-5">
            <pre className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap p-4 rounded-xl overflow-auto max-h-[500px]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {resumeText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────
function TemplateSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 p-5 animate-pulse"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-white/10" />
              <div className="h-5 w-48 rounded bg-white/10" />
              <div className="h-3 w-32 rounded bg-white/10" />
            </div>
            <div className="h-8 w-28 rounded-lg bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function AtsTemplates({ initialData }) {
  const [data,       setData]       = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await getAtsTemplates(true);
      setData(fresh);
    } catch {
      // keep existing
    } finally {
      setRefreshing(false);
    }
  };

  const { templates = [], role, lastFetched, cached, plan, error } = data || {};
  const isPro = plan === "pro";

  return (
    <div className="space-y-6">

      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              ATS-Optimized Resume Templates
            </h2>
            <p className="text-xs text-gray-400">
              5 templates tailored for <span className="text-indigo-300 font-semibold">{role || "your role"}</span>
              {!isPro && " · 4 locked behind Pro"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPro && (
            <Link href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Crown className="w-3.5 h-3.5" /> Get Pro
            </Link>
          )}
          {isPro && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {refreshing ? "Generating..." : "Regenerate"}
            </button>
          )}
        </div>
      </div>

      {/* Free user notice */}
      {!isPro && (
        <div className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Crown className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-300">Pro unlocks all 5 templates</p>
            <p className="text-xs text-indigo-400/70 mt-0.5">
              You can preview the first template for free. Upgrade to copy and use all 5 ATS-optimized resumes for your role.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {refreshing && <TemplateSkeleton />}

      {/* Templates */}
      {!refreshing && templates.length > 0 && (
        <div className="space-y-4">
          {templates.map((template, i) => (
            <TemplateCard
              key={i}
              template={template}
              index={i}
              isPro={isPro}
              isFirst={i === 0}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!refreshing && templates.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <FileText className="w-8 h-8 text-gray-600" />
          <p className="text-sm text-gray-500">
            No templates yet.{" "}
            {isPro
              ? <button onClick={handleRefresh} className="text-indigo-400 underline">Generate now</button>
              : "Upgrade to Pro to generate your templates."}
          </p>
        </div>
      )}

      {/* Footer */}
      {templates.length > 0 && !refreshing && (
        <p className="text-xs text-gray-600 text-center">
          AI-generated ATS templates specific to your industry · {isPro ? "Regenerates every 7 days" : "Upgrade to unlock all 5"}
        </p>
      )}
    </div>
  );
}