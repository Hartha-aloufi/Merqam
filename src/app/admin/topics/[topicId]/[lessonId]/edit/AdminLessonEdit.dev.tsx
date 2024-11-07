// app/admin/topics/[topicId]/[lessonId]/edit/AdminLessonEdit.dev.tsx
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
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { debounce } from "lodash";

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
            { content }
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
    <div>
      <EditorToolbar onSave={handleSave} isSaving={isSaving} />

      <div className="container py-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MDXEditor
            markdown={lesson.content}
            onChange={handleChange}
            contentEditableClassName="min-h-[500px] outline-none"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    {" "}
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                  </>
                ),
              }),
            ]}
          />
        </div>
      </div>
    </div>
  );
}
