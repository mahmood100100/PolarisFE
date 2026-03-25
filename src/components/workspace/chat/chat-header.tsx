import React from "react";
import { ChatConversation } from "@/lib/chat";

interface ChatHeaderProps {
  status: any;
  activeChatName: string;
  historyOpen: boolean;
  setHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  historyMenuRef: React.RefObject<HTMLDivElement | null>;
  conversations: ChatConversation[];
  conversationId: string | null;
  onSelectChat?: (id: string) => void;
  onDeleteChat?: (e: React.MouseEvent, id: string) => void;
  onNewChat?: () => void;
}

export function ChatHeader({
  status,
  activeChatName,
  historyOpen,
  setHistoryOpen,
  historyMenuRef,
  conversations,
  conversationId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}: ChatHeaderProps) {
  return (
    <div className="shrink-0 p-1 border-b border-white/[0.06] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "loading" ? "bg-indigo-400" : "hidden"}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status === "loading" ? "bg-indigo-500" : "bg-zinc-600"}`}></span>
        </span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">
          Polaris Chat
        </h3>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400 font-medium truncate max-w-[150px]" title={activeChatName}>
          {activeChatName}
        </span>
        <div className="flex items-center gap-1 border-l border-white/10 pl-3">
          <div className="relative" ref={historyMenuRef}>
            <button
              onClick={() => setHistoryOpen(prev => !prev)}
              className={`p-1.5 rounded-md transition-colors ${historyOpen ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.08]"}`}
              title="History"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {historyOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 max-h-[60vh] overflow-y-auto bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col p-2 overscroll-contain">
                <div className="px-2 py-1 mb-1 border-b border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Recents</span>
                </div>
                {conversations.length === 0 ? (
                  <div className="px-3 py-4 text-xs italic text-zinc-500 text-center">No history found</div>
                ) : (
                  conversations.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group flex items-center justify-between px-3 py-2.5 text-xs rounded-lg transition-colors cursor-pointer ${conversationId === chat.id
                        ? "bg-indigo-500/10 text-indigo-300 font-medium"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                        }`}
                      onClick={() => {
                        if (onSelectChat) onSelectChat(chat.id);
                        setHistoryOpen(false);
                      }}
                    >
                      <span className="truncate pr-2">{chat.title || "New Chat..."}</span>
                      <button
                        onClick={(e) => {
                          if (onDeleteChat) onDeleteChat(e, chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-all"
                        title="Delete Chat"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            onClick={onNewChat}
            className="p-1.5 hover:bg-white/[0.08] rounded-md transition-colors text-zinc-400 hover:text-white"
            title="New Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
