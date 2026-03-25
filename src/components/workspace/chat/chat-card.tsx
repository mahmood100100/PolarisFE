import React, { useState, useRef, useEffect } from "react";
import { type ApiStatus } from "@/lib/chat";
import { startChatJobApiCall, streamChatJobApiCall, ChatMessage, ChatConversation } from "@/lib/chat";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInputArea } from "./chat-input";

interface ChatCardProps {
  conversationId: string | null;
  messages: ChatMessage[];
  status: ApiStatus;
  setStatus: (status: ApiStatus) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  refreshChats: () => void;
  onNewChat?: () => void;
  conversations?: ChatConversation[];
  onSelectChat?: (id: string) => void;
  onDeleteChat?: (e: React.MouseEvent, id: string) => void;
}

export function ChatCard({
  conversationId,
  messages,
  status,
  setStatus,
  setMessages,
  refreshChats,
  onNewChat,
  conversations = [],
  onSelectChat,
  onDeleteChat,
}: ChatCardProps) {
  const [inputVal, setInputVal] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  const activeChatName = conversations.find(c => c.id === conversationId)?.title || "New Chat";

  // Close history when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (historyMenuRef.current && !historyMenuRef.current.contains(event.target as Node)) {
        setHistoryOpen(false);
      }
    }
    if (historyOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [historyOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSend = async () => {
    if (!inputVal.trim() || !conversationId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      content: inputVal,
      role: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setStatus("loading");

    const startRes = await startChatJobApiCall(conversationId, userMsg.content);
    if (!startRes.success) {
      setStatus("error");
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), content: "[Error: " + startRes.error + "]", role: "assistant" },
      ]);
      return;
    }

    const newJobId = startRes.data.jobId;

    const assistantMsgId = crypto.randomUUID();

    // Add an empty assistant message to stream into
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, content: "", role: "assistant" },
    ]);

    let currentContent = "";

    await streamChatJobApiCall(
      newJobId,
      (chunk, eventType) => {
        if (eventType === "buffer" || eventType === "Buffer") {
          currentContent = chunk;
        } else {
          currentContent += chunk;
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: currentContent }
              : msg
          )
        );
      },
      () => {
        setStatus("success");
        refreshChats();
      },
      (err) => {
        setStatus("error");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: currentContent + "\n\n[Error: " + err + "]" }
              : msg
          )
        );
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/40">
      <ChatHeader
        status={status}
        activeChatName={activeChatName}
        historyOpen={historyOpen}
        setHistoryOpen={setHistoryOpen}
        historyMenuRef={historyMenuRef}
        conversations={conversations}
        conversationId={conversationId}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
        onNewChat={onNewChat}
      />

      <ChatMessageList
        messages={messages}
        status={status}
        messagesEndRef={messagesEndRef}
      />

      <ChatInputArea
        inputVal={inputVal}
        setInputVal={setInputVal}
        handleKeyDown={handleKeyDown}
        handleSend={handleSend}
        conversationId={conversationId}
        status={status}
      />
    </div>
  );
}
