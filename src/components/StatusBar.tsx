import React from "react";
import { countWords } from "../lib/textUtils";

interface Props {
  mode: "serious" | "infinite";
  bufferText: string;
  typedText: string;
  typedIndex: number;
  paragraphCount: number; // tetap di-props, tapi tidak ditampilkan di infinite
  targetWords?: number;
}

export function StatusBar({
  mode,
  bufferText,
  typedText,
  typedIndex,
  targetWords,
}: Props) {
  const currentWords = countWords(typedText);

  if (mode === "serious") {
    const progress =
      bufferText.length > 0
        ? Math.round((typedIndex / bufferText.length) * 100)
        : 0;

    return (
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Target ~{targetWords || 0} kata | {currentWords} kata diketik
          </span>
          <span>{progress}% selesai</span>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // mode infinite: TANPA paragraf count
  return (
    <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Mode berkelanjutan | {currentWords} kata diketik</span>
      </div>
    </div>
  );
}
