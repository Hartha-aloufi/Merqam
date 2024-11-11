//src/components/admin/editor/video-time-editor.tsx
import React, { useCallback, useState } from "react";
import { NestedLexicalEditor } from "@mdxeditor/editor";
import type { MdxJsxFlowElement, JsxEditorProps } from "@mdxeditor/editor";
import { Play, Pause, ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { useVideoContext } from "@/contexts/video-context";
import { cn, formatTime } from "@/lib/utils";
import { start } from "repl";

/**
 * Action button that appears on hover
 */
const ActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}> = ({ onClick, icon, label, className }) => (
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
);

/**
 * Custom editor component that mimics VideoTimeAt's UI
 */
export const VideoTimeEditor: React.FC<JsxEditorProps> = ({
  mdastNode,
}: JsxEditorProps) => {
  const { player, isPlaying, playSegment, pauseVideo } = useVideoContext();

  const attributes = mdastNode?.attributes || [];
  const [startTime, setStartTime] = useState(
    () => attributes.find((attr) => attr.name === "startTime")?.value ?? 0
  );
  const [endTime, setEndTime] = useState(
    () => attributes.find((attr) => attr.name === "endTime")?.value ?? 10
  );

  const handleSetCurrentTime = useCallback(
    (type: "start" | "end") => {
      if (!player) return;
      const currentTime = player.getCurrentTime();
      if (type === "start") {
        setStartTime(currentTime);
      } else {
        setEndTime(currentTime);
      }
    },
    [player]
  );

  const handlePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      pauseVideo();
    } else {
      playSegment(startTime, endTime);
    }
  };

  return (
    <div className="group relative">
      {/* Action Buttons - Only visible on hover */}
      {player && (
        <div className="absolute right-[-70px] top-0 flex flex-col items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <div className="text-xs text-muted-foreground">
            {formatTime(startTime)} ← {formatTime(endTime)}
          </div>

          <ActionButton
            onClick={handlePlayPause}
            icon={
              isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )
            }
            label={isPlaying ? "Pause Segment" : "Play Segment"}
          />
          <ActionButton
            onClick={() => handleSetCurrentTime("start")}
            icon={<ArrowRightToLine className="h-4 w-4" />}
            label="Set Start Time"
          />
          <ActionButton
            onClick={() => handleSetCurrentTime("end")}
            icon={<ArrowLeftToLine className="h-4 w-4" />}
            label="Set End Time"
          />
        </div>
      )}
      {/* Content Editor */}
      <div className="nestedEditorWrapper">
        <NestedLexicalEditor<MdxJsxFlowElement>
          block
          getContent={(node) => node.children}
          getUpdatedMdastNode={(mdastNode, children) => {
            mdastNode.attributes = [
              { name: "startTime", value: startTime + "" },
              { name: "endTime", value: endTime + "" },
            ];
            return { ...mdastNode, children };
          }}
        />
      </div>
    </div>
  );
};
