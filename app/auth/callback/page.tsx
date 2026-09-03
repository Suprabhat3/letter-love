"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

const Spinner = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[100svh] bg-[#faf5f6] dark:bg-background">
    <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
    <p className="text-muted-foreground font-medium">{label}</p>
  </div>
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { session, loading } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);

  // Supabase returns OAuth errors in the URL *hash*, which useSearchParams
  // cannot see. Read them directly so a denied consent screen doesn't just spin.
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const error = params.get("error");
    if (error) {
      setFailure(
        params.get("error_description")?.replace(/\+/g, " ") || error,
      );
    }
  }, []);

  useEffect(() => {
    if (failure) return;

    if (session) {
      track("signup_completed");
      router.replace(redirectTo || "/dashboard");
      return;
    }

    if (loading) return;

    // No session and auth has settled: the exchange failed silently. The old
    // code had this recovery path commented out, which left the user on an
    // infinite spinner with no way forward.
    const timeout = setTimeout(() => {
      setFailure("We couldn't complete your sign in. Please try again.");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [session, loading, router, redirectTo, failure]);

  if (failure) {
    return (
      <main className="min-h-[100svh] flex items-center justify-center bg-[#faf5f6] dark:bg-background p-6">
        <div className="glass-panel max-w-md w-full rounded-3xl p-10 text-center border border-white/60 shadow-xl">
          <p className="text-5xl mb-4">😕</p>
          <h1 className="text-2xl font-serif font-bold mb-3 text-foreground">
            Sign in didn&apos;t work
          </h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            {failure}
          </p>
          <Link
            href={
              redirectTo
                ? `/auth?redirect=${encodeURIComponent(redirectTo)}`
                : "/auth"
            }
            className="btn-primary px-8 py-3 rounded-full font-semibold inline-block"
          >
            Try again
          </Link>
        </div>
      </main>
    );
  }

  return <Spinner label="Completing sign in..." />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner label="Completing sign in..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
