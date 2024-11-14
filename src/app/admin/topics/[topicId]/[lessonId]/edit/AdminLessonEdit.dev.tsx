// src/app/admin/topics/[topicId]/[lessonId]/edit/AdminLessonEdit.dev.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { MDXEditor } from "@mdxeditor/editor";
import { adminLessonsService } from "@/services/admin/lessons.service";
import { EditorToolbar } from "@/components/admin/editor/editor-toolbar";
import { toast } from "sonner";
import { Lesson } from "@/types";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  BlockTypeSelect,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  jsxPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { debounce } from "lodash";
import { jsxComponentDescriptors } from "@/components/admin/editor/jsx-components-config";
import { InsertVideoTime } from "@/components/admin/editor/jsx-toolbar";
import { VideoProvider } from "@/contexts/video-context";
import { YouTubeMusicPlayer } from "@/components/lessons/YouTubeMusicPlayer";
import { cn, tajawal } from "@/lib/utils";

interface PageProps {
  lesson: Lesson;
  params: {
    topicId: string;
    lessonId: string;
  };
}

export default function AdminLessonEditPage({
  lesson: initialLesson,
  params,
}: PageProps) {
  const [lesson, setLesson] = useState<{
    title: string;
    content: string;
    youtubeUrl?: string;
  } | null>(initialLesson);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!lesson) return;

    try {
      setIsSaving(true);
      await adminLessonsService.updateLesson(params.topicId, params.lessonId, {
        content: lesson.content,
      });
      toast.success("Lesson saved successfully");
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error("Failed to save lesson");
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced auto-save
  const debouncedSave = useMemo(
    () =>
      debounce(async (content: string) => {
        try {
          await adminLessonsService.updateLesson(
            params.topicId,
            params.lessonId,
            {
              content,
            }
          );
          toast.success("Autosaved successfully");
        } catch (error) {
          console.error("Autosave error:", error);
          toast.error("Failed to autosave");
        }
      }, 2000),
    [params.topicId, params.lessonId]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  if (!lesson) return notFound();

  const handleChange = (content: string) => {
    setLesson((prev) => (prev ? { ...prev, content } : null));
    debouncedSave(content);
  };

  return (
    <VideoProvider>
      <EditorToolbar onSave={handleSave} isSaving={isSaving} />

      {/* Add padding to account for fixed toolbar */}
      <div className="container max-w-3xl mx-auto px-4">
        <div className="prose prose-lg dark:prose-invert max-w-none ">
          <MDXEditor
            markdown={lesson.content}
            onChange={handleChange}
            contentEditableClassName={cn(
              "min-h-[500px] outline-none ",
              tajawal.className
            )}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              jsxPlugin({ jsxComponentDescriptors }),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    {" "}
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                    <InsertVideoTime />
                  </>
                ),
              }),
            ]}
          />
        </div>
      </div>

      {lesson.youtubeUrl && (
        <YouTubeMusicPlayer youtubeUrl={lesson.youtubeUrl} />
      )}
    </VideoProvider>
  );
}
