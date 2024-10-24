'use client';

import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';

export function LessonContentWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const { fontSize } = useSettings();
  
  return (
    <article className={cn(
      "prose prose-lg dark:prose-invert max-w-none",
      `prose-${fontSize}`
    )}>
      {children}
    </article>
  );
}