"use client";

import { useEffect, useState } from "react";
import { Check, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUserCareerData } from "@/actions/career-score";

export function UpgradeBanner() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserCareerData()
      .then((data) => setIsPro(data?.plan === "pro"))
      .catch(() => setIsPro(false))
      .finally(() => setLoading(false));
  }, []);

  // ── Theme: changes based on plan ─────────────────────────
  const theme = isPro
    ? {
        gradient:     "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.12) 50%, rgba(6,182,212,0.08) 100%)",
        border:       "1px solid rgba(16,185,129,0.3)",
        glow:         "rgba(16,185,129,0.2)",
        iconBg:       "bg-emerald-500/20",
        iconBorder:   "border-emerald-500/30",
        iconColor:    "text-emerald-400",
        badgeBg:      "bg-emerald-500/20",
        badgeText:    "text-emerald-300",
        badgeBorder:  "border-emerald-500/20",
        badgeLabel:   "PRO",
        checkColor:   "text-emerald-400",
        title:        "Your AI Career Score Card",
        description:  "You have full Pro access. View your personalized career health score, 30-day action plan, and skill gap analysis.",
        btnGradient:  "linear-gradient(135deg, #10b981, #059669)",
        btnHref:      "/career-score",
        btnLabel:     "View Career Score",
      }
    : {
        gradient:     "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(59,130,246,0.1) 100%)",
        border:       "1px solid rgba(99,102,241,0.3)",
        glow:         "rgba(99,102,241,0.2)",
        iconBg:       "bg-indigo-500/20",
        iconBorder:   "border-indigo-500/30",
        iconColor:    "text-indigo-400",
        badgeBg:      "bg-indigo-500/20",
        badgeText:    "text-indigo-300",
        badgeBorder:  "border-indigo-500/20",
        badgeLabel:   "PRO",
        checkColor:   "text-indigo-400",
        title:        "Unlock AI Career Score Card",
        description:  "Get your personalized career health score, 30-day action plan, and know exactly what's holding you back from landing your dream job.",
        btnGradient:  "linear-gradient(135deg, #6366f1, #8b5cf6)",
        btnHref:      "/pricing",
        btnLabel:     "Upgrade to Pro",
      };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      style={{ background: theme.gradient, border: theme.border }}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: theme.glow }}
      />

      <div className="flex items-start gap-4 relative z-10">
        <div className={`w-11 h-11 rounded-xl ${theme.iconBg} border ${theme.iconBorder} flex items-center justify-center flex-shrink-0`}>
          <Sparkles className={`w-5 h-5 ${theme.iconColor}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-base">{theme.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder} font-semibold`}>
              {theme.badgeLabel}
            </span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            {theme.description}
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            {["Career Health Score", "30-Day Action Plan", "Skill Gap Analysis", "Personalized Roadmap"].map((f) => (
              <span key={f} className="flex items-center gap-1 text-xs text-gray-300">
                <Check className={`w-3 h-3 ${theme.checkColor}`} />{f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      {loading ? (
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl flex-shrink-0 relative z-10"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
      ) : (
        <Link
          href={theme.btnHref}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex-shrink-0 relative z-10"
          style={{ background: theme.btnGradient }}
        >
          {theme.btnLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}