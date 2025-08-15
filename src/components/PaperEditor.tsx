import React from "react";

interface Props {
  title: string;
  content: string;
  cursorPosition: number;
  insertMode: "append" | "cursor";
  onContentChange: (content: string) => void;
  onCursorPositionChange: (position: number) => void;
  readOnly?: boolean;
  showCaret?: boolean;
}

export function PaperEditor({
  title,
  content,
  cursorPosition,
  insertMode,
  readOnly = true,
  showCaret = true,
}: Props) {
  const caretPos =
    typeof cursorPosition === "number"
      ? Math.max(0, Math.min(cursorPosition, content.length))
      : content.length;

  const before = content.slice(0, caretPos);
  const after = content.slice(caretPos);

  return (
    <div className="flex-1 bg-gray-100 px-3 sm:px-6 py-4 sm:py-6">
      <div className="mx-auto w-full max-w-[816px]">
        <div
          className="
            bg-white shadow-lg rounded-lg
            p-4 sm:p-6 md:p-8
            min-h-[60vh] lg:min-h-screen
            w-full
          "
        >
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-gray-200">
            {title || "Dokumen Tanpa Judul"}
          </h1>

          {/* Editor non-editable, caret custom */}
          <div
            contentEditable={false}
            className="
              min-h-96 text-gray-900 leading-relaxed focus:outline-none
              break-words
            "
            style={{
              fontFamily: "Inter, Arial, sans-serif",
              // font responsif: enak dibaca di HP sampai desktop
              fontSize: "clamp(14px, 3.2vw, 15px)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              userSelect: "none",
              cursor: "default",
            }}
            suppressContentEditableWarning
            onKeyDown={(e) => e.preventDefault()}
          >
            <span>{before}</span>
            {showCaret && (
              <span
                aria-hidden="true"
                className="km-caret"
                style={{
                  display: "inline-block",
                  width: "1px",
                  height: "1em",
                  background: "#111",
                  verticalAlign: "text-bottom",
                  animation: "kmBlink 1s step-start infinite",
                }}
              />
            )}
            <span>{after}</span>
          </div>
        </div>
      </div>

      {/* keyframes untuk blink */}
      <style>{`
        @keyframes kmBlink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
