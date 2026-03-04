import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";
import Image from "next/image";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="space-y-6">

      {/* ── Hero Banner Strip ── */}
      <div className="relative w-full h-[160px] md:h-[200px] rounded-2xl overflow-hidden">
        <Image
          src="/banner.jpeg"
          alt="Cover Letter Banner"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        {/* Title + button ON the banner */}
        <div className="absolute inset-0 flex items-center justify-between px-6 md:px-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold gradient-title">
              My Cover Letters
            </h1>
            <p className="text-gray-300 text-xs md:text-sm mt-1">
              AI-generated, tailored to every job you apply for
            </p>
          </div>
          <Link href="/ai-cover-letter/new">
            <Button className="flex-shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </Link>
        </div>
      </div>

   
      <CoverLetterList coverLetters={coverLetters} />

    </div>
  );
}