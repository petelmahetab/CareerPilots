import { getIndustryInsights } from "@/actions/dashboard";
import { getDomainFeed } from "@/actions/blogs";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  // Fetch both in parallel
  const [insights, feedData] = await Promise.all([
    getIndustryInsights(),
    getDomainFeed(),
  ]);

  return (
    <div className="container mx-auto space-y-6">

      <div className="relative w-full h-[220px] md:h-[280px] rounded-2xl overflow-hidden">
        <Image
          src="/banner2.jpeg"
          alt="AI Career Coach Dashboard"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Your Industry at a Glance
          </h2>
          <p className="text-gray-300 text-sm mt-1 max-w-md">
            Real-time insights, salary trends, and top skills — personalized to your career path.
          </p>
        </div>
      </div>

      <DashboardView insights={insights} feedData={feedData} />

    </div>
  );
}