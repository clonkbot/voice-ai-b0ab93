import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Sidebar } from "./Sidebar";
import { MessageBubble } from "./MessageBubble";
import { VoiceWaveform } from "./VoiceWaveform";

export function ChatInterface() {
  const { signOut } = useAuthActions();
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.conversations.list) || [];
  const messages = useQuery(
    api.messages.list,
    activeConversationId ? { conversationId: activeConversationId } : "skip"
  );

  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.messages.send);
  const updateAudio = useMutation(api.messages.updateAudio);
  const chat = useAction(api.ai.chat);
  const textToSpeech = useAction(api.ai.textToSpeech);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create initial conversation if none exist
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0]._id);
    }
  }, [conversations, activeConversationId]);

  const handleNewConversation = async () => {
    const id = await createConversation({});
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await createConversation({});
      setActiveConversationId(conversationId);
    }

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setIsGenerating(true);

    try {
      // Send user message
      await sendMessage({
        conversationId,
        content: userMessage,
        role: "user",
      });

      // Get AI response
      const messageHistory: Array<{ role: "user" | "assistant"; content: string }> = [
        ...(messages || []).map((m: { role: "user" | "assistant"; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: userMessage },
      ];

      const response = await chat({
        messages: messageHistory,
        systemPrompt: "You are a warm, articulate AI companion with a voice like a late-night radio host. Keep responses conversational and engaging, but concise (2-3 sentences max unless the user asks for more detail). You speak with wisdom and a touch of wit.",
      });

      // Save AI response
      const messageId = await sendMessage({
        conversationId,
        content: response,
        role: "assistant",
      });

      // Generate voice if enabled
      if (voiceEnabled) {
        setIsSpeaking(true);
        try {
          const audioBase64 = await textToSpeech({
            text: response,
            voice: "Charon",
          });
          if (audioBase64) {
            await updateAudio({ messageId, audioBase64 });
            playAudio(audioBase64);
          }
        } catch (ttsError) {
          console.error("TTS failed:", ttsError);
        } finally {
          setIsSpeaking(false);
        }
      }
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (base64Pcm: string) => {
    try {
      const pcm = Uint8Array.from(atob(base64Pcm), (c) => c.charCodeAt(0));
      const sampleRate = 24000;
      const header = new ArrayBuffer(44);
      const view = new DataView(header);
      const w = (o: number, s: string) =>
        s.split("").forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
      w(0, "RIFF");
      view.setUint32(4, 36 + pcm.length, true);
      w(8, "WAVE");
      w(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      w(36, "data");
      view.setUint32(40, pcm.length, true);
      const wav = new Uint8Array(44 + pcm.length);
      wav.set(new Uint8Array(header), 0);
      wav.set(pcm, 44);
      const url = URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Audio playback failed:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/3 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => {
          setActiveConversationId(id);
          setSidebarOpen(false);
        }}
        onNew={handleNewConversation}
        onSignOut={signOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-steel hover:text-cream transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h1 className="font-display text-lg text-cream hidden sm:block">
                Voice<span className="text-amber-500">AI</span>
              </h1>
            </div>
          </div>

          {/* Voice toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              voiceEnabled
                ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                : "border-white/10 text-steel hover:text-cream"
            }`}
          >
            {voiceEnabled ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
            <span className="text-xs uppercase tracking-wider font-display hidden sm:inline">
              {voiceEnabled ? "Voice On" : "Voice Off"}
            </span>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          {!activeConversationId || (messages && messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-amber-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-cream mb-3">
                Start a conversation
              </h2>
              <p className="font-body text-steel text-sm md:text-base max-w-md">
                Type a message below and I'll respond with both text and voice.
                It's like having a personal radio companion.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages?.map((message: { _id: string; role: "user" | "assistant"; content: string; audioBase64?: string }) => (
                <MessageBubble
                  key={message._id}
                  role={message.role}
                  content={message.content}
                  audioBase64={message.audioBase64}
                  onPlayAudio={playAudio}
                />
              ))}
              {isGenerating && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Voice waveform indicator */}
        {isSpeaking && <VoiceWaveform />}

        {/* Error toast */}
        {error && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-body animate-fade-in">
            {error}
            <button onClick={() => setError(null)} className="ml-3 hover:text-red-300">×</button>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 md:px-6 py-4 border-t border-white/5 bg-[#0D0D0D]/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  disabled={isGenerating}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 pr-12 text-cream placeholder:text-steel/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all font-body resize-none disabled:opacity-50"
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0D0D0D] flex items-center justify-center hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
              >
                {isGenerating ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 py-2 text-center border-t border-white/5 bg-[#0D0D0D]">
          <p className="text-steel/30 text-xs font-body">
            Requested by <a href="https://twitter.com/PauliusX" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500/50 transition-colors">@PauliusX</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500/50 transition-colors">@clonkbot</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
