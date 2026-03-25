import React, { useRef, useEffect } from "react";

interface ChatInputAreaProps {
  inputVal: string;
  setInputVal: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  conversationId: string | null;
  status: any;
}

export function ChatInputArea({
  inputVal,
  setInputVal,
  handleKeyDown,
  handleSend,
  conversationId,
  status,
}: ChatInputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [inputVal]);

  return (
    <div className="shrink-0 p-3 border-t border-white/[0.06] bg-black/20">
      <div className="relative">
        <textarea
          ref={textareaRef}
          placeholder="Type your message..."
          className="w-full bg-zinc-900/80 text-white rounded-xl border border-white/10 pl-4 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none text-[12px] placeholder:text-zinc-600 shadow-inner scrollbar-thin scrollbar-thumb-white/10"
          rows={1}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!conversationId || status === "loading"}
          style={{ minHeight: "52px" }}
        />
        <button
          onClick={handleSend}
          disabled={!inputVal.trim() || !conversationId || status === "loading"}
          className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
