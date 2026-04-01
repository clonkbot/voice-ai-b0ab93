import { useState } from "react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  audioBase64?: string;
  onPlayAudio: (base64: string) => void;
}

export function MessageBubble({ role, content, audioBase64, onPlayAudio }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (audioBase64) {
      setIsPlaying(true);
      onPlayAudio(audioBase64);
      // Estimate duration (rough: 24000 samples/sec, 2 bytes/sample)
      const durationMs = (audioBase64.length * 0.75) / (24000 * 2) * 1000;
      setTimeout(() => setIsPlaying(false), Math.max(durationMs, 2000));
    }
  };

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] md:max-w-[70%] bg-amber-500/10 border border-amber-500/20 text-cream rounded-2xl rounded-tr-sm px-4 py-3 font-body">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
      <div className="max-w-[85%] md:max-w-[70%] bg-[#1a1a1a] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
        <p className="font-body text-cream/90 leading-relaxed">{content}</p>
        {audioBase64 && (
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`mt-3 flex items-center gap-2 text-xs font-display uppercase tracking-wider transition-all ${
              isPlaying
                ? "text-amber-400"
                : "text-steel hover:text-amber-500"
            }`}
          >
            {isPlaying ? (
              <>
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-amber-500 rounded-full animate-pulse"></span>
                  <span className="w-1 h-4 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: "75ms" }}></span>
                  <span className="w-1 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1 h-5 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: "225ms" }}></span>
                  <span className="w-1 h-3 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
                </span>
                <span>Playing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play Voice</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
