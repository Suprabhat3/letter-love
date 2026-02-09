"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  Heart,
} from "lucide-react";
import { SparklesIcon } from "@/components/SparklesIcon";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, name);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      if (!isLogin) {
        setSuccess(true);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#faf5f6] dark:bg-background p-4 sm:p-6 lg:p-8">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Hearts Animation */}
        <div className="absolute inset-0 z-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                y: "110vh",
                x: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [0, 0.3, 0],
                y: "-10vh",
                x: [0, i % 2 === 0 ? 60 : -60, 0],
                rotate: [0, 20, -20, 0],
              }}
              transition={{
                duration: 18 + i * 2,
                repeat: Infinity,
                delay: i * 3,
                ease: "linear",
              }}
              className="absolute text-pink-400 dark:text-pink-600"
              style={{
                left: `${10 + i * 15}%`,
              }}
            >
              <Heart fill="currentColor" size={24 + i * 8} />
            </motion.div>
          ))}
        </div>

        {/* Big Text Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] dark:opacity-[0.03] pointer-events-none select-none z-0">
          <span className="text-[20vw] font-handwriting font-bold text-pink-600 dark:text-pink-400 leading-none whitespace-nowrap">
            Love
          </span>
        </div>

        {/* Existing Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] bg-gradient-to-br from-pink-300/30 to-purple-300/30 dark:from-pink-900/20 dark:to-purple-900/20 w-[800px] h-[800px] rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
          className="absolute bottom-[-10%] right-[-10%] bg-gradient-to-tl from-indigo-300/30 to-rose-300/30 dark:from-indigo-900/20 dark:to-rose-900/20 w-[700px] h-[700px] rounded-full blur-[100px]"
        />
      </div>

      <div className="z-10 w-full max-w-md relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/70 dark:bg-card/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(236,72,153,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6 sm:p-8 rounded-[2rem] relative overflow-hidden"
        >
          {/* Decorative shine effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent opacity-50" />

          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-50 dark:from-pink-900/30 dark:to-rose-800/30 mb-4 shadow-inner"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <SparklesIcon className="w-6 h-6 text-pink-500" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight mb-2">
              {isLogin ? "Welcome Back" : "Join LetterLove"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Continue your journey of heartfelt words"
                : "Start creating convenient, beautiful letters"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h2 className="text-xl font-serif font-bold mb-2 text-foreground">
                  Check Your Inbox
                </h2>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  We've sent a magic link to your email. Click it to confirm
                  your account and get started!
                </p>
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setSuccess(false);
                  }}
                  className="w-full btn-primary py-3 rounded-xl font-semibold shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all text-sm"
                >
                  Back to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginBottom: 12,
                        }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="relative group overflow-hidden"
                      >
                        <svg
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          required={!isLogin}
                          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/30 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground text-sm"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/30 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground text-sm"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/30 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground text-sm"
                    />
                  </div>

                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="relative group overflow-hidden"
                      >
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm Password"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/30 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground text-sm"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-500 text-xs p-3 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-100 dark:border-red-900/30"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl text-base font-bold shadow-xl shadow-pink-200/40 hover:shadow-pink-300/40 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </motion.button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-black/5 dark:border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs">
                    Or continue with
                  </span>
                  <div className="flex-grow border-t border-black/5 dark:border-white/10"></div>
                </div>

                <motion.button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    const result = await signInWithGoogle();
                    if (result.error) {
                      setError(result.error);
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground hover:bg-gray-50 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group text-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </motion.button>

                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    {isLogin ? "New to LetterLove? " : "Already a member? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                      }}
                      className="font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors hover:underline"
                    >
                      {isLogin ? "Create account" : "Sign in"}
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground/60 text-xs mt-8 font-serif italic"
        >
          Made with love for love 💕
        </motion.p>
      </div>
    </main>
  );
}
