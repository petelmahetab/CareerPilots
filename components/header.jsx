import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon, FlaskConical, Map,Zap
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default async function Header() {

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h3 className="text-2xl font-extrabold tracking-tight flex items-center gap-0">
          <span className="text-foreground">AI Career</span>
          <span className="relative ml-2">
            <span
              suppressHydrationWarning
              className="text-[#1a3a6b] drop-shadow-sm relative z-10"
              style={{
                background: "linear-gradient(135deg, #1a3a6b 0%, #2563eb 50%, #1e40af 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 1px 2px rgba(26,58,107,0.15))",
              }}
            >
              Coach
            </span>
            {/* Animated underline */}
            <span
              suppressHydrationWarning
              className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #1a3a6b, #2563eb, #60a5fa)",
                animation: "shimmer 2.5s ease-in-out infinite",
                backgroundSize: "200% auto",
              }}
            />
          </span>

          <span
            suppressHydrationWarning
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-600 self-start mt-1"
            style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
          />
        </h3>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <SignedIn>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Industry Insights
              </Button>
              <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/guide">
              <Button variant="outline" className="hidden md:inline-flex items-center gap-2">
                <Map className="h-4 w-4" />
                Roadmap
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="hidden md:inline-flex items-center gap-2 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10">
                <Zap className="h-4 w-4" />
                Upgrade
              </Button>
            </Link>
            {/* Growth Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2">
                  <StarsIcon className="h-4 w-4" />
                  <span className="hidden md:block">Growth Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Build Resume
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/ai-cover-letter"
                    className="flex items-center gap-2"
                  >
                    <PenBox className="h-4 w-4" />
                    Cover Letter
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/resume/test" className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Resume Health  Checking Tools
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Interview Prep
                  </Link>
                </DropdownMenuItem>


              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header >
  );
}
