import api from "@/lib/api";
import { store } from "@/redux/store";

export type ApiStatus = "idle" | "loading" | "success" | "error";

export interface ChatConversation {
  id: string;
  title?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | number | string;
  status?: number;
  createdAt?: string;
}

/** GET /api/chat/conversations - Returns past conversations (Sidebar) */
export const getChatConversationsApiCall = async (): Promise<
  | { success: true; data: ChatConversation[] }
  | { success: false; error: string }
> => {
  try {
    const response = await api.get("/api/chat/conversations");
    const data = response.data;
    const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
    return { success: true, data: items };
  } catch (error: any) {
    const message =
      error.response?.data?.message ?? "Failed to fetch conversations";
    return { success: false, error: message };
  }
};

/** GET /api/chat/conversations/{conversationId}/messages - Returns messages of a specific conversation */
export const getChatMessagesApiCall = async (
  conversationId: string
): Promise<
  | { success: true; data: ChatMessage[] }
  | { success: false; error: string }
> => {
  try {
    const response = await api.get(`/api/chat/conversations/${conversationId}/messages`);
    const data = response.data;
    const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
    return { success: true, data: items };
  } catch (error: any) {
    const message =
      error.response?.data?.message ?? "Failed to fetch messages";
    return { success: false, error: message };
  }
};

/** POST /api/chat/conversations - Creates a new conversation */
export const createChatConversationApiCall = async (
  projectId?: string
): Promise<
  | { success: true; data: ChatConversation }
  | { success: false; error: string }
> => {
  try {
    const response = await api.post("/api/chat/conversations", { projectId });
    return { success: true, data: response.data };
  } catch (error: any) {
    const message =
      error.response?.data?.message ?? "Failed to create conversation";
    return { success: false, error: message };
  }
};

export interface ChatJobResponse {
  jobId: string;
  conversationId: string;
  status: string;
  message?: string;
}

export interface ActiveChatJob {
  jobId: string;
  conversationId: string;
}

/** POST /api/chat/messages/start - starts a background chat job */
export const startChatJobApiCall = async (
  conversationId: string,
  message: string
): Promise<
  | { success: true; data: ChatJobResponse }
  | { success: false; error: string }
> => {
  try {
    const response = await api.post("/api/chat/messages/start", { conversationId, message });
    return { success: true, data: response.data };
  } catch (error: any) {
    const msg = error.response?.data?.message ?? "Failed to start chat job";
    return { success: false, error: msg };
  }
};

/** GET /api/chat/messages/active - returns active chat jobs */
export const getActiveChatJobsApiCall = async (): Promise<
  | { success: true; data: ActiveChatJob[] }
  | { success: false; error: string }
> => {
  try {
    const response = await api.get("/api/chat/messages/active");
    const data = response.data;
    const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
    return { success: true, data: items };
  } catch (error: any) {
    const msg = error.response?.data?.message ?? "Failed to fetch active chat jobs";
    return { success: false, error: msg };
  }
};

/** DELETE /api/chat/conversations/{conversationId} - deletes a chat conversation */
export const deleteChatConversationApiCall = async (
  conversationId: string
): Promise<{ success: true } | { success: false, error: string }> => {
  try {
    await api.delete(`/api/chat/conversations/${conversationId}`);
    return { success: true };
  } catch (error: any) {
    const msg = error.response?.data?.message ?? "Failed to delete conversation";
    return { success: false, error: msg };
  }
};

/** GET /api/chat/messages/stream/{jobId} - streams chat response chunk by chunk */
export const streamChatJobApiCall = async (
  jobId: string,
  onChunk: (chunk: string, eventType: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const accessToken = store.getState().auth.accessToken;

  try {
    const response = await fetch(`${baseUrl}/api/chat/messages/stream/${jobId}`, {
      method: "GET",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      signal,
    });

    if (!response.ok) {
      onError(`Stream failed with status ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("No readable stream returned from server.");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const eventStr of events) {
        const lines = eventStr.split("\n");
        const eventLine = lines.find((line) => line.startsWith("event:"));
        const dataLine = lines.find((line) => line.startsWith("data:"));

        if (!dataLine) continue;

        const eventType = eventLine ? eventLine.replace(/^event:\s*/, "").trim() : "chunk";
        const raw = dataLine.replace(/^data:\s*/, "").trim();

        if (raw === "[DONE]" || eventType === "DONE") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(raw) as { content?: string; buffer?: string; type?: string };
          // It might send content or buffer
          const txt = parsed.content !== undefined ? parsed.content : parsed.buffer !== undefined ? parsed.buffer : undefined;
          
          // Also try to extract type from JSON if it wasn't in the event string
          const finalEventType = parsed.type || eventType;

          if (txt !== undefined) {
            onChunk(txt, finalEventType);
          }
        } catch {
          // Ignore non-JSON lines
        }
      }
    }

    onDone();
  } catch (error: any) {
    if (error.name === "AbortError") {
       // Ignore fetch cancellation
       return;
    }
    onError(error?.message ?? "Stream connection failed");
  }
};
