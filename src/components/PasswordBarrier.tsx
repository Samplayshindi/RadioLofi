import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

interface PasswordBarrierProps {
  onSuccess: () => void;
}

// SHA-256 hash of "SamarTheGamer"
const EXPECTED_HASH = "2b237a66400335b0ddea20d6fa06f7e72127e8360e1d8b554c6b6394952714e6";

// Async SHA-256 generator
async function computeHash(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function PasswordBarrier({ onSuccess }: PasswordBarrierProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input field immediately on load for instant use
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError(false);
    setLoading(true);

    try {
      const computed = await computeHash(password);
      if (computed === EXPECTED_HASH) {
        onSuccess();
      } else {
        setError(true);
        setPassword('');
        inputRef.current?.focus();
      }
    } catch (err) {
      // Graceful fallback helper (direct string check if WebCrypto fails on extremely old environments)
      if (password === "SamarTheGamer") {
        onSuccess();
      } else {
        setError(true);
        setPassword('');
        inputRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] p-6 overflow-hidden">
      {/* Dynamic Aurora background lights to match Home view */}
      <div className="aurora-bg aurora-1 opacity-[0.15] -top-20 -left-20" />
      <div className="aurora-bg aurora-2 opacity-[0.15] -bottom-20 -right-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center"
      >
        <div className="flex flex-col items-center mb-8">
          
          {/* Artist Profile Image */}
          <div className="relative mb-5 group">
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl scale-110 opacity-75 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl">
              <img 
                src="https://raw.githubusercontent.com/Samplayshindi/radio/main/cropped_circle_image.png" 
                alt="Radio Waves" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Radio Waves Logo and Title */}
          <h1 className="text-2xl font-black tracking-tight text-white mb-2">
            Radio Waves <span className="text-cyan-400 font-medium text-lg ml-1">Archive</span>
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 font-mono flex items-center gap-1.5 justify-center">
            <Lock className="w-3 h-3 text-cyan-400/80" /> Authorized Entry Required
          </p>
        </div>

        {/* Lock barrier form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Key"
              disabled={loading}
              className={`w-full px-5 py-4 bg-black/45 border rounded-2xl text-sm font-sans tracking-wide text-white placeholder-white/20 select-none outline-none transition-all duration-300 pr-12 focus:bg-black/75 ${
                error 
                  ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:border-red-500' 
                  : 'border-white/5 focus:border-cyan-400/40 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
              }`}
            />
            
            {/* Password toggle visibility icon button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Incorrect Password AnimatePresence Warning Message */}
          <div className="h-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs font-bold text-red-400"
                >
                  Incorrect Password
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Beautiful action submission button */}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 rgb-btn py-4 px-6 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-45 disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Gain Access</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-[9px] font-mono uppercase tracking-widest text-white/25">
            Cryptographic Vault Protection • v2.1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
