import React from "react";
import { Copy, Download, RotateCcw } from "lucide-react"; // ⬅️ tambah RotateCcw
import { slugify } from "../lib/textUtils";

interface Props {
  content: string;
  title: string;
  onReset?: () => void; // ⬅️ tambah
}

export function FooterActions({ content, title, onReset }: Props) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      console.log("Text copied to clipboard");
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleExport = () => {
    const filename = slugify(title || "dokumen") + ".txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center gap-3">
        {/* kiri: salin & ekspor */}
        <button
          onClick={handleCopy}
          disabled={!content.trim()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Copy size={14} />
          Salin Teks
        </button>

        <button
          onClick={handleExport}
          disabled={!content.trim()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={14} />
          Ekspor .txt
        </button>

        {/* kanan: Reset → kembali ke presetting */}
        <button
          data-no-reveal
          onClick={onReset}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
