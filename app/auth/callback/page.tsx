"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { session } = useAuth();

  useEffect(() => {
    // If session exists, redirect to the original page or dashboard
    if (session) {
      router.push(redirectTo || "/dashboard");
    } else {
      // If no session after a short timeout, maybe redirect to login?
      // Or rely on AuthProvider to set session eventually.
      // Usually supabase handles the URL parsing automatically.
      const timeout = setTimeout(() => {
        // Fallback if something goes wrong or user just lands here
        // router.push("/auth");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [session, router, redirectTo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf5f6] dark:bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
      <p className="text-muted-foreground font-medium">Completing sign in...</p>
    </div>
  );
}
