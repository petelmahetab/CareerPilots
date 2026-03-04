"use client";

import { useState } from "react";
import { Zap, Check, Lock, Star, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";


export function UpgradeBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(59,130,246,0.1) 100%)",
        border: "1px solid rgba(99,102,241,0.3)",
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(99,102,241,0.2)" }}
      />

      <div className="flex items-start gap-4 relative z-10">
        <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-base">Unlock AI Career Score Card</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 font-semibold">PRO</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            Get your personalized career health score, 30-day action plan, and know exactly what's holding you back from landing your dream job.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            {["Career Health Score", "30-Day Action Plan", "Skill Gap Analysis", "Personalized Roadmap"].map((f) => (
              <span key={f} className="flex items-center gap-1 text-xs text-gray-300">
                <Check className="w-3 h-3 text-indigo-400" />{f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/pricing"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex-shrink-0 relative z-10"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        Upgrade to Pro <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}