// app/admin/topics/[topicId]/[lessonId]/edit/page.tsx
"use client";

import { useState } from "react";
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

interface PageProps {
  lesson: Lesson;
  params: {
    topicId: string;
    lessonId: string;
  };
}

export default function AdminLessonEditPage(props: PageProps) {
  const [lesson, setLesson] = useState<{
    title: string;
    content: string;
    youtubeUrl?: string;
  } | null>(props.lesson);

  const [isSaving, setIsSaving] = useState(false);

  const params = props.params;

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

  if (!lesson) return notFound();

  return (
    <div>
      <EditorToolbar onSave={handleSave} isSaving={isSaving} />

      <div className="container py-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MDXEditor
            markdown={lesson.content}
            onChange={(content: string) => {
              setLesson((prev) => (prev ? { ...prev, content } : null));
            }}
            contentEditableClassName="min-h-[500px] outline-none"
            plugins={[
              // Example Plugin Usage
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              toolbarPlugin({
                toolbarClassName: "my-classname",
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
