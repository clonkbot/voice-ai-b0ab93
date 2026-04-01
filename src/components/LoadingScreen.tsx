export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin"></div>
          <div className="absolute inset-3 rounded-full bg-amber-500/10 animate-pulse"></div>
        </div>
        <p className="font-display text-amber-500/80 text-lg tracking-widest uppercase animate-pulse">
          Tuning in...
        </p>
      </div>
    </div>
  );
}
