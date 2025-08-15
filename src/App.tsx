import React, { useState, useCallback, useEffect, useRef } from "react";
import { Keyboard } from "lucide-react";

import { PreSettingsPanel } from "./components/PreSettingsPanel";
import { DocTopBar } from "./components/DocTopBar";
import { EditorToolbar } from "./components/EditorToolbar";
import { PaperEditor } from "./components/PaperEditor";
import { FooterActions } from "./components/FooterActions";
import { StatusBar } from "./components/StatusBar";

import { AppState, TypingEngineProps } from "./types";
import {
  startTypingLoop,
  resumeTyping,
  stopTypingLoop,
  setTypingMode,
} from "./lib/typingEngine";
import { seriousRequest, infiniteStreamFetch } from "./lib/api";
import { saveSnapshot, loadSnapshot, clearSnapshot } from "./lib/localStore";
import { countParagraphs } from "./lib/textUtils";

// ADD

const WORD_TARGETS = {
  ringkas: 250,
  sedang: 600,
  panjang: 1000,
};

// Helper: langkah indeks berikutnya sesuai typingMode
function advanceIndex(
  buffer: string,
  start: number,
  mode: "char" | "word" | "chunk"
): number {
  if (start >= buffer.length) return start;

  if (mode === "char") {
    return Math.min(start + 1, buffer.length);
  }

  if (mode === "chunk") {
    const n = 5 + Math.floor(Math.random() * 5); // 5–9
    return Math.min(start + n, buffer.length);
  }

  // mode === "word"
  let i = start;
  let seenNonSpace = false;
  while (i < buffer.length) {
    const c = buffer[i];
    const isSpace = /\s/.test(c);
    if (isSpace && seenNonSpace) {
      // ambil sampai setelah spasi berikutnya (biar enak dilihat)
      i++;
      break;
    }
    if (!isSpace) seenNonSpace = true;
    i++;
  }
  return Math.min(i, buffer.length);
}

