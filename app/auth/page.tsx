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
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

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
        {/* Back Link with specific styling */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 absolute -top-16 left-0"
        >
          <Link
            href="/"
            className="group inline-flex items-center text-muted-foreground/80 hover:text-pink-600 dark:hover:text-pink-400 transition-colors gap-2 font-medium bg-white/40 dark:bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/40"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/70 dark:bg-card/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(236,72,153,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden"
        >
          {/* Decorative shine effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent opacity-50" />

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-50 dark:from-pink-900/30 dark:to-rose-800/30 mb-6 shadow-inner"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <SparklesIcon className="w-8 h-8 text-pink-500" />
            </motion.div>
            <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight mb-3">
              {isLogin ? "Welcome Back" : "Join LetterLove"}
            </h1>
            <p className="text-muted-foreground">
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
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h2 className="text-2xl font-serif font-bold mb-3 text-foreground">
                  Check Your Inbox
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  We've sent a magic link to your email. Click it to confirm
                  your account and get started!
                </p>
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setSuccess(false);
                  }}
                  className="w-full btn-primary py-3.5 rounded-xl font-semibold shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all"
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
                className="space-y-5"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/30 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/30 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                    />
                  </div>

                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="relative group overflow-hidden"
                      >
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm Password"
                          required
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-pink-200 dark:hover:border-pink-800 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/30 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-xl border border-red-100 dark:border-red-900/30"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 rounded-xl text-lg font-bold shadow-xl shadow-pink-200/40 hover:shadow-pink-300/40 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </motion.button>

                {/* Toggle Mode */}
                <div className="pt-6 relative text-center">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-black/5 dark:border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-full text-muted-foreground mt-2">
                      {isLogin ? "New to LetterLove?" : "Already a member?"}
                    </span>
                  </div>
                </div>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    className="font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors hover:underline"
                  >
                    {isLogin ? "Create an account" : "Sign in instead"}
                  </button>
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
