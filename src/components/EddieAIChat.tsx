import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Loader2, Minimize2, Trash2 } from "lucide-react";
import { useEddieChat } from "@/hooks/useEddieChat";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export const EddieAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { messages, isLoading, error, sendMessage, clearChat } = useEddieChat();
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput("");
    }
  };

  // Don't render on contact page
  if (typeof window !== "undefined" && window.location.pathname === "/contact") {
    return null;
  }

  const quickQuestions = [
    "What's the best program for a 14-year-old pitcher?",
    "How do I increase my velocity?",
    "What products do you offer?",
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-foreground text-background shadow-lg hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95 font-display text-lg tracking-wide"
          aria-label="Ask Eddie AI"
        >
          <MessageCircle className="h-5 w-5" />
          ASK EDDIE AI
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 bg-card border border-border shadow-2xl transition-all duration-200 overflow-hidden",
            isMinimized ? "w-72 h-14" : "w-[380px] h-[520px] max-h-[85vh]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-foreground text-background">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-background/20 flex items-center justify-center">
                <span className="text-xs font-display">E</span>
              </div>
              <div>
                <span className="font-display text-sm tracking-wide">EDDIE AI</span>
                <p className="text-[10px] opacity-70">Your Development Advisor</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!isMinimized && messages.length > 0 && (
                <button onClick={clearChat} className="p-1.5 hover:bg-background/20 transition-colors" aria-label="Clear chat">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-background/20 transition-colors">
                <Minimize2 className="h-4 w-4" />
              </button>
              <button onClick={() => { setIsOpen(false); setIsMinimized(false); }} className="p-1.5 hover:bg-background/20 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex flex-col h-[calc(100%-52px)]">
              <ScrollArea className="flex-1 p-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="w-14 h-14 bg-muted flex items-center justify-center mb-3">
                      <span className="text-2xl font-display text-muted-foreground">E</span>
                    </div>
                    <p className="text-sm font-display text-foreground mb-1">HEY, I'M EDDIE</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      I help athletes find the right development path. Tell me about yourself or ask me anything about Vault Baseball.
                    </p>
                    <div className="flex flex-col gap-1.5 w-full">
                      {quickQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-xs px-3 py-2 bg-muted hover:bg-muted/80 text-left text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                        {msg.role === "assistant" && (
                          <div className="w-6 h-6 bg-foreground/10 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-[10px] font-display text-foreground">E</span>
                          </div>
                        )}
                        <div className={cn(
                          "max-w-[85%] px-3 py-2 text-sm",
                          msg.role === "user"
                            ? "bg-foreground text-background"
                            : "bg-muted text-foreground"
                        )}>
                          {msg.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none [&_p]:mb-2 [&_a]:text-blue-600 [&_a]:underline">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-foreground/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-display text-foreground">E</span>
                        </div>
                        <div className="bg-muted px-3 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {error && (
                <div className="px-3 py-2 text-xs text-destructive bg-destructive/10 border-t border-border">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Eddie anything..."
                    disabled={isLoading}
                    className="flex-1 text-sm h-9"
                  />
                  <Button type="submit" size="sm" disabled={isLoading || !chatInput.trim()} className="h-9 w-9 p-0">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};