function App() {
  const [state, setState] = useState<AppState>({
    topic: "",
    lang: "id",
    tone: "netral",
    mode: "serious",
    length: "sedang",
    bufferText: "",
    typedText: "",
    typedIndex: 0,
    isTyping: false,
    typingMode: "char",
    paragraphCount: 0,
    cursorPosition: 0,
    isLoading: false,
    error: null,
  });

  const [title, setTitle] = useState("");
  const infiniteRequestRef = useRef<AbortController | null>(null);
  const isRequestingMoreRef = useRef(false);
  const [screen, setScreen] = useState<"setup" | "editor">("setup");

  // Load state
  useEffect(() => {
    const saved = loadSnapshot();
    if (saved) {
      // compat: buang insertMode jika ada di snapshot lama
      const { insertMode: _ignored, ...rest } = saved as any;
      setState((prev) => ({ ...prev, ...rest }));
      setTitle(saved.topic || "");
    }
  }, []);

  // Save state
  useEffect(() => {
    saveSnapshot(state);
  }, [state]);

  // Sync title
  useEffect(() => {
    if (state.topic && !title) {
      setTitle(state.topic);
    }
  }, [state.topic, title]);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const getState = useCallback(() => state, [state]);
  const getCursorPos = useCallback(
    () => state.cursorPosition,
    [state.cursorPosition]
  );
  const setCursorPos = useCallback((pos: number) => {
    setState((prev) => ({ ...prev, cursorPosition: pos }));
  }, []);

  const typingEngineProps: TypingEngineProps = {
    getState,
    setState: updateState,
    getCursorPos,
    setCursorPos,
    onRender: () => {},
  };

  // ====== izinkan input di PreSettingsPanel ======
  const isEditableTarget = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const editable = el.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
    ) as HTMLElement | null;
    return !!editable;
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    return !!el.closest('button, a[href], [role="button"], [data-no-reveal]');
  };

  // ADD: satu langkah mengungkap teks sesuai typingMode
  const revealOnce = useCallback(() => {
    setState((prev) => {
      const { bufferText, typedIndex, typingMode } = prev;
      if (!bufferText || typedIndex >= bufferText.length) return prev;

      const nextIndex = advanceIndex(bufferText, typedIndex, typingMode);
      const nextTyped = bufferText.slice(0, nextIndex);

      return {
        ...prev,
        typedIndex: nextIndex,
        typedText: nextTyped,
        cursorPosition: nextIndex, // caret ikut maju
      };
    });
  }, []);

  // Manual typing via keyboard (mengikuti typingMode)
  const manualTypingArmedRef = useRef(false);
  useEffect(() => {
    // jangan pasang listener kalau masih di layar setup
    if (screen !== "editor") return;

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;

      e.preventDefault();

      if (!manualTypingArmedRef.current && state.isTyping) {
        stopTypingLoop();
        manualTypingArmedRef.current = true;
        setState((prev) => ({ ...prev, isTyping: false }));
      }

      setState((prev) => {
        const { bufferText, typedIndex, typingMode } = prev;
        if (!bufferText || typedIndex >= bufferText.length) return prev;

        const nextIndex = advanceIndex(bufferText, typedIndex, typingMode);
        const nextTyped = bufferText.slice(0, nextIndex);

        return {
          ...prev,
          typedIndex: nextIndex,
          typedText: nextTyped,
          cursorPosition: nextIndex,
        };
      });
    };

    document.addEventListener("keydown", onKey, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKey, { capture: true } as any);
  }, [
    screen,
    state.isTyping,
    state.bufferText,
    state.typedIndex,
    state.typingMode,
  ]);
  // ===============================================

  // ADD: dukungan sentuhan/tap untuk mobile
  useEffect(() => {
    if (screen !== "editor") return;

    const onPointer = (e: PointerEvent) => {
      if (isEditableTarget(e.target)) return;
      if (isInteractiveTarget(e.target)) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      if (!manualTypingArmedRef.current && state.isTyping) {
        stopTypingLoop();
        manualTypingArmedRef.current = true;
        setState((prev) => ({ ...prev, isTyping: false }));
      }

      revealOnce();
    };

    document.addEventListener("pointerdown", onPointer, { capture: true });
    return () =>
      document.removeEventListener("pointerdown", onPointer, {
        capture: true,
      } as any);
  }, [screen, state.isTyping, revealOnce]);

  const requestMoreInfiniteContent = useCallback(async () => {
    if (isRequestingMoreRef.current || state.mode !== "infinite") return;
    isRequestingMoreRef.current = true;
    infiniteRequestRef.current = new AbortController();

    try {
      await infiniteStreamFetch(
        {
          topic: state.topic,
          lang: state.lang,
          tone: state.tone,
          continuation: true,
        },
        (chunk) => {
          setState((prev) => ({
            ...prev,
            bufferText: prev.bufferText + chunk,
            paragraphCount: countParagraphs(prev.bufferText + chunk),
          }));
        },
        () => {
          isRequestingMoreRef.current = false;
        },
        (error) => {
          console.error("Infinite stream error:", error);
          setState((prev) => ({ ...prev, error: error.message }));
          isRequestingMoreRef.current = false;
        }
      );
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        console.error("Request more content error:", error);
        setState((prev) => ({ ...prev, error: (error as Error).message }));
      }
      isRequestingMoreRef.current = false;
    }
  }, [state.topic, state.lang, state.tone, state.mode]);

  // Infinite mode auto fetch
  useEffect(() => {
    if (
      state.mode === "infinite" &&
      state.isTyping &&
      !isRequestingMoreRef.current
    ) {
      const remainingBuffer = state.bufferText.length - state.typedIndex;
      if (remainingBuffer < 200) requestMoreInfiniteContent();
    }
  }, [
    state.typedIndex,
    state.bufferText.length,
    state.mode,
    state.isTyping,
    requestMoreInfiniteContent,
  ]);

  // Auto resume typing (pakai engine) kalau buffer ada
  useEffect(() => {
    if (
      state.mode === "infinite" &&
      !state.isTyping &&
      state.typedIndex < state.bufferText.length
    ) {
      resumeTyping(typingEngineProps);
    }
  }, [
    state.bufferText,
    state.mode,
    state.isTyping,
    state.typedIndex,
    typingEngineProps,
  ]);

  const handleStart = async () => {
    if (!state.topic.trim()) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    stopTypingLoop();

    try {
      if (state.mode === "serious") {
        const targetWords = WORD_TARGETS[state.length];
        const content = await seriousRequest({
          topic: state.topic,
          lang: state.lang,
          tone: state.tone,
          targetWords,
        });
        setState((prev) => ({
          ...prev,
          bufferText: content,
          typedText: "",
          typedIndex: 0,
          isLoading: false,
          paragraphCount: countParagraphs(content),
        }));
        setScreen("editor");
        startTypingLoop(typingEngineProps);
      } else {
        setState((prev) => ({
          ...prev,
          bufferText: "",
          typedText: "",
          typedIndex: 0,
          paragraphCount: 0,
          isLoading: false,
        }));
        infiniteRequestRef.current = new AbortController();
        await infiniteStreamFetch(
          {
            topic: state.topic,
            lang: state.lang,
            tone: state.tone,
            continuation: false,
          },
          (chunk) => {
            setState((prev) => {
              const newBuffer = prev.bufferText + chunk;
              return {
                ...prev,
                bufferText: newBuffer,
                paragraphCount: countParagraphs(newBuffer),
              };
            });
            if (chunk)
              setScreen((prev) => (prev === "editor" ? prev : "editor"));
            if (!state.isTyping) startTypingLoop(typingEngineProps);
          },
          () => {},
          (error) => {
            console.error("Initial infinite stream error:", error);
            setState((prev) => ({
              ...prev,
              error: error.message,
              isLoading: false,
            }));
          }
        );
      }
    } catch (error) {
      console.error("Start error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      }));
    }
  };

  const handleReset = () => {
    stopTypingLoop();
    if (infiniteRequestRef.current) infiniteRequestRef.current.abort();
    isRequestingMoreRef.current = false;
    setState({
      topic: "",
      lang: "id",
      tone: "netral",
      mode: "serious",
      length: "sedang",
      bufferText: "",
      typedText: "",
      typedIndex: 0,
      isTyping: false,
      typingMode: "char",
      paragraphCount: 0,
      cursorPosition: 0,
      isLoading: false,
      error: null,
    });
    setTitle("");
    clearSnapshot();
    setScreen("setup");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-900">KetikMatic</h1>
          </div>
          <p className="text-xs text-gray-500">
            Teks dihasilkan otomatis. Gunakan dengan bijak.
          </p>
        </div>
      </header>

      {screen === "setup" ? (
        // Panel presetting sebagai kotak di tengah
        <div className="p-6 max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md">
          <PreSettingsPanel
            topic={state.topic}
            lang={state.lang}
            tone={state.tone}
            mode={state.mode}
            length={state.length}
            isLoading={state.isLoading}
            isTyping={state.isTyping}
            onTopicChange={(topic) => setState((prev) => ({ ...prev, topic }))}
            onLangChange={(lang) => setState((prev) => ({ ...prev, lang }))}
            onToneChange={(tone) => setState((prev) => ({ ...prev, tone }))}
            onModeChange={(mode) => setState((prev) => ({ ...prev, mode }))}
            onLengthChange={(length) =>
              setState((prev) => ({ ...prev, length }))
            }
            onStart={handleStart}
            onReset={handleReset}
          />
        </div>
      ) : (
        // Layar editor
        <div className="flex-1 flex flex-col">
          <DocTopBar
            title={title}
            topic={state.topic}
            onTitleChange={setTitle}
            isTyping={state.isTyping}
          />

          <EditorToolbar
            typingMode={state.typingMode}
            mode={state.mode}
            onTypingModeChange={(mode) => {
              setState((prev) => ({ ...prev, typingMode: mode }));
              setTypingMode(mode as any, typingEngineProps);
            }}
          />

          <PaperEditor
            title={title}
            content={state.typedText}
            cursorPosition={state.cursorPosition}
            insertMode={"append" as any}
            onContentChange={() => {}}
            onCursorPositionChange={() => {}}
            readOnly={true}
          />

          <FooterActions
            content={state.typedText}
            title={title}
            onReset={handleReset}
          />

          <StatusBar
            mode={state.mode}
            bufferText={state.bufferText}
            typedText={state.typedText}
            typedIndex={state.typedIndex}
            paragraphCount={state.paragraphCount}
            targetWords={
              state.mode === "serious" ? WORD_TARGETS[state.length] : undefined
            }
          />
        </div>
      )}
    </div>
  );
}

export default App;
