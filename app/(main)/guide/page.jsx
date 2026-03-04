"use client";

import { useState } from "react";
import {
  Map, Loader2, ChevronDown, ChevronUp, ExternalLink,
  Youtube, BookOpen, GraduationCap, CheckCircle2, Circle,
  Trophy, Zap, Clock, Target, ArrowRight, RotateCcw,
  Layers, Palette, Server, BarChart2, BrainCircuit, Container, ShieldCheck,
} from "lucide-react";
import { generateRoadmap } from "@/actions/roadmap";

// ── Domain config ─────────────────────────────────────────────
const DOMAINS = [
  { id: "Full-Stack",    label: "Full-Stack",    Icon: Layers,       color: "#6366f1", desc: "React + Node.js + DB + Deployment" },
  { id: "Frontend",      label: "Frontend",      Icon: Palette,      color: "#3b82f6", desc: "HTML, CSS, JS, React, Next.js" },
  { id: "Backend",       label: "Backend",       Icon: Server,       color: "#10b981", desc: "Node.js, APIs, Databases, Auth" },
  { id: "Data Science",  label: "Data Science",  Icon: BarChart2,    color: "#f59e0b", desc: "Python, Pandas, ML, Visualization" },
  { id: "AI/ML",         label: "AI / ML",       Icon: BrainCircuit, color: "#8b5cf6", desc: "Deep Learning, PyTorch, LLMs" },
  { id: "DevOps",        label: "DevOps",        Icon: Container,    color: "#ef4444", desc: "Docker, CI/CD, AWS, Kubernetes" },
  { id: "Cybersecurity", label: "Cybersecurity", Icon: ShieldCheck,  color: "#ec4899", desc: "Networking, Ethical Hacking, SOC" },
];

const EXPERIENCE = [
  { id: "Complete Beginner", label: "Complete Beginner", desc: "No coding experience" },
  { id: "Some Basics",       label: "Some Basics",       desc: "Know a little HTML/Python" },
  { id: "Intermediate",      label: "Intermediate",      desc: "Built small projects" },
  { id: "Advanced",          label: "Advanced",          desc: "Looking to specialize" },
];

// ── Resource icon ─────────────────────────────────────────────
function ResourceIcon({ type }) {
  if (type === "youtube") return <Youtube className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />;
  if (type === "docs")    return <BookOpen className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
  return <GraduationCap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
}

