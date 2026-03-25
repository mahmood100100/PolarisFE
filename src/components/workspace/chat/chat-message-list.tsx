import React from "react";
import { ChatMessage } from "@/lib/chat";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageListProps {
  messages: ChatMessage[];
  status: any;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({ messages, status, messagesEndRef }: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3 opacity-60">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <p className="text-sm font-medium">No messages yet.</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => {
            const r = String(msg.role).toLowerCase();
            if (r === "system" || r === "0") return null;

            const isUser = r === "1" || r === "user";
            const isAssistant = r === "2" || r === "3" || r === "assistant";

            const isPending = String(msg.status) === "2" || (isAssistant && status === "loading" && msg.content === "");

            let displayContent = msg.content;
            let thoughts: string[] = [];
            const bidiStyle: React.CSSProperties = { textAlign: "start", unicodeBidi: "plaintext" };

            if (isAssistant) {
              let text = msg.content;
              const thoughtRegex = /^(\*?\s*(?:Thinking\.\.\.|Searching the web for [^\n*]*?\.\.\.|Searching for [^\n*]*?\.\.\.)\s*\*?\s*)/i;
              
              while (true) {
                const match = text.match(thoughtRegex);
                if (match) {
                  thoughts.push(match[1].replace(/\*/g, '').trim());
                  text = text.substring(match[0].length);
                } else {
                  break;
                }
              }

              // Handle partial streaming states for thoughts so they don't briefly appear as text
              if (status === "loading" && text.length > 0 && text.length < 30) {
                 const lower = text.toLowerCase().replace(/\*/g, '').trimStart();
                 if ("thinking...".startsWith(lower) || "searching the web for ".startsWith(lower)) {
                    thoughts.push(text.trim());
                    text = '';
                 }
              }

              if (text.trim().length > 0) {
                // Actual content has started, hide the thoughts completely!
                displayContent = text.trimStart();
                thoughts = []; 
              } else {
                // No actual content yet, so we just show the thoughts 
                displayContent = '';
              }
            }

            if (isUser) {
              return (
                <div key={msg.id} className="flex w-full justify-end mb-6">
                  <div dir="auto" style={bidiStyle} className="max-w-[85%] rounded-2xl bg-zinc-800 text-zinc-100 px-4 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap shadow-sm">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex w-full justify-start mb-6">
                <div className="w-full text-zinc-300 text-[12px] whitespace-normal overflow-hidden leading-relaxed">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-zinc-100 tracking-wide text-[12px] uppercase">Polaris AI</span>
                  </div>
                  <div className="px-2 w-full text-zinc-300 markdown-body">
                    {thoughts.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-4 opacity-70">
                        {thoughts.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] font-medium italic text-zinc-400">
                            <svg className="w-3.5 h-3.5 animate-spin text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {displayContent.length > 0 && (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => <p style={bidiStyle} dir="auto" className="mb-4 last:mb-0 leading-relaxed text-[#D4D4D8]" {...props} />,
                          ul: ({ node, ...props }) => <ul style={bidiStyle} dir="auto" className="list-outside list-disc ps-5 mb-4 space-y-2 text-[#D4D4D8] marker:text-zinc-500" {...props} />,
                          ol: ({ node, ...props }) => <ol style={bidiStyle} dir="auto" className="list-outside list-decimal ps-5 mb-4 space-y-2 text-[#D4D4D8] marker:text-zinc-500" {...props} />,
                          li: ({ node, ...props }) => <li style={bidiStyle} dir="auto" className="ps-1 leading-relaxed" {...props} />,
                          h1: ({ node, ...props }) => <h1 style={bidiStyle} dir="auto" className="text-xl font-bold mb-4 mt-6 text-white tracking-tight" {...props} />,
                          h2: ({ node, ...props }) => <h2 style={bidiStyle} dir="auto" className="text-lg font-bold mb-3 mt-6 text-white border-b border-white/10 pb-2 tracking-tight" {...props} />,
                          h3: ({ node, ...props }) => <h3 style={bidiStyle} dir="auto" className="text-base font-bold mb-3 mt-5 text-zinc-100 tracking-tight" {...props} />,
                          h4: ({ node, ...props }) => <h4 style={bidiStyle} dir="auto" className="text-[13px] font-bold mb-2 mt-4 text-zinc-200" {...props} />,
                          a: ({ node, ...props }) => <a style={bidiStyle} dir="auto" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/30 hover:decoration-indigo-400 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                          strong: ({ node, ...props }) => <strong style={bidiStyle} dir="auto" className="font-semibold text-zinc-100" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote style={bidiStyle} dir="auto" className="border-s-4 border-indigo-500 bg-indigo-500/5 rounded-e-lg ps-4 pe-4 py-3 italic text-zinc-400 my-5 text-[12px]" {...props} />,
                          table: ({ node, ...props }) => <div style={bidiStyle} dir="auto" className="overflow-x-auto my-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"><table style={bidiStyle} className="w-full border-collapse rounded-lg overflow-hidden border border-zinc-700/50 text-[12px]" {...props} /></div>,
                          th: ({ node, ...props }) => <th style={bidiStyle} className="px-4 py-3 bg-zinc-800/80 font-semibold text-zinc-200 border-b border-zinc-700/50" {...props} />,
                          td: ({ node, ...props }) => <td style={bidiStyle} className="px-4 py-3 border-b border-zinc-700/50 text-zinc-300 last:border-0" {...props} />,
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div className="mb-5 mt-4 rounded-xl overflow-hidden border border-white/10 shadow-lg relative group">
                                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/5 select-none text-zinc-400">
                                  <span className="text-[11px] font-medium uppercase tracking-wider">{match[1]}</span>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300 transition-all flex items-center gap-1.5"
                                    title="Copy to clipboard"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                      <path fillRule="evenodd" d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.5A2.25 2.25 0 0 1 14.75 18.75h-9.5A2.25 2.25 0 0 1 3 16.5V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 0 1 9 1h2c1.373 0 2.531.923 2.887 2.182ZM7.5 4A1.5 1.5 0 0 1 9 2.5h2A1.5 1.5 0 0 1 12.5 4v.5h-5V4Z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-[10px] font-medium">Copy</span>
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  {...props}
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="!m-0 !p-4 !bg-[#0E0E10] text-[12px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code {...props} className={`${className} bg-zinc-800/80 px-1.5 py-0.5 rounded-md text-pink-300 text-[12px] font-mono whitespace-pre-wrap ${inline ? "" : "block p-3 mb-4"}`}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {displayContent}
                      </ReactMarkdown>
                    )}
                    
                    {isPending && thoughts.length === 0 && displayContent.length === 0 && (
                      <span className="inline-flex items-center gap-1 h-5 ml-2 align-middle">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                    {isPending && displayContent.length > 0 && (
                      <span className="inline-flex items-center gap-1 h-5 ml-2 align-middle">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
