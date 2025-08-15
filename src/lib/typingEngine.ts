import { TypingEngineProps } from "../types";
import { getRandomDelay, getNextWord, getRandomChunk } from "./textUtils";

let typingInterval: ReturnType<typeof setTimeout> | null = null;
export function startTypingLoop(props: TypingEngineProps): void {
  stopTypingLoop();

  const loop = () => {
    const state = props.getState();

    if (!state.isTyping || state.typedIndex >= state.bufferText.length) {
      if (state.mode === "serious") {
        props.setState({ isTyping: false });
        return;
      } else if (state.mode === "infinite") {
        return;
      }
    }

    let nextContent = "";
    let nextIndex = state.typedIndex;
    let delay = 50;

    switch (state.typingMode) {
      case "char":
        if (nextIndex < state.bufferText.length) {
          nextContent = state.bufferText.charAt(nextIndex);
          nextIndex++;
          delay = getRandomDelay(20, 70);
        }
        break;

      case "word": {
        const { word, endIndex } = getNextWord(state.bufferText, nextIndex);
        nextContent = word;
        nextIndex = endIndex;
        delay = getRandomDelay(90, 160);
        break;
      }

      case "chunk": {
        const { chunk, endIndex: chunkEndIndex } = getRandomChunk(
          state.bufferText,
          nextIndex
        );
        nextContent = chunk;
        nextIndex = chunkEndIndex;
        delay = getRandomDelay(60, 120);
        break;
      }
    }

    if (nextContent) {
      // SELALU APPEND DI AKHIR
      const newTypedText = state.typedText + nextContent;
      const newCursorPos = newTypedText.length;

      props.setState({
        typedText: newTypedText,
        typedIndex: nextIndex,
        cursorPosition: newCursorPos,
      });

      props.onRender();
    }

    if (nextIndex < state.bufferText.length) {
      typingInterval = setTimeout(loop, delay);
    } else {
      const currentState = props.getState();
      if (currentState.mode === "infinite") {
        props.setState({ isTyping: false });
      } else {
        props.setState({ isTyping: false });
      }
    }
  };

  props.setState({ isTyping: true });
  typingInterval = setTimeout(loop, 100);
}

export function pauseTyping(): void {
  stopTypingLoop();
}

export function resumeTyping(props: TypingEngineProps): void {
  const state = props.getState();
  if (!state.isTyping && state.typedIndex < state.bufferText.length) {
    startTypingLoop(props);
  }
}

export function stopTypingLoop(): void {
  if (typingInterval) {
    clearTimeout(typingInterval);
    typingInterval = null;
  }
}

export function setTypingMode(
  mode: "char" | "word" | "chunk",
  props: TypingEngineProps
): void {
  props.setState({ typingMode: mode });
}

// NOTE: setInsertMode DIHAPUS.
// export function setInsertMode(...) { ... }  // <— remove
