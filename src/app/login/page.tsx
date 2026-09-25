"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import { signIn } from "next-auth/react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError(
          "Invalid email or password. Please try again."
        );

        setLoading(false);
        return;
      }

      const callbackUrl =
        searchParams.get("callbackUrl") || "/events";

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Something went wrong while signing in. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090d] text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-2xl lg:grid-cols-2">

          {/* LEFT */}
          <div className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20">
                  <QrCode className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold">
                    BadgeFlow
                  </p>

                  <p className="text-xs text-white/40">
                    Event Badge Generator
                  </p>
                </div>
              </div>

              <div className="max-w-md">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  Event technology
                </div>

                <h1 className="text-4xl font-black leading-tight">
                  Beautiful badges.
                  <br />

                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Generated instantly.
                  </span>
                </h1>

                <p className="mt-5 text-sm leading-7 text-white/45">
                  Create personalized event badges,
                  generate unique QR codes and export
                  hundreds of badges in minutes.
                </p>
              </div>

              <div className="mt-10 space-y-3">
                {[
                  "Bulk attendee import",
                  "Dynamic QR generation",
                  "Professional PDF export",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/60"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    </div>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-white/25">
              Secure workspace • BadgeFlow
            </p>
          </div>

          {/* RIGHT */}
          <div className="bg-white p-6 text-zinc-950 sm:p-10 dark:bg-zinc-950 dark:text-white">
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              {/* MOBILE BRAND */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white">
                  <QrCode className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold">
                    BadgeFlow
                  </p>

                  <p className="text-[10px] text-zinc-500">
                    Event Badge Generator
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                  <LockKeyhole className="h-4 w-4" />
                </div>

                <h2 className="text-2xl font-black">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Sign in to access your badge workspace.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-xs font-bold">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="admin@example.com"
                    required
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-xs font-bold">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      required
                      className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 pr-12 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* LOGIN */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-bold text-white shadow-xl shadow-zinc-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-emerald-400"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                <ShieldCheck className="h-3 w-3" />
                Secure administrator access
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#07090d] text-white">
          <div className="text-sm text-white/60">
            Loading...
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}