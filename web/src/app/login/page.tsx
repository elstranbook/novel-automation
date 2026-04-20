"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

function LoginForm() {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const ownerEmail = "elstranbooks@gmail.com";
  const redirectTo = useMemo(() => {
    const rawRedirect = searchParams.get("redirect");
    if (!rawRedirect) return "/";
    if (rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")) {
      return rawRedirect;
    }
    return "/";
  }, [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in! Redirecting...");
      router.push(redirectTo);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    setShowResetConfirm(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100">
              <h2 className="text-lg font-semibold">Confirm reset</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Send a password reset link to {ownerEmail}?
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
                >
                  {loading ? "Sending..." : "Yes, send it"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <Link href="/" className="text-sm text-zinc-400">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-zinc-400">
          Use your email and password to access your writing studio.
        </p>
        <p className="text-xs text-zinc-500">
          New account creation is disabled. Please contact the site owner if you need access.
        </p>
        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {email.trim().toLowerCase() === ownerEmail && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-300">
              <p className="text-sm font-semibold text-zinc-100">
                Owner password reset
              </p>
              <p className="mt-1">
                This will email a reset link to {ownerEmail}. Proceed only if you are the owner.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={loading}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-100 disabled:opacity-40"
                >
                  Send owner reset link
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-full border border-zinc-800 px-4 py-2 text-xs text-zinc-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </form>
        {message && (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
          <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
            <p className="text-sm text-zinc-400">Loading sign-in...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
