import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

interface PasswordBarrierProps {
  onSuccess: () => void;
}

const EXPECTED_HASH = "2b237a66400335b0ddea20d6fa06f7e72127e8360e1d8b554c6b6394952714e6";
const BOOMBOX_LOGO = "https://raw.githubusercontent.com/Samplayshindi/RadioLofi/fecae3756d78e99e59964fdbe845c95cb42c645c/Retro_Cream_and_Burgundy_Boombox_cleaned-Photoroom.png";

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
    // Check if session is already authenticated
    try {
      if (sessionStorage.getItem('rw_auth') === 'true') {
        onSuccess();
        return;
      }
    } catch {}
    inputRef.current?.focus();
  }, [onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError(false);
    setLoading(true);

    try {
      let isMatch = false;
      try {
        const computed = await computeHash(password);
        isMatch = computed === EXPECTED_HASH;
      } catch {
        isMatch = password === 'SamarTheGamer';
      }

      if (isMatch || password === 'SamarTheGamer') {
        try {
          sessionStorage.setItem('rw_auth', 'true');
        } catch {}
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#07090e] p-6 overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-slate-900/60 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl text-center"
      >
        <div className="flex flex-col items-center mb-8">
          {/* Logo with ambient glow */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-2xl scale-125" />
            <div className="relative w-28 h-28 flex items-center justify-center p-2">
              <img 
                src={BOOMBOX_LOGO} 
                alt="Radio Waves" 
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mb-2 font-display">
            Radio Waves <span className="text-cyan-400 font-medium text-lg ml-1">Archive</span>
          </h1>
          <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400 font-mono flex items-center gap-1.5 justify-center">
            <Lock className="w-3.5 h-3.5 text-cyan-400" /> Authorized Entry Required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Key"
              disabled={loading}
              className={`w-full px-5 py-4 bg-black/50 border rounded-2xl text-sm font-sans tracking-wide text-white placeholder-slate-500 outline-none transition-all duration-200 pr-12 ${
                error 
                  ? 'border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.25)] focus:border-red-500' 
                  : 'border-white/10 focus:border-cyan-400/60 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              }`}
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="h-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-bold text-rose-400 font-mono"
                >
                  Incorrect Access Key
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/25 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Enter Archive</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-5 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Encrypted Archive • Session Protected
          </p>
        </div>
      </motion.div>
    </div>
  );
}
