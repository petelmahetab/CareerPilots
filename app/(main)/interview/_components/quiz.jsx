"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import {
  CheckCircle2, XCircle, ChevronRight, Code2,
  BookOpen, Youtube, Globe, ExternalLink,
  BrainCircuit, Zap, ArrowRight, RotateCcw,
  Trophy, Target, Lightbulb,
} from "lucide-react";

// ── Resource icon ─────────────────────────────────────────────
function ResourceIcon({ type }) {
  if (type === "video")   return <Youtube  className="w-4 h-4 text-red-400"     />;
  if (type === "docs")    return <BookOpen  className="w-4 h-4 text-blue-400"   />;
  if (type === "article") return <Globe     className="w-4 h-4 text-indigo-400" />;
  return                         <BookOpen  className="w-4 h-4 text-gray-400"   />;
}

// ── Code block ────────────────────────────────────────────────
function CodeBlock({ code }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10"
        style={{ background: "rgba(255,255,255,0.05)" }}>
        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
      </div>
      <pre className="p-4 text-sm text-gray-200 overflow-x-auto leading-relaxed"
        style={{ background: "rgba(0,0,0,0.4)", fontFamily: "monospace" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Option button ─────────────────────────────────────────────
function OptionButton({ option, selected, onSelect, showResult, isCorrect, isUserAnswer }) {
  let borderColor = "rgba(255,255,255,0.1)";
  let bg = "rgba(255,255,255,0.02)";
  let textColor = "text-gray-300";

  if (showResult) {
    if (isCorrect) {
      borderColor = "rgba(16,185,129,0.5)"; bg = "rgba(16,185,129,0.1)"; textColor = "text-emerald-300";
    } else if (isUserAnswer && !isCorrect) {
      borderColor = "rgba(239,68,68,0.5)"; bg = "rgba(239,68,68,0.1)"; textColor = "text-red-300";
    }
  } else if (selected) {
    borderColor = "rgba(99,102,241,0.6)"; bg = "rgba(99,102,241,0.15)"; textColor = "text-indigo-300";
  }

  return (
    <button
      onClick={() => !showResult && onSelect(option)}
      disabled={showResult}
      className="w-full text-left p-3.5 rounded-xl border text-sm transition-all hover:border-white/20 flex items-center gap-3"
      style={{ borderColor, background: bg }}
    >
      <span className={`flex-1 ${textColor}`}>{option}</span>
      {showResult && isCorrect  && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
      {showResult && isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
    </button>
  );
}

// ── Theoretical Topic Card (non-IT) ───────────────────────────
function TheoreticalTopicCard({ topic, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.05)" }}>
      <button onClick={() => setOpen(p => !p)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(99,102,241,0.2)" }}>
          <Lightbulb className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">Study Topic {index + 1}: {topic.topic}</div>
          <div className="text-xs text-gray-400 mt-0.5">{topic.whyImportant}</div>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10">
          {/* Key points */}
          {topic.keyPoints?.length > 0 && (
            <div className="pt-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Key Points to Cover
              </div>
              <div className="space-y-2">
                {topic.keyPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    {pt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {topic.resources?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Best Resources to Study
              </div>
              <div className="space-y-2">
                {topic.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border text-sm transition-all hover:opacity-80"
                    style={{
                      background:   r.type === "video" ? "rgba(239,68,68,0.08)"   : r.type === "docs" ? "rgba(59,130,246,0.08)"   : "rgba(99,102,241,0.08)",
                      borderColor:  r.type === "video" ? "rgba(239,68,68,0.2)"    : r.type === "docs" ? "rgba(59,130,246,0.2)"    : "rgba(99,102,241,0.2)",
                      color:        r.type === "video" ? "#f87171"                : r.type === "docs" ? "#60a5fa"                 : "#a5b4fc",
                    }}>
                    <ResourceIcon type={r.type} />
                    <span className="flex-1">{r.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Start screen ──────────────────────────────────────────────
function StartScreen({ onStart, isIT }) {
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>

      {/* Header banner */}
      <div className="p-6 border-b border-white/10"
        style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.25)" }}>
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Ready to test your knowledge?</h2>
            <p className="text-xs text-gray-400 mt-0.5">AI-generated, personalized to your profile</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {isIT ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Target,      color: "#6366f1", label: "7 MCQ Questions",      desc: "Role-specific interview prep" },
              { icon: Code2,       color: "#8b5cf6", label: "3 Output Questions",   desc: "Predict what the code prints" },
              { icon: Zap,         color: "#3b82f6", label: "Difficulty Scaled",    desc: "Based on your experience" },
              { icon: RotateCcw,   color: "#10b981", label: "Fresh Every Time",     desc: "New questions on each attempt" },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="p-3 rounded-xl border"
                style={{ borderColor: color + "30", background: color + "08" }}>
                <Icon className="w-4 h-4 mb-2" style={{ color }} />
                <div className="text-sm font-bold text-white">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Target,    color: "#6366f1", label: "8 MCQ Questions",        desc: "Most commonly asked in interviews" },
              { icon: BookOpen,  color: "#8b5cf6", label: "2 Study Topics",         desc: "With best external resources" },
              { icon: Zap,       color: "#3b82f6", label: "Industry Focused",       desc: "Specific to your domain" },
              { icon: RotateCcw, color: "#10b981", label: "Fresh Every Time",       desc: "New questions on each attempt" },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="p-3 rounded-xl border"
                style={{ borderColor: color + "30", background: color + "08" }}>
                <Icon className="w-4 h-4 mb-2" style={{ color }} />
                <div className="text-sm font-bold text-white">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onStart}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Zap className="w-4 h-4" />
          Start Quiz
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Quiz question card ────────────────────────────────────────
function QuestionCard({
  question, index, total, answer, onAnswer,
  showExplanation, onShowExplanation, onNext, saving,
}) {
  const isOutput = question.type === "output";
  const isAnswered = !!answer;
  const isLast = index === total - 1;

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>

      {/* Progress bar */}
      <div className="h-1 w-full bg-white/10">
        <div className="h-full transition-all duration-500"
          style={{ width: `${((index + 1) / total) * 100}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
      </div>

      <div className="p-6 space-y-5">
        {/* Question header */}
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black
            ${isOutput ? "bg-purple-500/20 text-purple-300" : "bg-indigo-500/20 text-indigo-300"}`}>
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isOutput
                ? <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-purple-300"
                    style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
                    <Code2 className="w-3 h-3 inline mr-1" />Output Based
                  </span>
                : <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-indigo-300"
                    style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
                    MCQ
                  </span>
              }
              <span className="text-xs text-gray-600">{index + 1} / {total}</span>
            </div>
            <p className="text-base font-semibold text-white leading-relaxed">{question.question}</p>
          </div>
        </div>

        {/* Code block for output questions */}
        {isOutput && question.code && <CodeBlock code={question.code} />}

        {/* Options */}
        <div className="space-y-2">
          {question.options?.map((opt, i) => (
            <OptionButton
              key={i}
              option={opt}
              selected={answer === opt}
              onSelect={onAnswer}
              showResult={showExplanation}
              isCorrect={opt === question.correctAnswer}
              isUserAnswer={answer === opt}
            />
          ))}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="p-4 rounded-xl border"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Explanation</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1">
          {!showExplanation ? (
            <button
              onClick={onShowExplanation}
              disabled={!isAnswered}
              className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" /> Show Explanation
            </button>
          ) : <div />}

          <button
            onClick={onNext}
            disabled={!isAnswered || saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              : isLast
                ? <><Trophy className="w-4 h-4" />Finish Quiz</>
                : <>Next <ChevronRight className="w-4 h-4" /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generating loader ─────────────────────────────────────────
function GeneratingLoader() {
  const [step, setStep] = useState(0);
  const steps = [
    "Reading your profile...",
    "Detecting your domain...",
    "Crafting personalized questions...",
    "Adding output-based challenges...",
    "Finalizing your quiz...",
  ];
  useEffect(() => {
    const t = setInterval(() => setStep(p => (p + 1) % steps.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "rgba(99,102,241,0.2)" }} />
        <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)" }}>
          <BrainCircuit className="w-7 h-7 text-indigo-400" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-bold">Generating your quiz...</p>
        <p className="text-indigo-300 text-sm mt-1">{steps[step]}</p>
      </div>
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i <= step ? "#6366f1" : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Main Quiz Component ───────────────────────────────────────
export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizMeta, setQuizMeta] = useState(null); // { isIT, domain, theoreticalTopics }
  const [showTopics, setShowTopics] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
    setData: setQuizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  // ── When quiz data arrives ────────────────────────────────
  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.questions.length).fill(null));
      setQuizMeta({
        isIT:             quizData.isIT,
        domain:           quizData.domain,
        theoreticalTopics: quizData.theoreticalTopics || [],
      });
    }
  }, [quizData]);

  const questions = quizData?.questions || [];
  const question  = questions[currentQuestion];

  const handleAnswer = (answer) => {
    const updated = [...answers];
    updated[currentQuestion] = answer;
    setAnswers(updated);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(p => p + 1);
      setShowExplanation(false);
    } else {
      // Last question — save
      let correct = 0;
      answers.forEach((ans, i) => {
        if (ans === questions[i].correctAnswer) correct++;
      });
      const score = (correct / questions.length) * 100;
      try {
        await saveQuizResultFn(questions, answers, score);
        // After save, show theoretical topics for non-IT
        if (quizMeta && !quizMeta.isIT && quizMeta.theoreticalTopics?.length > 0) {
          setShowTopics(true);
        }
        toast.success("Quiz completed!");
      } catch (e) {
        toast.error(e.message || "Failed to save quiz results");
      }
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setResultData(null);
    setQuizData(null);
    setQuizMeta(null);
    setShowTopics(false);
    generateQuizFn();
  };

  // ── Generating ───────────────────────────────────────────
  if (generatingQuiz) return <GeneratingLoader />;

  // ── Results with optional theoretical topics ─────────────
  if (resultData) {
    return (
      <div className="space-y-6 mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />

        {/* Non-IT: show study topics after results */}
        {quizMeta && !quizMeta.isIT && quizMeta.theoreticalTopics?.length > 0 && (
          <div className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.05)" }}>
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Study These Topics Next</h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                These are the most important theoretical topics interviewers ask about in {quizMeta.domain}
              </p>
            </div>
            <div className="p-4 space-y-3">
              {quizMeta.theoreticalTopics.map((t, i) => (
                <TheoreticalTopicCard key={i} topic={t} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── No quiz yet — start screen ────────────────────────────
  if (!quizData) {
    return (
      <div className="mx-2">
        <StartScreen
          onStart={generateQuizFn}
          isIT={true} // default; updates after first load
        />
      </div>
    );
  }

  // ── Quiz in progress ──────────────────────────────────────
  return (
    <div className="mx-2 space-y-4">
      {/* Domain badge */}
      {quizMeta && (
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{
              background: quizMeta.isIT ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.15)",
              border:     quizMeta.isIT ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(16,185,129,0.3)",
              color:      quizMeta.isIT ? "#a5b4fc" : "#6ee7b7",
            }}>
            {quizMeta.isIT ? "🖥️ IT / Tech Quiz" : `📋 ${quizMeta.domain} Quiz`}
          </span>
          <span className="text-xs text-gray-500">
            {questions.length} questions • Fresh from AI
          </span>
        </div>
      )}

      <QuestionCard
        question={question}
        index={currentQuestion}
        total={questions.length}
        answer={answers[currentQuestion]}
        onAnswer={handleAnswer}
        showExplanation={showExplanation}
        onShowExplanation={() => setShowExplanation(true)}
        onNext={handleNext}
        saving={savingResult}
      />
    </div>
  );
}