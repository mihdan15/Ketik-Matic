import React from "react";

interface Props {
  typingMode: "char" | "word" | "chunk";
  mode: "serious" | "infinite";
  onTypingModeChange: (mode: "char" | "word" | "chunk") => void;
}

export function EditorToolbar({ typingMode, mode, onTypingModeChange }: Props) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600">Mode Ketik:</label>
        <select
          value={typingMode}
          onChange={(e) => onTypingModeChange(e.target.value as any)}
          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="char">Per Karakter</option>
          <option value="word">Per Kata</option>
          <option value="chunk">Per Chunk (5–9)</option>
        </select>
      </div>

      <div className="ml-auto">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "serious"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {mode === "serious" ? "SERIOUS" : "INFINITE"}
        </span>
      </div>
    </div>
  );
}
