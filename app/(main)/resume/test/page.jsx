"use client";

import { useState, useRef, useCallback } from "react";
import {
  Target, Search, Scissors, Zap, FlaskConical,
  Play, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Lightbulb, FileText, Briefcase, ChevronDown, ChevronUp,
  UploadCloud, File, Trash2,
} from "lucide-react";
import {
  scoreResumeAgainstJD,
  analyzeResume,
  tailorResumeToJob,
  improveBulletPoints,
} from "@/actions/resume";

const SAMPLE_RESUME = `John Doe | john@email.com | github.com/johndoe
Software Engineer with 3 years experience.

Skills: JavaScript, React, Node.js, MongoDB, REST APIs

Experience:
- Worked on React projects for e-commerce clients
- Helped team with bug fixes and code reviews
- Made the website faster by optimizing images
- Built REST APIs using Node.js

Education: B.Tech Computer Science, 2021`;

const SAMPLE_JD = `Senior FULL STACK Engineer
We are looking for a Senior Frontend Engineer with:
- 3+ years React & TypeScript experience
- Next.js and server-side rendering knowledge
- CI/CD pipeline experience (GitHub Actions)
- Performance optimization expertise
- Strong communication and teamwork skills
- Experience with testing frameworks (Jest, Cypress)`;

const SAMPLE_BULLETS = [
  "Worked on React projects",
  "Helped team with bug fixes",
  "Made the website faster",
  "Built some REST APIs",
];

function normalizeSkills(skills) {
  if (!skills) return "";
  if (typeof skills === "string") return skills;
  if (Array.isArray(skills)) return skills.join(", ");
  if (typeof skills === "object") {
    // e.g. { "Frontend": ["React", "Next.js"], "Backend": ["Node.js"] }
    return Object.entries(skills)
      .map(([category, items]) => `${category}: ${Array.isArray(items) ? items.join(", ") : items}`)
      .join(" | ");
  }
  return String(skills);
}

async function parsePDF(file) {
   const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text.trim();
}

async function parseDOCX(file) {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

async function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "pdf") return await parsePDF(file);
  if (ext === "docx") return await parseDOCX(file);
  if (["txt", "md"].includes(ext)) return await file.text();
  throw new Error(`Unsupported file type: .${ext} — use PDF, DOCX, or TXT`);
}

function DropZone({ onFileParsed, uploadedFile, onClear }) {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    setError(null);
    setParsing(true);
    try {
      const text = await parseFile(file);
      onFileParsed(file, text);
    } catch (e) {
      setError(e.message);
    } finally {
      setParsing(false);
    }
  }, [onFileParsed]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (uploadedFile) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <File className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-300">{uploadedFile.name}</div>
            <div className="text-xs text-gray-400">
              {(uploadedFile.size / 1024).toFixed(1)} KB · Parsed successfully ✓
            </div>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" /> Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl border-2 border-dashed transition-all cursor-pointer p-8 flex flex-col items-center justify-center gap-3 text-center"
        style={{
          borderColor: dragging ? "#3b82f6" : "rgba(255,255,255,0.15)",
          background: dragging ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
        }}
      >
        {parsing ? (
          <>
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <div className="text-sm text-gray-400">Parsing your resume...</div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <UploadCloud className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Drag and drop your resume here</div>
              <div className="text-xs text-gray-400 mt-1">
                Supports PDF, DOCX, TXT · or <span className="text-blue-400 underline">click to browse</span>
              </div>
            </div>
            <div className="text-xs text-gray-600">Nothing is stored — analysis runs live</div>
          </>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden"
          onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-400 px-1">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </div>
      )}
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span className="text-xs px-2 py-1 rounded-md font-medium"
      style={{ background: color + "18", color, border: `1px solid ${color}33` }}>
      {label}
    </span>
  );
}

function SectionBlock({ icon: Icon, title, items = [], color }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={{ color }}>
        <Icon className="w-4 h-4" />{title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => <Tag key={i} label={item} color={color} />)}
      </div>
    </div>
  );
}

function ATSResult({ data }) {
  const scoreColor = data.score >= 70 ? "#10b981" : data.score >= 40 ? "#f59e0b" : "#ef4444";
  const verdictBg = data.score >= 70 ? "#10b98115" : data.score >= 40 ? "#f59e0b15" : "#ef444415";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: verdictBg }}>
        <div className="text-5xl font-black tabular-nums" style={{ color: scoreColor }}>{data.score}</div>
        <div>
          <div className="text-base font-bold text-white">{data.verdict}</div>
          <div className="text-xs text-gray-400">ATS Match Score / 100</div>
        </div>
      </div>
      <SectionBlock icon={CheckCircle2} title="Matched Keywords" items={data.matchedKeywords} color="#10b981" />
      <SectionBlock icon={XCircle} title="Missing Keywords" items={data.missingKeywords} color="#ef4444" />
      <SectionBlock icon={Lightbulb} title="Suggestions" items={data.suggestions} color="#3b82f6" />
    </div>
  );
}

