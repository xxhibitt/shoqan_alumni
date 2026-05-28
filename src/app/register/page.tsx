"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Not a JSON response. Raw text:", text);
        throw new Error("Server returned an invalid response. Check backend logs.");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to register");
      }

      // Success
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex w-[100%] flex-col min-h-screen relative overflow-hidden m-0 p-0">
      {/* Sleek static background overriding 3D Canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-shoqan-dark via-black to-[#0a110e] z-0" />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex flex-1 flex-col lg:flex-row ">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full mt-[50px] max-w-sm px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <h1 className="text-[2.2rem] font-bold leading-[1.1] tracking-tight text-white">
                      Create your
                      <br /> Legacy Profile
                    </h1>
                    <p className="text-[1.1rem] text-shoqan-primary/80 font-light mt-2">
                      Join the Shoqan Alumni network
                    </p>
                  </div>

                  {error && (
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4 pt-2">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full backdrop-blur-[1px] text-white border-1 border-shoqan-primary/30 rounded-2xl py-3 px-4 focus:outline-none focus:border focus:border-shoqan-primary/70 bg-black/20"
                        required
                      />
                      <input
                        type="password"
                        name="password"
                        placeholder="Secure Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full backdrop-blur-[1px] text-white border-1 border-shoqan-primary/30 rounded-2xl py-3 px-4 focus:outline-none focus:border focus:border-shoqan-primary/70 bg-black/20 mb-2"
                        required
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-[#0a110e] font-semibold text-lg flex items-center justify-center rounded-2xl py-3 bg-shoqan-primary hover:bg-emerald-400 transition-colors disabled:opacity-50"
                      >
                        {loading ? "Registering..." : "Enlist into Directory"}
                      </button>
                    </form>
                  </div>

                  <p className="text-sm text-shoqan-light/50 pt-2">
                    Already an alumnus?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-shoqan-primary hover:text-emerald-300 transition-colors"
                    >
                      Sign In Now
                    </Link>
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
