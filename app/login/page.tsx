"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data) {
        router.push(redirect);
      }
    } catch (err: any) {
      const responseData = err?.response?.data;

      if (responseData?.code === "AUTH_INVALID_CREDENTIALS") {
        setError("Invalid email or password");
      } else {
        setError(responseData?.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Sign in to your dashboard
          </p>
        </div>

        <div className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <p className="text-red-500 text-sm">{error}</p>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  const emailError = validateEmail(email);
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: emailError || "",
                  }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-lg outline-none text-white placeholder:text-white/30 transition-colors ${
                  fieldErrors.email
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-white/30"
                }`}
                placeholder="dev@acme.com"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1.5">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  const passwordError = validatePassword(password);
                  setFieldErrors((prev) => ({
                    ...prev,
                    password: passwordError || "",
                  }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-lg outline-none text-white placeholder:text-white/30 transition-colors ${
                  fieldErrors.password
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-white/30"
                }`}
                placeholder="Enter your password"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1.5">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-white text-black rounded-lg font-medium transition-colors hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-white hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
