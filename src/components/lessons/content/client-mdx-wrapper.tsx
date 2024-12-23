"use client";

import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { HighlightContainer } from "@/components/highlight/HighlightContainer";
import { useEffect } from "react";

interface MDXClientWrapperProps {
  children: React.ReactNode;
  topicId: string;
  lessonId: string;
}

/**
 * Client wrapper for MDX content that handles:
 * - Font size settings
 * - Heading visibility settings
 * - Text highlighting functionality
 */
export function MDXClientWrapper({
  children,
  topicId,
  lessonId,
}: MDXClientWrapperProps) {
  const { fontSize, showHeadings } = useSettings();

  useEffect(() => {
    console.log('finish rendering mdx wrapper');
  }, []);

  return (
    <HighlightContainer
      topicId={topicId}
      lessonId={lessonId}
      className={cn(
        "dark:prose-invert max-w-none",
        `prose-${fontSize}`,
        !showHeadings && "prose-no-headings"
      )}
    >
      {children}
    </HighlightContainer>
  );
}
