import React from "react";
import { Play, RotateCcw } from "lucide-react";

interface Props {
  topic: string;
  lang: "id" | "en";
  tone: "netral" | "formal" | "santai" | "persuasif" | "naratif";
  mode: "serious" | "infinite";
  length: "ringkas" | "sedang" | "panjang";
  isLoading: boolean;
  isTyping: boolean;
  onTopicChange: (topic: string) => void;
  onLangChange: (lang: "id" | "en") => void;
  onToneChange: (
    tone: "netral" | "formal" | "santai" | "persuasif" | "naratif"
  ) => void;
  onModeChange: (mode: "serious" | "infinite") => void;
  onLengthChange: (length: "ringkas" | "sedang" | "panjang") => void;
  onStart: () => void;
  onReset: () => void;
}

export function PreSettingsPanel({
  topic,
  lang,
  tone,
  mode,
  length,
  isLoading,
  isTyping,
  onTopicChange,
  onLangChange,
  onToneChange,
  onModeChange,
  onLengthChange,
  onStart,
  onReset,
}: Props) {
  const isDisabled = isLoading || isTyping;
  const canStart = topic.trim().length > 0 && !isDisabled;

  return (
    <div className="bg-white  rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Pengaturan Penulisan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topik <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="Masukkan topik yang ingin dibahas..."
            disabled={isDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bahasa
          </label>
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value as "id" | "en")}
            disabled={isDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nada
          </label>
          <select
            value={tone}
            onChange={(e) => onToneChange(e.target.value as any)}
            disabled={isDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="netral">Netral</option>
            <option value="formal">Formal</option>
            <option value="santai">Santai</option>
            <option value="persuasif">Persuasif</option>
            <option value="naratif">Naratif</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode Penulisan
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="serious"
                checked={mode === "serious"}
                onChange={(e) => onModeChange(e.target.value as "serious")}
                disabled={isDisabled}
                className="mr-2"
              />
              <span className="text-sm">SERIUS/TUGAS</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="infinite"
                checked={mode === "infinite"}
                onChange={(e) => onModeChange(e.target.value as "infinite")}
                disabled={isDisabled}
                className="mr-2"
              />
              <span className="text-sm">INFINITE</span>
            </label>
          </div>
        </div>

        {mode === "serious" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panjang
            </label>
            <select
              value={length}
              onChange={(e) => onLengthChange(e.target.value as any)}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="ringkas">Ringkas (~250 kata)</option>
              <option value="sedang">Sedang (~600 kata)</option>
              <option value="panjang">Panjang (~1000 kata)</option>
            </select>
          </div>
        )}

        <div className="md:col-span-2 flex gap-3 pt-2">
          <button
            onClick={onStart}
            disabled={!canStart}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={16} />
            {isLoading ? "Memuat..." : "Mulai Mengetik"}
          </button>

          <button
            onClick={onReset}
            disabled={isDisabled}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