// ── Topic Card ────────────────────────────────────────────────
function TopicCard({ topic, phaseIdx, topicIdx, checked, onToggle }) {
  const [open, setOpen] = useState(false);
  const key = `${phaseIdx}-${topicIdx}`;

  return (
    <div
      className="rounded-lg border transition-all"
      style={{
        borderColor: checked ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)",
        background:   checked ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
      }}
    >
      <div className="p-3 flex items-start gap-3">
        <button onClick={() => onToggle(key)} className="mt-0.5 flex-shrink-0">
          {checked
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            : <Circle className="w-5 h-5 text-gray-600 hover:text-gray-400 transition-colors" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className={`text-sm font-semibold ${checked ? "text-emerald-400 line-through opacity-70" : "text-white"}`}>
              {topic.name}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />{topic.estimatedHours}h
              </span>
              <button onClick={() => setOpen(p => !p)} className="text-gray-500 hover:text-gray-300 transition-colors">
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{topic.description}</div>

          {open && topic.resources?.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resources</div>
              {topic.resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{
                    background: r.type === "youtube" ? "rgba(239,68,68,0.1)" : r.type === "docs" ? "rgba(59,130,246,0.1)" : "rgba(16,185,129,0.1)",
                    border:     r.type === "youtube" ? "1px solid rgba(239,68,68,0.2)" : r.type === "docs" ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(16,185,129,0.2)",
                    color:      r.type === "youtube" ? "#f87171" : r.type === "docs" ? "#60a5fa" : "#34d399",
                  }}
                >
                  <ResourceIcon type={r.type} />
                  <span className="flex-1 truncate">{r.label}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Phase Section ─────────────────────────────────────────────
function PhaseSection({ phase, phaseIdx, checked, onToggle, domainColor }) {
  const [open, setOpen] = useState(phaseIdx === 0);
  const total = phase.topics?.length || 0;
  const done  = phase.topics?.filter((_, ti) => checked[`${phaseIdx}-${ti}`]).length || 0;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
          style={{ background: domainColor + "22", color: domainColor }}
        >
          {phase.phase}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{phase.title}</span>
            <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-white/5">{phase.weeks}</span>
            {pct === 100 && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />Done
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{phase.description}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: domainColor }} />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{done}/{total}</span>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
      </button>

      {open && (
        <div className="p-4 pt-0 space-y-2">
          {phase.topics?.map((topic, ti) => (
            <TopicCard
              key={ti}
              topic={topic}
              phaseIdx={phaseIdx}
              topicIdx={ti}
              checked={!!checked[`${phaseIdx}-${ti}`]}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function GuidePage() {
  const [step, setStep]               = useState("pick");
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [goal, setGoal]               = useState("");
  const [roadmap, setRoadmap]         = useState(null);
  const [error, setError]             = useState(null);
  const [checked, setChecked]         = useState({});

  const domainObj = DOMAINS.find(d => d.id === selectedDomain);

  const allTopics  = roadmap?.phases?.flatMap((ph, pi) => ph.topics?.map((_, ti) => `${pi}-${ti}`) || []) || [];
  const totalTopics = allTopics.length;
  const doneTopics  = allTopics.filter(k => checked[k]).length;
  const overallPct  = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

  const handleToggle = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));

  const handleGenerate = async () => {
    if (!selectedDomain || !selectedExp) return;
    setStep("generating");
    setError(null);
    try {
      const data = await generateRoadmap({ domain: selectedDomain, experience: selectedExp, goal });
      setRoadmap(data);
      setChecked({});
      setStep("roadmap");
    } catch (e) {
      setError(e.message);
      setStep("pick");
    }
  };

  const handleReset = () => {
    setStep("pick");
    setRoadmap(null);
    setChecked({});
    setSelectedDomain(null);
    setSelectedExp(null);
    setGoal("");
  };

  // ── Generating screen ──────────────────────────────────────
  if (step === "generating") {
    const DomainIcon = domainObj?.Icon;
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: domainObj?.color + "22" }}
          >
            {DomainIcon && <DomainIcon className="w-8 h-8" style={{ color: domainObj?.color }} />}
          </div>
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: domainObj?.color }} />
          <div className="text-white font-semibold">Building your {selectedDomain} roadmap...</div>
          <div className="text-gray-400 text-sm">Groq AI is curating resources, YouTube links & a week-by-week plan</div>
          <div className="text-gray-600 text-xs">This takes ~8–12 seconds</div>
        </div>
      </div>
    );
  }

  // ── Roadmap view ───────────────────────────────────────────
  if (step === "roadmap" && roadmap) {
    const DomainIcon = domainObj?.Icon;
    return (
      <div className="min-h-screen p-6 md:p-10" style={{ background: "hsl(var(--background))" }}>
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: domainObj?.color + "22" }}
              >
                {DomainIcon && <DomainIcon className="w-6 h-6" style={{ color: domainObj?.color }} />}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{roadmap.title}</h1>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{roadmap.totalWeeks} weeks</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" />{selectedExp}</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{roadmap.phases?.length} phases</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Roadmap
            </button>
          </div>

          {/* Overview */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-sm text-gray-300 leading-relaxed">
            {roadmap.overview}
          </div>

          {/* Overall Progress */}
          <div
            className="p-4 rounded-xl border overflow-hidden"
            style={{ borderColor: domainObj?.color + "33", background: domainObj?.color + "08" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: domainObj?.color }} />
                Overall Progress
              </div>
              <div className="text-2xl font-black" style={{ color: domainObj?.color }}>{overallPct}%</div>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%`, background: `linear-gradient(90deg, ${domainObj?.color}, ${domainObj?.color}88)` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">{doneTopics} of {totalTopics} topics completed</div>
            {overallPct === 100 && (
              <div className="mt-3 text-emerald-400 font-semibold text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Congratulations! You are job-ready! 🎉
              </div>
            )}
          </div>

          {/* Phases */}
          <div className="space-y-4">
            {roadmap.phases?.map((phase, pi) => (
              <PhaseSection
                key={pi}
                phase={phase}
                phaseIdx={pi}
                checked={checked}
                onToggle={handleToggle}
                domainColor={domainObj?.color}
              />
            ))}
          </div>

          {/* Final Project */}
          {roadmap.finalProject && (
            <div
              className="p-5 rounded-xl border"
              style={{ borderColor: domainObj?.color + "44", background: domainObj?.color + "10" }}
            >
              <div className="flex items-center gap-2 text-sm font-bold mb-2" style={{ color: domainObj?.color }}>
                <Trophy className="w-4 h-4" /> Capstone Project
              </div>
              <div className="text-white font-semibold">{roadmap.finalProject.title}</div>
              <div className="text-sm text-gray-300 mt-1">{roadmap.finalProject.description}</div>
              {roadmap.finalProject.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {roadmap.finalProject.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-md"
                      style={{ background: domainObj?.color + "22", color: domainObj?.color, border: `1px solid ${domainObj?.color}33` }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Job Ready Checklist */}
          {roadmap.jobReadyChecklist?.length > 0 && (
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Job-Ready Checklist
              </div>
              <div className="space-y-2">
                {roadmap.jobReadyChecklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ── Domain picker ──────────────────────────────────────────
  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Map className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Career Roadmap Generator</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              AI-powered, week-by-week plan with live resources & YouTube links
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error} — Please try again.
          </div>
        )}

        {/* Step 1 — Domain */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Step 1 — Choose your domain
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DOMAINS.map((d) => {
              const DIcon = d.Icon;
              const isSelected = selectedDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className="p-4 rounded-xl border text-left transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: isSelected ? d.color : "rgba(255,255,255,0.08)",
                    background:  isSelected ? d.color + "18" : "rgba(255,255,255,0.02)",
                  }}
                >
                  {/* ✅ Lucide icon rendered correctly */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: d.color + "22", color: d.color }}
                  >
                    <DIcon className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white">{d.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight">{d.desc}</div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 mt-2" style={{ color: d.color }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Experience */}
        {selectedDomain && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Step 2 — Your experience level
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EXPERIENCE.map((e) => {
                const isSelected = selectedExp === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedExp(e.id)}
                    className="p-3 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: isSelected ? domainObj?.color : "rgba(255,255,255,0.08)",
                      background:  isSelected ? domainObj?.color + "18" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="text-sm font-bold text-white">{e.label}</div>
                    <div className="text-xs text-gray-500">{e.desc}</div>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 mt-1.5" style={{ color: domainObj?.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — Goal */}
        {selectedExp && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Step 3 — Your goal{" "}
              <span className="text-gray-700 normal-case font-normal">(optional)</span>
            </div>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={`e.g. Get a job as a ${selectedDomain} developer at a startup in 6 months`}
              className="w-full px-4 py-3 rounded-xl border bg-transparent text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            />
          </div>
        )}

        {/* Generate button */}
        {selectedDomain && selectedExp && (
          <button
            onClick={handleGenerate}
            className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${domainObj?.color}, ${domainObj?.color}aa)` }}
          >
            <Zap className="w-4 h-4" />
            Generate My {selectedDomain} Roadmap with AI
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

      </div>
    </div>
  );
}