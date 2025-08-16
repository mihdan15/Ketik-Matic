import { ApiParams } from "../types";

const API_BASE = "https://ketik-matic-api.vercel.app/api";

export async function seriousRequest(params: ApiParams): Promise<string> {
  const response = await fetch(`${API_BASE}/serious`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("Response from seriousRequest:", data);
  return data.text;
}

export function infiniteStream(params: ApiParams): EventSource {
  const eventSource = new EventSource(`${API_BASE}/infinite`, {
    // Note: EventSource doesn't support POST with body directly
    // We'll use a different approach with fetch and ReadableStream
  });

  return eventSource;
}

export async function infiniteStreamFetch(
  params: ApiParams,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/infinite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    }
  } catch (error) {
    onError(error as Error);
  }
}
