import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not sign in as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl"></div>

      {/* Radio wave decorations */}
      <div className="absolute top-20 left-10 opacity-20">
        <svg width="120" height="60" viewBox="0 0 120 60" className="text-amber-500">
          <path d="M0 30 Q30 10 60 30 Q90 50 120 30" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M0 30 Q30 0 60 30 Q90 60 120 30" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-10 opacity-20 rotate-180">
        <svg width="120" height="60" viewBox="0 0 120 60" className="text-amber-500">
          <path d="M0 30 Q30 10 60 30 Q90 50 120 30" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M0 30 Q30 0 60 30 Q90 60 120 30" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-cream tracking-tight mb-2">
            Voice<span className="text-amber-500">AI</span>
          </h1>
          <p className="font-body text-steel text-sm md:text-base italic">
            Conversations that speak to you
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 md:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-display text-xs uppercase tracking-wider text-steel mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-4 py-3 text-cream placeholder:text-steel/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all font-body"
              />
            </div>
            <div>
              <label className="block font-display text-xs uppercase tracking-wider text-steel mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-4 py-3 text-cream placeholder:text-steel/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all font-body"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <p className="text-red-400 text-sm font-body text-center py-2 px-4 bg-red-500/10 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-[#0D0D0D] font-display font-bold py-3 px-6 rounded-lg uppercase tracking-wider text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Processing...
                </span>
              ) : flow === "signIn" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="w-full text-center text-steel hover:text-amber-500 transition-colors font-body text-sm"
            >
              {flow === "signIn" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#141414] px-4 text-xs uppercase tracking-wider text-steel/50 font-display">
                or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnonymous}
            disabled={isLoading}
            className="w-full border border-white/10 text-cream/70 font-display py-3 px-6 rounded-lg uppercase tracking-wider text-sm hover:bg-white/5 hover:border-amber-500/30 hover:text-cream transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue as Guest
          </button>
        </div>

        <p className="text-center text-steel/40 text-xs mt-6 font-body">
          Your voice conversations, secured and private
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-steel/30 text-xs font-body">
          Requested by <a href="https://twitter.com/PauliusX" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500/50 transition-colors">@PauliusX</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500/50 transition-colors">@clonkbot</a>
        </p>
      </footer>
    </div>
  );
}
