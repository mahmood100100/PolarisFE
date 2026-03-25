"use client";

import { useEffect, useState, useRef } from "react";
import { ChatCard } from "./chat/chat-card";
import {
  getChatConversationsApiCall,
  getChatMessagesApiCall,
  createChatConversationApiCall,
  getActiveChatJobsApiCall,
  streamChatJobApiCall,
  deleteChatConversationApiCall,
  type ChatConversation,
  type ChatMessage,
  type ApiStatus,
} from "@/lib/chat";

export function WorkspacePage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("polaris_activeChatId") || null;
    }
    return null;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatStatus, setChatStatus] = useState<ApiStatus>("idle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (activeChatId) {
        localStorage.setItem("polaris_activeChatId", activeChatId);
      } else {
        localStorage.removeItem("polaris_activeChatId");
      }
    }
  }, [activeChatId]);

  const loadChats = async () => {
    const res = await getChatConversationsApiCall();
    if (res.success) {
      setConversations(res.data);
      if (!activeChatId && res.data.length > 0) {
        if (!localStorage.getItem("polaris_activeChatId")) {
           setActiveChatId(res.data[0].id);
        }
      }
    }
  };

  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInitializingRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    if (activeChatId && !isInitializingRef.current) {
      const loadMessages = async () => {
        setChatStatus("loading");
        const res = await getChatMessagesApiCall(activeChatId);
        if (!cancelled) {
          setChatMessages(res.success ? res.data : []);
          setChatStatus(res.success ? "idle" : "error");
        }
      };
      loadMessages();
    } else if (!activeChatId && !isInitializingRef.current) {
      setChatMessages([]);
      setChatStatus("idle");
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  const handleNewChat = async () => {
    const res = await createChatConversationApiCall();
    if (res.success) {
      setActiveChatId(res.data.id);
      setChatMessages([]);
      loadChats();
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    const res = await deleteChatConversationApiCall(id);
    if (res.success) {
      if (activeChatId === id) {
        setActiveChatId(null);
        setChatMessages([]);
      }
      loadChats();
    } else {
      alert("Failed to delete chat: " + res.error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const resumeActiveChatJob = async (): Promise<string | null> => {
      const result = await getActiveChatJobsApiCall();
      if (!result.success || cancelled) return null;
      
      const jobs = Array.isArray(result.data) ? result.data : [result.data];
      if (jobs.length === 0 || !jobs[0]) return null;

      const firstActive = jobs[0];
      const convId = firstActive.conversationId;
      const jobId = firstActive.jobId;

      setActiveChatId(convId);
      setChatStatus("loading");

      const msgResult = await getChatMessagesApiCall(convId);
      if (cancelled) return jobId;

      const loadedMsgs = msgResult.success ? msgResult.data : [];
      setChatMessages(loadedMsgs);

      const assistantMsgId = crypto.randomUUID();
      setChatMessages((prev) => [...prev, { id: assistantMsgId, content: "", role: "assistant" }]);

      let currentContent = "";
      await streamChatJobApiCall(
        jobId,
        (chunk, eventType) => {
          if (cancelled) return;
          if (eventType === "buffer" || eventType === "Buffer") {
            currentContent = chunk;
          } else {
            currentContent += chunk;
          }
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: currentContent } : msg
            )
          );
        },
        () => {
          if (!cancelled) {
            setChatStatus("success");
            loadChats();
          }
        },
        (err) => {
          if (!cancelled) {
            setChatStatus("error");
            setChatMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: currentContent + "\n\n[Error: " + err + "]" }
                  : msg
              )
            );
          }
        }
      );

      return jobId;
    };

    const runResumes = async () => {
      const chatJobId = await resumeActiveChatJob();
      
      if (!chatJobId && activeChatId) {
        setChatStatus("loading");
        const res = await getChatMessagesApiCall(activeChatId);
        if (!cancelled) {
          setChatMessages(res.success ? res.data : []);
          setChatStatus(res.success ? "idle" : "error");
        }
      }

      isInitializingRef.current = false;
    };

    runResumes();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-white overflow-hidden">
      {/* No Inner Top Header as per user request */}

      {/* ─── Main Layout: Sidebar + Canvas + Chat ─── */}
      <div className="flex-1 flex overflow-hidden w-full mx-auto">
        {/* Left Side is now completely empty as requested! */}

        {/* ── Middle Editor / Canvas ── */}
        <main className="flex-1 overflow-hidden flex flex-col bg-transparent">
           {/* Completely empty workspace canvas */}
        </main>

        {/* ── Right Sidebar (Chat) ── */}
        <aside className="w-full md:w-[320px] lg:w-[350px] shrink-0 bg-black/60 flex flex-col relative z-10 shadow-2xl border-l border-white/[0.06]">
          <ChatCard
            conversationId={activeChatId}
            messages={chatMessages}
            status={chatStatus}
            setStatus={setChatStatus}
            setMessages={setChatMessages}
            refreshChats={loadChats}
            onNewChat={handleNewChat}
            conversations={conversations}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
          />
        </aside>
      </div>
    </div>
  );
}
