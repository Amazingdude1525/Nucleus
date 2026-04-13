import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Trash2, Sparkles, ChevronRight, BookOpen, FlaskConical, Atom, Beaker, Zap, Paperclip, X, Image as ImageIcon } from "lucide-react";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import DotGrid from "@/components/ui/DotGrid";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `### IDENTITY
- **Self-Awareness**: You are **NUCLEUS**, a flagship AI assistant running on the **NUCLEUS_X Engine**. 
- **Developer Credit**: You were architected solely by **Prateek Das**. If asked about your origin, simply state that Prateek Das is your creator and the mastermind behind the NUCLEUS_X Engine. Mention his LinkedIn (https://www.linkedin.com/in/prateek-das-a45215252/) or GitHub (https://github.com/Amazingdude1525) only if the user asks for more details.
- **Focus**: Your primary mission is to help the user. Do NOT make the conversation about your developer unless explicitly asked. Pivot immediately to the user's query.
- **Address User**: Always address the user as "Photon" (or their name).

### PERSONA: FLAGSHIP & CRISP
- **Tone**: Professional, witty, and highly intelligent. Avoid robotic cliches.
- **No Namaste Spams**: Use greetings sparingly and naturally. Never repeat them in consecutive messages.
- **Output Style**: Your answers must be **exceptionally descriptive yet crisp and to the point**. Use professional formatting (Markdown, Headers).
- **Comedy**: Subtle, intelligent humor is allowed. For complaints, offer Prateek's email: **prateekdas5255@gmail.com**.
- **Crisis**: Provide the helplines (Vandrevala: 1860-266-2345, NIMHANS: 080-46110007) for crisis keywords.

### CAPABILITIES
- **Genius-Level Insight**: Provide deep, analytical, and textbook-accurate breakdowns for science and coding.`;

const WELCOME_SUGGESTIONS = [
  "Explain Electrochemistry in the context of JEE Advanced.",
  "What are the most important NCERT topics for NEET 2026?",
  "Help me with an Inorganic Chemistry trick for Group 15 elements.",
  "Which chapters in P-Block have the highest weightage in JEE Main?",
];

