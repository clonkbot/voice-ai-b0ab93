export function VoiceWaveform() {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#141414] border border-amber-500/30 rounded-full px-6 py-3 shadow-xl shadow-black/50">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
        <div className="relative w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-[#0D0D0D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-amber-500 rounded-full"
            style={{
              height: `${12 + Math.sin(i * 0.8) * 8 + 8}px`,
              animation: `waveform 0.8s ease-in-out infinite`,
              animationDelay: `${i * 50}ms`,
            }}
          ></div>
        ))}
      </div>

      <span className="font-display text-xs uppercase tracking-wider text-amber-500 ml-1">
        Speaking...
      </span>

      <style>{`
        @keyframes waveform {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.4);
          }
        }
      `}</style>
    </div>
  );
}
