import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import Image from "next/image";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div className="relative min-h-screen">

      {/* ── Full page background ── */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/banner2.jpeg"
          alt="Interview Prep Background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Darker overlay for content readability */}
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 space-y-6">

        {/* Page title */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-6xl font-bold gradient-title">
            Interview Preparation
          </h1>
        </div>

        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />

      </div>
    </div>
  );
}