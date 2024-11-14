//src/components/admin/editor/video-time-editor.tsx
import React, { useCallback, useMemo } from "react";
import { NestedLexicalEditor, useMdastNodeUpdater } from "@mdxeditor/editor";
import type { JsxEditorProps } from "@mdxeditor/editor";
import {
  Play,
  Pause,
  ArrowLeftToLine,
  ArrowRightToLine,
  SkipBack,
} from "lucide-react";
import { useVideoContext } from "@/contexts/video-context";
import { cn, formatTime } from "@/lib/utils";
import {
  MdxJsxAttributeValueExpression,
  MdxJsxFlowElement,
} from "mdast-util-mdx-jsx";

const isStringValue = (
  value: string | MdxJsxAttributeValueExpression | null | undefined
): value is string => typeof value === "string";

/**
 * Action button that appears on hover
 */
const ActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
  time?: number;
}> = ({ onClick, icon, label, className, time }) => (
  <div className="flex gap-1 items-center justify-start">
    {time !== undefined && (
      <span className="text-xs text-gray-500 w-[28px] text-left">{formatTime(time)}</span>
    )}

    <button
      onClick={onClick}
      className={cn(
        // Base styles
        "p-1.5 rounded-lg",
        "bg-primary/10 hover:bg-primary/20",
        "text-primary hover:text-primary/80",
        // Visibility
        "md:opacity-0 md:group-hover:opacity-100",
        // Transitions
        "transition-all duration-200",
        className
      )}
      title={label}
    >
      {icon}
    </button>
  </div>
);

/**
 * Custom editor component that mimics VideoTimeAt's UI
 */
export const VideoTimeEditor: React.FC<JsxEditorProps> = ({
  mdastNode,
}: JsxEditorProps) => {
  const { player, isPlaying, playSegment, pauseVideo } = useVideoContext();
  const updateMdastNode = useMdastNodeUpdater();

  const attributes = mdastNode?.attributes;

  const startTime = useMemo(() => {
    const attr = attributes.find((attr) => attr.name === "startTime");
    if (isStringValue(attr?.value)) {
      return attr.value || 0;
    }
    return attr?.value?.value || 0;
  }, [attributes]);

  const endTime = useMemo(() => {
    const attr = attributes.find((attr) => attr.name === "endTime");
    if (isStringValue(attr?.value)) {
      return attr.value || 0;
    }
    return attr?.value?.value || 0;
  }, [attributes]);

  const isCurrentSegment =
    isPlaying &&
    player?.getCurrentTime() >= +startTime &&
    player?.getCurrentTime() <= +endTime;

  const handleSetCurrentTime = useCallback(
    (name: "startTime" | "endTime") => {
      updateMdastNode({
        attributes: mdastNode.attributes.map((attr) => {
          if (attr.name === name) {
            if (isStringValue(attr.value)) {
              return { ...attr, value: player?.getCurrentTime() };
            } else {
              return {
                ...attr,
                value: { ...attr.value, value: player?.getCurrentTime() },
              };
            }
          }
          return attr;
        }),
      });
    },
    [mdastNode.attributes, player, updateMdastNode]
  );

  const handlePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      pauseVideo();
    } else {
      playSegment(+startTime, +endTime);
    }
  };

  return (
    <div className="group relative">
      {/* Action Buttons - Only visible on hover */}
      {player && (
        <div className="absolute right-[-70px] top-0 flex flex-col items-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <ActionButton
            onClick={handlePlayPause}
            icon={
              isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )
            }
            label={isPlaying ? "ايقاف" : "بدء التشغيل"}
            time={player?.getCurrentTime() || 0}
          />

          <ActionButton
            onClick={() => handleSetCurrentTime("startTime")}
            icon={<ArrowRightToLine className="h-4 w-4" />}
            label="حدد وقت البداية"
            time={+startTime}
          />
          <ActionButton
            onClick={() => handleSetCurrentTime("endTime")}
            icon={<ArrowLeftToLine className="h-4 w-4" />}
            label="حدد وقت النهاية"
            time={+endTime}
          />
          {/* <ActionButton
            onClick={() => player.}
            icon={<SkipBack className="h-4 w-4" />}
            label="رجوع 10 ثواني"
          /> */}
        </div>
      )}
      {/* Content Editor */}
      <div
        className={cn(
          "nestedEditorWrapper",
          isCurrentSegment &&
            "bg-primary/5 rounded-lg transition-colors duration-200"
        )}
      >
        <NestedLexicalEditor<MdxJsxFlowElement>
          block
          getContent={(node) => node.children}
          getUpdatedMdastNode={(mdastNode, children) => {
            return { ...mdastNode, children } as any;
          }}
        />
      </div>
    </div>
  );
};
