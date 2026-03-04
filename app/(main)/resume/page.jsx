import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import Image from "next/image";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="space-y-0">

      {/* ── Hero Banner Strip ── */}
      <div className="relative w-full h-[140px] md:h-[180px] rounded-2xl overflow-hidden mb-6">
        <Image
          src="/banner.jpeg"
          alt="Resume Builder Banner"
          fill
          priority
          className="object-cover object-top"
        />
        {/* Left-to-right gradient so text pops */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

        {/* Text on banner */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-bold gradient-title">
            Resume Builder
          </h1>
          <p className="text-gray-300 text-xs md:text-sm mt-1">
            Build, preview, and download your ATS-ready resume
          </p>
        </div>
      </div>

    
      <div className="container mx-auto py-2">
        <ResumeBuilder initialContent={resume?.content} />
      </div>

    </div>
  );
}