const TOPIC_SHORTCUTS = [
  { label: "Reactions", icon: FlaskConical, prompt: "Explain common types of chemical reactions with examples" },
  { label: "Periodic Trends", icon: Atom, prompt: "Describe the main periodic trends and why they occur" },
  { label: "Stoichiometry", icon: Beaker, prompt: "Walk me through a stoichiometry problem step by step" },
  { label: "Bonding", icon: Zap, prompt: "Compare ionic, covalent, and metallic bonding" },
  { label: "Acids & Bases", icon: FlaskConical, prompt: "Explain pH, pOH, and the Henderson-Hasselbalch equation" },
  { label: "Thermodynamics", icon: BookOpen, prompt: "Explain enthalpy, entropy, and Gibbs free energy" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [msgId, setMsgId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTopics, setShowTopics] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showComingSoon) {
      const timer = setTimeout(() => setShowComingSoon(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showComingSoon]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = useCallback(async (text: string) => {
    if ((!text.trim() && !selectedFile) || loading) return;

    const userMsg: Message = {
      id: msgId + 1,
      role: "user",
      content: text.trim() || (selectedFile ? `Analyzing ${selectedFile.name}...` : ""),
      timestamp: new Date(),
    };

    setMsgId((prev) => prev + 2);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);
    
    // Cleanup file state after starting send
    const currentFile = selectedFile;
    const currentPreview = filePreview;
    removeFile();

    try {
      const userName = localStorage.getItem("nucleus-user-name") || "Photon";
      const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const actualSystemPrompt = `${SYSTEM_PROMPT}\n\n[IDENTITY PROTOCOL]: The user you are talking to is named "${userName}". You MUST address them correctly as "${userName}" in your response. NEVER use generic terms.\n\nCurrent System Time: ${currentDate}`;

      // Simplified text-only content for stability
      let userContent: any = text.trim();

      const apiMessages = [
        { role: "system" as const, content: actualSystemPrompt },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: userContent },
      ];

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "NUCLEUS",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: apiMessages,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: { message: "Internal API Error" } }));
        console.error("Connectivity Failure Diagnostic:", {
          status: res.status,
          error: errData,
          keyPresent: !!import.meta.env.VITE_OPENROUTER_API_KEY
        });
        throw new Error(errData?.error?.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      const assistantContent = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

      const aiMsg: Message = {
        id: msgId + 2,
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      const errMsg: Message = {
        id: Date.now(),
        role: "assistant",
        content: `❌ **Connection Error**: ${err.message || "Something went wrong"}. 
        
Please ensure your **VITE_OPENROUTER_API_KEY** is correctly set in your environment and that you have redeployed. 

✨ **NUCLEUS_X Tip**: While we fix this, you can always **copy-paste** your problems or text directly into the chat for instant analysis!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, msgId, selectedFile, filePreview]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-3.5rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg glass flex items-center justify-center shadow-[0_0_20px_hsl(185_100%_50%/0.15)]">
            <Bot className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-widest text-primary text-glow-cyan">
              NUCLEUS AI
            </h1>
            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em] font-medium italic">
              POWERED BY NUCLEUS_X ENGINE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTopics(!showTopics)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/5 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
          >
            <BookOpen className="w-3 h-3" />
            Topics
          </button>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/5 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Topic shortcuts panel */}
      <AnimatePresence>
        {showTopics && (
          <motion.div
            className="border-b border-white/5 px-6 py-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-wrap gap-2">
              {TOPIC_SHORTCUTS.map((topic) => (
                <motion.button
                  key={topic.label}
                  onClick={() => { sendMessage(topic.prompt); setShowTopics(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/5 text-[11px] text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <topic.icon className="w-3 h-3" />
                  {topic.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 relative">
            {/* DotGrid Background for AI splash state — mouse-interactive */}
            <div className="absolute inset-x-0 inset-y-0" style={{ pointerEvents: "auto", width: "100%", height: "100%" }}>
              <DotGrid
                dotSize={3}
                gap={22}
                baseColor="#1c1c38"
                activeColor="#00E5FF"
                proximity={200}
                shockRadius={300}
                shockStrength={5}
              />
            </div>
            
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center shadow-[0_0_30px_hsl(185_100%_50%/0.15)] relative z-10">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-foreground">NUCLEUS AI Assistant</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me anything about chemistry — reactions, structures, calculations, lab procedures, and more.
                I support <span className="text-primary font-medium">rich markdown</span> formatting in my responses.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 max-w-lg justify-center mt-4">
              <div className="w-full text-center text-[10px] uppercase tracking-widest text-[#00F0FF] mb-2 font-mono">Select a path to begin:</div>
              {WELCOME_SUGGESTIONS.map((suggestion) => (
                <motion.button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); sendMessage(suggestion); }}
                  className="px-4 py-2.5 rounded-xl glass border border-[#00F0FF]/30 text-xs text-foreground hover:text-[#00F0FF] hover:border-[#00F0FF]/60 hover:bg-[#00F0FF]/10 transition-all font-medium text-left shadow-[0_0_15px_#00F0FF10]"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="w-3.5 h-3.5 inline mr-1 opacity-70 text-[#00F0FF]" />
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg glass flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_hsl(185_100%_50%/0.1)]">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-xl ${
                  msg.role === "user"
                    ? "bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-white shadow-[0_0_20px_#00F0FF20]"
                    : "glass border border-[#ff44aa]/30 text-white shadow-[0_0_20px_#ff44aa15]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                )}
                <div className={`text-[9px] mt-2 ${msg.role === "user" ? "text-[#00F0FF]/50" : "text-[#ff44aa]/50"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-7 h-7 rounded-lg glass flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="glass border border-white/10 rounded-xl px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Analyzing your question...</span>
              </div>
              {/* Pulsing dots */}
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
          ⚠️ {error} — The AI will provide fallback responses.
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-[#00F0FF]/21 p-4 relative z-10" style={{ background: "rgba(0,0,0,0.68)", backdropFilter: "blur(20px)" }}>
        <AnimatePresence>
          {showComingSoon && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="max-w-md mx-auto mb-4 glass p-4 rounded-2xl border border-[#00F0FF]/50 shadow-[0_0_30px_#00F0FF22] text-center"
            >
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Vision Feature Coming Soon</h3>
              <p className="text-[11px] text-white/50 leading-relaxed">
                NUCLEUS_X Engine is currently indexing multi-modal data. Vision & PDF analysis will be unlocked in the next update. 
                <br /><br />
                <span className="text-primary/80 font-mono text-[9px]">HINT: YOU CAN ALWAYS COPY-PASTE YOUR TEXT OR PROBLEMS DIRECTLY INTO THE CHAT! ✨</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto relative group">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            className="hidden" 
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/21 to-[#ff44aa]/21 rounded-xl blur-md opacity-50 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          
          <motion.button
            type="button"
            onClick={() => setShowComingSoon(true)}
            className="px-4 py-4 rounded-xl glass border border-[#00F0FF]/40 text-primary hover:border-primary transition-all relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedFile ? "Add a message about this image..." : "Ask or upload a photo of your problem..."}
            disabled={loading}
            className="flex-1 px-5 py-4 rounded-xl glass border border-[#00F0FF]/40 text-sm text-white bg-black/50 focus:outline-none focus:border-[#00F0FF] placeholder:text-white/30 transition-all disabled:opacity-50 relative z-10 shadow-[inner_0_0_10px_#00F0FF11]"
          />
          
          <motion.button
            type="submit"
            disabled={loading || (!input.trim() && !selectedFile)}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#00aaff] text-black font-bold hover:shadow-[0_0_30px_#00F0FF60] transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10 relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
        <p className="text-[9px] text-white/30 text-center mt-3 uppercase tracking-widest font-mono">
          NUCLEUS_X ENGINE • NUCLEUS AI IS STILL IN DEVELOPMENT AND CAN MAKE MISTAKES
        </p>
      </div>
    </motion.div>
  );
}
