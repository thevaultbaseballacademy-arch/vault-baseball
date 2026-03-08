import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Loader2, Minimize2, Trash2, ArrowRight } from "lucide-react";
import { useEddieChat } from "@/hooks/useEddieChat";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

// Detect product links in assistant messages and render CTA buttons
const ProductCTA = ({ href, label }: { href: string; label: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      className="mt-2 w-full flex items-center justify-between px-4 py-3 bg-foreground text-background text-xs font-display tracking-wide hover:bg-foreground/90 transition-colors"
    >
      {label}
      <ArrowRight className="w-4 h-4" />
    </button>
  );
};

const PRODUCT_PATTERNS: { pattern: RegExp; href: string; label: string }[] = [
  { pattern: /\/free-velocity-guide/i, href: "/free-velocity-guide", label: "GET THE FREE VELOCITY GUIDE" },
  { pattern: /\/products\/velo-check/i, href: "/products/velo-check", label: "GET VELO-CHECK — $97" },
  { pattern: /\/products\/velocity-system/i, href: "/products/velocity-system", label: "START THE VELOCITY SYSTEM — $397" },
  { pattern: /\/#pricing/i, href: "/#pricing", label: "JOIN REMOTE TRAINING — $199/MO" },
];

function extractProductCTAs(content: string) {
  const found: { href: string; label: string }[] = [];
  for (const p of PRODUCT_PATTERNS) {
    if (p.pattern.test(content)) {
      found.push({ href: p.href, label: p.label });
    }
  }
  return found;
}

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

  // Auto-send greeting on first open
  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      // Trigger Eddie's greeting by sending a hidden opener
      sendMessage("Hi");
    }
  };

  if (typeof window !== "undefined" && window.location.pathname === "/contact") {
    return null;
  }

  const quickStarters = [
    { text: "I'm a parent looking into structured training", emoji: "👨‍👩‍👦" },
    { text: "I'm an athlete — I want to throw harder", emoji: "⚾" },
    { text: "I'm a coach looking for a development system", emoji: "📋" },
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
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
            isMinimized ? "w-72 h-14" : "w-[400px] h-[560px] max-h-[85vh]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-foreground text-background">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-background/15 flex items-center justify-center">
                <span className="text-sm font-display">E</span>
              </div>
              <div>
                <span className="font-display text-sm tracking-wide">EDDIE MEJIA</span>
                <p className="text-[10px] opacity-60 tracking-wide">Development Architect</p>
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
                {messages.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="w-14 h-14 bg-muted flex items-center justify-center mb-4">
                      <span className="text-2xl font-display text-muted-foreground">E</span>
                    </div>
                    <p className="text-sm font-display text-foreground mb-1">EDDIE MEJIA</p>
                    <p className="text-xs text-muted-foreground mb-5 leading-relaxed max-w-[260px]">
                      Vault Baseball development architect. Tell me about the athlete and I'll point you to the right path.
                    </p>
                    <div className="flex flex-col gap-2 w-full">
                      {quickStarters.map((q) => (
                        <button
                          key={q.text}
                          onClick={() => sendMessage(q.text)}
                          className="flex items-center gap-2 text-xs px-4 py-3 bg-muted hover:bg-muted/80 text-left text-foreground hover:text-foreground transition-colors border border-border"
                        >
                          <span>{q.emoji}</span>
                          <span>{q.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, idx) => {
                      const ctas = msg.role === "assistant" ? extractProductCTAs(msg.content) : [];
                      return (
                        <div key={idx} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                          {msg.role === "assistant" && (
                            <div className="w-6 h-6 bg-foreground/10 flex items-center justify-center shrink-0 mt-1">
                              <span className="text-[10px] font-display text-foreground">E</span>
                            </div>
                          )}
                          <div className="max-w-[85%]">
                            <div className={cn(
                              "px-3 py-2 text-sm",
                              msg.role === "user"
                                ? "bg-foreground text-background"
                                : "bg-muted text-foreground"
                            )}>
                              {msg.role === "assistant" ? (
                                <div className="prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-foreground [&_a]:underline [&_a]:font-medium [&_ul]:mb-2 [&_li]:mb-0.5">
                                  <ReactMarkdown
                                    components={{
                                      // Override links to use navigate
                                      a: ({ href, children }) => {
                                        const isInternal = href?.startsWith("/");
                                        if (isInternal) {
                                          return (
                                            <a
                                              href={href}
                                              onClick={(e) => {
                                                e.preventDefault();
                                                if (href) window.location.href = href;
                                              }}
                                              className="text-foreground underline font-medium"
                                            >
                                              {children}
                                            </a>
                                          );
                                        }
                                        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                                      }
                                    }}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                            {/* Product CTA buttons below assistant messages */}
                            {ctas.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {ctas.map((cta) => (
                                  <ProductCTA key={cta.href} href={cta.href} label={cta.label} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-foreground/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-display text-foreground">E</span>
                        </div>
                        <div className="bg-muted px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
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
                    placeholder="Tell Eddie about your situation..."
                    disabled={isLoading}
                    className="flex-1 text-sm h-10"
                  />
                  <Button type="submit" size="sm" disabled={isLoading || !chatInput.trim()} className="h-10 w-10 p-0">
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