function AnalyzeResult({ data }) {
  const gradeColors = { A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
  const gc = gradeColors[data.grade] ?? "#6b7280";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black flex-shrink-0"
          style={{ background: gc + "22", color: gc }}>{data.grade}</div>
        <div>
          <div className="text-2xl font-bold text-white">{data.overallScore}/100</div>
          <div className="text-xs text-gray-400 leading-relaxed max-w-xs">{data.summary}</div>
        </div>
      </div>
      <SectionBlock icon={CheckCircle2} title="Strengths" items={data.strengths} color="#10b981" />
      <SectionBlock icon={AlertTriangle} title="Weaknesses" items={data.weaknesses} color="#f59e0b" />
      <SectionBlock icon={XCircle} title="Red Flags" items={data.redFlags} color="#ef4444" />
      <SectionBlock icon={Lightbulb} title="Missing Sections" items={data.missingSection} color="#8b5cf6" />
      {data.quickFixes?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />Quick Fixes
          </div>
          <div className="space-y-2">
            {data.quickFixes.map((fix, i) => {
              const pc = fix.priority === "High" ? "#ef4444" : fix.priority === "Medium" ? "#f59e0b" : "#10b981";
              return (
                <div key={i} className="p-3 rounded-lg text-sm border border-white/10 bg-white/5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: pc + "22", color: pc }}>{fix.priority}</span>
                    <span className="text-gray-300">{fix.issue}</span>
                  </div>
                  <div className="text-gray-400 pl-1 text-xs">→ {fix.fix}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TailorResult({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="text-3xl font-black text-emerald-400">{data.matchScore}</div>
        <div>
          <div className="text-sm font-semibold text-emerald-300">Match Score After Tailoring</div>
          <div className="text-xs text-gray-400">Summary and skills rewritten for this JD</div>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <FileText className="w-3 h-3" /> Tailored Summary
        </div>
        <div className="text-sm text-gray-200 leading-relaxed">{data.tailoredSummary}</div>
      </div>
      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Zap className="w-3 h-3" /> Tailored Skills
        </div>
        <div className="text-sm text-gray-200 leading-relaxed">
          {normalizeSkills(data.tailoredSkills)}
        </div>
      </div>
      <SectionBlock icon={CheckCircle2} title="Key Changes Made" items={data.keyChanges} color="#10b981" />
    </div>
  );
}

function BulletsResult({ data }) {
  return (
    <div className="space-y-3">
      {data.improved.map((item, i) => (
        <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-start gap-2">
            <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-400 line-through opacity-70 leading-relaxed">{item.original}</div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-emerald-300 font-medium leading-relaxed">{item.rewritten}</div>
          </div>
          <div className="flex items-start gap-2 pl-5">
            <div className="text-xs text-gray-500 italic">{item.explanation}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultRenderer({ data }) {
  if (!data) return null;
  if (data.error) return (
    <div className="flex items-start gap-2 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
      <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div><div className="font-semibold">Error</div><div className="text-xs opacity-80 mt-0.5">{data.error}</div></div>
    </div>
  );
  if (data.score !== undefined && data.verdict) return <ATSResult data={data} />;
  if (data.grade !== undefined) return <AnalyzeResult data={data} />;
  if (data.tailoredSummary) return <TailorResult data={data} />;
  if (data.improved) return <BulletsResult data={data} />;
  return <pre className="text-xs text-gray-400 overflow-auto bg-white/5 p-3 rounded-lg">{JSON.stringify(data, null, 2)}</pre>;
}

function SampleDataSection({ resumeText, usingUpload }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          {usingUpload ? "View Your Parsed Resume Text" : "View Sample Data Used in Tests"}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-0">
          {[
            { title: usingUpload ? "Your Resume (Parsed)" : "Sample Resume", Icon: FileText, content: resumeText },
            { title: "Job Description", Icon: Briefcase, content: SAMPLE_JD },
          ].map(({ title, Icon, content }) => (
            <div key={title} className="rounded-lg border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                <Icon className="w-3.5 h-3.5" />{title}
              </div>
              <pre className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed max-h-48 overflow-auto">{content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResumeTestPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [runningAll, setRunningAll] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const usingUpload = !!uploadedFile;

  const extractBullets = (text) => {
    const lines = text.split("\n").filter((l) => l.trim().match(/^[-•*]/));
    return lines.length >= 2
      ? lines.slice(0, 6).map((l) => l.replace(/^[-•*]\s*/, "").trim())
      : SAMPLE_BULLETS;
  };

  const handleFileParsed = (file, text) => {
    setUploadedFile(file);
    setResumeText(text);
    setResults({});
  };

  const handleClear = () => {
    setUploadedFile(null);
    setResumeText(SAMPLE_RESUME);
    setResults({});
  };

  const TESTS = [
    { id: "ats", label: "ATS Score", Icon: Target, description: "Score resume against job description", color: "#3b82f6", fn: () => scoreResumeAgainstJD(resumeText, SAMPLE_JD) },
    { id: "analyze", label: "Analyze Resume", Icon: Search, description: "Full audit: grade, red flags, quick fixes", color: "#8b5cf6", fn: () => analyzeResume(resumeText) },
    { id: "tailor", label: "Tailor to JD", Icon: Scissors, description: "Rewrite summary and skills to match JD", color: "#10b981", fn: () => tailorResumeToJob(resumeText, SAMPLE_JD) },
    { id: "bullets", label: "Improve Bullets", Icon: Zap, description: "Rewrite weak bullets with action verbs and metrics", color: "#f59e0b", fn: () => improveBulletPoints(extractBullets(resumeText), "Software Engineer") },
  ];

  const runTest = async (test) => {
    setLoading((p) => ({ ...p, [test.id]: true }));
    setResults((p) => ({ ...p, [test.id]: null }));
    try {
      const data = await test.fn();
      setResults((p) => ({ ...p, [test.id]: data }));
    } catch (e) {
      setResults((p) => ({ ...p, [test.id]: { error: e.message } }));
    } finally {
      setLoading((p) => ({ ...p, [test.id]: false }));
    }
  };

  const runAll = async () => {
    setRunningAll(true);
    await Promise.all(TESTS.map((t) => runTest(t)));
    setRunningAll(false);
  };

  const totalDone = Object.values(results).filter(Boolean).length;
  const totalErrors = Object.values(results).filter((r) => r?.error).length;

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-blue-400" />
              {/* <h1>j</h1> */}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                Resume AI Tools <span className="text-gray-500 font-normal text-base">/ Analysis Lab</span>
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">Drop your resume for instant AI feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalDone > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />{totalDone - totalErrors} passed</span>
                {totalErrors > 0 && <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3.5 h-3.5" />{totalErrors} failed</span>}
              </div>
            )}
            <button
              onClick={runAll}
              disabled={runningAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray transition-all duration-300 disabled:opacity-50"
              style={{ background: "#000", border: "1px solid rgba(255,255,255,0.15)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#000034"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#000"}
            >
              {runningAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              {runningAll ? "Analyzing..." : "Run All"}
            </button>
          </div>
        </div>

        <DropZone onFileParsed={handleFileParsed} uploadedFile={uploadedFile} onClear={handleClear} />

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex-1 h-px bg-white/10" />
          {usingUpload ? `Analyzing "${uploadedFile.name}" with all 4 tools below` : "No resume uploaded — using sample data. Upload yours above for real results."}
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TESTS.map((test) => {
            const isDone = !!results[test.id];
            const isError = results[test.id]?.error;
            const statusColor = isError ? "#ef4444" : isDone ? "#10b981" : null;
            return (
              <div key={test.id} className="rounded-xl border overflow-hidden transition-all"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: statusColor ? statusColor + "44" : "rgba(255,255,255,0.08)" }}>
                <div className="p-4 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: test.color + "20" }}>
                      <test.Icon className="w-4 h-4" style={{ color: test.color }} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        {test.label}
                        {isDone && !isError && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isError && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                      <div className="text-xs text-gray-400">{test.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => runTest(test)}
                    disabled={loading[test.id]}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-40 flex-shrink-0"
                    style={{
                      background: "#000034",
                      color: "white",
                      border: `1px solid rgba(255,255,255,0.15)`,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading[test.id]) e.currentTarget.style.background = "#1e40af";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#000";
                    }}
                  >
                    {loading[test.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    {loading[test.id] ? "Running..." : "Run"}
                  </button>
                </div>
                <div className="p-4 min-h-[90px]">
                  {loading[test.id] && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      Calling Groq AI — this takes ~5-10s...
                    </div>
                  )}
                  {!loading[test.id] && !results[test.id] && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 italic">
                      <Play className="w-3.5 h-3.5" />No result yet — click Run to test
                    </div>
                  )}
                  {results[test.id] && <ResultRenderer data={results[test.id]} />}
                </div>
              </div>
            );
          })}
        </div>

        <SampleDataSection resumeText={resumeText} usingUpload={usingUpload} />
      </div>
    </div>
  );
}