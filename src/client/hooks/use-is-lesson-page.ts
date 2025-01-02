"use client";

import { usePathname } from "next/navigation";

/**
 * Custom hook to check if the current page is a lesson page
 * @returns boolean indicating if current route is a lesson page
 */
export const useIsLessonPage = () => {
  const pathname = usePathname();
  // Matches routes like /topics/[topicId]/[lessonId] but not /topics/[topicId]/[lessonId]/exercise
  return /^\/topics\/[^/]+\/[^/]+$/.test(pathname);
};
