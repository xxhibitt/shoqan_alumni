"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        // Success
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-zinc-50 min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm border border-zinc-300 bg-white p-6 shadow-md">
        <h1 className="mb-4 text-xl font-bold text-black">Sign In Configuration Test</h1>
        
        {error && (
          <div className="mb-4 bg-red-100 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-zinc-400 p-2 text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-zinc-400 p-2 text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-black py-2 font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-400"
          >
            {isLoading ? "Signing in..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
