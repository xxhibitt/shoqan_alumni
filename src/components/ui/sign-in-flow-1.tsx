"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";

interface SignInPageProps {
  className?: string;
}

export const SignInPage = ({ className }: SignInPageProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setErrorMsg("");
      setLoading(true);
      try {
        const res = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Authentication failed");
        }

        // OTP Successfully generated in DB
        setStep("code");
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 500);
    }
  }, [step]);

  const handleCodeChange = async (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }

      if (index === 5 && value) {
        const isComplete = newCode.every(digit => digit.length === 1);
        if (isComplete) {
          const finalCode = newCode.join("");
          setErrorMsg("");

          try {
            const res = await signIn("credentials", {
              email,
              otp: finalCode,
              redirect: false,
            });

            if (res?.error) {
              throw new Error(res.error);
            }
            // Success
            setTimeout(() => setStep("success"), 500);
          } catch (err: any) {
            setErrorMsg(err.message);
            // Clear last digit for quick retry
            const resetCode = [...newCode];
            resetCode[5] = "";
            setCode(resetCode);
            codeInputRefs.current[5]?.focus();
          }
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackClick = () => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
  };

  const handleSuccessFinish = async () => {
    try {
      const res = await fetch("/api/onboarding/check");
      if (res.ok) {
        const { hasProfile } = await res.json();
        router.push(hasProfile ? "/feed" : "/onboarding");
      } else {
        router.push("/onboarding");
      }
    } catch {
      router.push("/onboarding");
    }
  };

  return (
    <div className={cn("flex w-[100%] flex-col min-h-screen relative overflow-hidden p-0 m-0", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-shoqan-dark via-black to-[#0a110e] z-0" />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex flex-1 flex-col lg:flex-row ">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full mt-[100px] max-w-sm px-4">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Welcome back.</h1>
                      <p className="text-[1.2rem] text-shoqan-primary/80 font-light mt-2">Sign in to your network</p>
                    </div>

                    {errorMsg && (
                      <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {errorMsg}
                      </div>
                    )}

                    <div className="space-y-4 pt-4">
                      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                        <input
                          type="email"
                          placeholder="admin@shoqanalumni.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full backdrop-blur-[1px] text-white border-1 border-shoqan-primary/30 rounded-full py-4 px-6 focus:outline-none focus:border focus:border-shoqan-primary/70 text-center bg-black/20"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Secure Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full backdrop-blur-[1px] text-white border-1 border-shoqan-primary/30 rounded-full py-4 px-6 focus:outline-none focus:border focus:border-shoqan-primary/70 text-center bg-black/20"
                          required
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full mt-2 text-[#0a110e] font-semibold text-lg flex items-center justify-center rounded-full py-3 bg-shoqan-primary hover:bg-emerald-400 transition-colors disabled:opacity-50"
                        >
                          {loading ? "Authenticating..." : "Continue"}
                        </button>
                      </form>
                    </div>

                    <p className="text-xs text-shoqan-light/50 pt-6">
                      Don't have an account? <Link href="/register" className="underline text-shoqan-primary hover:text-emerald-300 transition-colors">Register here</Link>.
                    </p>
                  </motion.div>
                ) : step === "code" ? (
                  <motion.div
                    key="code-step"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">2FA Verification</h1>
                      <p className="text-[1.1rem] text-shoqan-light/50 font-light pt-1">Please check your email terminal for the OTP.</p>
                    </div>

                    {errorMsg && (
                      <div className="px-4 py-2 mt-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {errorMsg}
                      </div>
                    )}

                    <div className="w-full pt-4">
                      <div className="relative rounded-full py-4 px-5 border border-shoqan-primary/20 bg-black/20">
                        <div className="flex items-center justify-center">
                          {code.map((digit, i) => (
                            <div key={i} className="flex items-center">
                              <div className="relative">
                                <input
                                  ref={(el) => {
                                    codeInputRefs.current[i] = el;
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={1}
                                  value={digit}
                                  onChange={e => handleCodeChange(i, e.target.value)}
                                  onKeyDown={e => handleKeyDown(i, e)}
                                  className="w-8 text-center text-xl bg-transparent text-white border-none focus:outline-none focus:ring-0 appearance-none"
                                  style={{ caretColor: 'transparent' }}
                                />
                                {!digit && (
                                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                                    <span className="text-xl text-shoqan-light/30">0</span>
                                  </div>
                                )}
                              </div>
                              {i < 5 && <span className="text-shoqan-primary/30 text-xl">|</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full gap-3 pt-6">
                      <motion.button
                        onClick={handleBackClick}
                        className="rounded-full bg-transparent border border-shoqan-primary/30 text-shoqan-light font-medium px-8 py-3 hover:bg-shoqan-primary/10 transition-colors w-[30%]"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        Back
                      </motion.button>
                      <motion.button
                        className={`flex-1 rounded-full font-medium py-3 border transition-all duration-300 ${code.every(d => d !== "")
                          ? "bg-shoqan-primary text-shoqan-dark border-transparent hover:bg-emerald-400 cursor-pointer"
                          : "bg-black/20 text-shoqan-light/50 border-shoqan-primary/10 cursor-not-allowed"
                          }`}
                        disabled={!code.every(d => d !== "")}
                      >
                        Verifying...
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Encryption Verified.</h1>
                      <p className="text-[1.25rem] text-shoqan-light/50 font-light">Welcome back, securely.</p>
                    </div>

                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="py-10"
                    >
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-shoqan-primary to-emerald-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-shoqan-dark" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      onClick={handleSuccessFinish}
                      className="w-full rounded-full bg-shoqan-primary text-shoqan-dark font-medium py-3 hover:bg-emerald-400 transition-colors"
                    >
                      Continue to Network
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
