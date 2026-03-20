"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage("Signed in! You can return to the studio.");
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created! Check your email to confirm.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        <Link href="/" className="text-sm text-zinc-400">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-zinc-400">
          Use your email and password to access your writing studio.
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
        </form>
        <button
          onClick={handleSignUp}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Create account"}
        </button>
        {message && (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
