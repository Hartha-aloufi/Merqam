"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import { useMemo } from "react";

/**
 * Client component that handles sticky header behavior
 */
export const StickyHeader = () => {
  const pathname = usePathname();
  // Matches routes like /topics/[topicId]/[lessonId] but not /topics/[topicId]/[lessonId]/exercise
  const isLessonPage = useMemo(
    () => /^\/topics\/[^\/]+\/[^\/]+\/?$/.test(pathname),
    [pathname]
  );

  return (
    <header
      className={cn(
        "bg-background border-b z-50 transition-all duration-300",
        isLessonPage && "sticky top-0"
      )}
    >
      <Navbar />
    </header>
  );
};
