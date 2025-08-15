import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";

interface Props {
  title: string;
  topic: string; // tambahkan prop topic
  onTitleChange: (title: string) => void;
  isTyping: boolean;
}

export function DocTopBar({ title, topic, onTitleChange, isTyping }: Props) {
  const [isTitleEdited, setIsTitleEdited] = useState(false);

  // Sinkronkan title dengan topic saat title belum diubah manual
  useEffect(() => {
    if (!isTitleEdited) {
      onTitleChange(topic || "");
    }
  }, [topic, isTitleEdited, onTitleChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTitleEdited(true);
    onTitleChange(e.target.value);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-3">
        <FileText size={20} className="text-blue-600" />
        <input
          type="text"
          value={title}
          onChange={handleChange}
          placeholder="Judul dokumen..."
          disabled={isTyping}
          className="text-lg font-medium text-gray-900 bg-transparent border-none outline-none flex-1 disabled:text-gray-600"
        />
      </div>
    </div>
  );
}
