"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "success" | "error";

interface Props {
  /** Visual style for the form pill. */
  variant?: "light" | "dark";
  /** When true, the email input is shown immediately (no CTA-first step). */
  expanded?: boolean;
  /** Custom CTA label (used in the closed/CTA state). */
  ctaLabel?: string;
  /** Auto-focus input on mount when expanded. */
  autoFocus?: boolean;
}

export function WaitlistForm({
  variant = "dark",
  expanded = false,
  ctaLabel = "Solicitar invitacion",
  autoFocus = false,
}: Props) {
  const params = useSearchParams();
  const source = params.get("src");

  const [step, setStep] = useState<"cta" | "email">(expanded ? "email" : "cta");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "email" && (autoFocus || !expanded)) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [step, autoFocus, expanded]);

  const submit = async () => {
    setErrorMsg(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Correo inválido");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Algo salió mal. Inténtalo de nuevo.");
      }
      setStatus("success");
      // Let other components (e.g. SocialProof) react/refresh.
      window.dispatchEvent(new CustomEvent("waitlist:signup"));
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  const isDark = variant === "dark";

  if (status === "success") {
    return (
      <div className="w-full flex flex-col items-center gap-3">
        <div
          className={
            "w-full h-14 rounded-full flex items-center justify-center gap-2 " +
            (isDark
              ? "bg-emerald-500/15 border border-emerald-400/40"
              : "bg-emerald-500/10 border border-emerald-500/30")
          }
        >
          <CheckIcon />
          <span
            className={
              "text-sm font-semibold " + (isDark ? "text-white" : "text-black")
            }
          >
            Estás dentro
          </span>
        </div>
        <p
          className={
            "text-[12px] text-center tracking-wide " +
            (isDark ? "text-white/60" : "text-black/55")
          }
        >
          Te confirmaremos por correo en{" "}
          <span
            className={
              "font-medium " + (isDark ? "text-white" : "text-black")
            }
          >
            {email}
          </span>{" "}
          cuando lancemos.
        </p>
      </div>
    );
  }

  // Closed CTA-first variant (used as a primary button)
  if (step === "cta") {
    return (
      <button
        type="button"
        onClick={() => setStep("email")}
        className={
          "group relative w-full h-14 pl-7 pr-2 rounded-full flex items-center justify-between font-semibold text-base transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] " +
          (isDark
            ? "bg-white text-black shadow-[0_20px_60px_-15px_rgba(255,255,255,0.4)]"
            : "bg-black text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]")
        }
      >
        <span className="relative flex-1 text-center -ml-12 tracking-tight">
          {ctaLabel}
        </span>
        <span
          className={
            "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group-hover:translate-x-0.5 " +
            (isDark
              ? "bg-black text-white group-hover:bg-[var(--color-accent)]"
              : "bg-white text-black group-hover:bg-[var(--color-accent)] group-hover:text-white")
          }
        >
          <ArrowIcon />
        </span>
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (status !== "loading") submit();
      }}
      className="w-full flex flex-col items-stretch gap-3"
    >
      <div
        className={
          "relative w-full h-14 rounded-full flex items-center pr-2 pl-6 " +
          (isDark
            ? "bg-transparent border border-white/16"
            : "bg-white border border-black/8 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]")
        }
      >
        <input
          ref={inputRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="send"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMsg(null);
            }
          }}
          className={
            "flex-1 h-full bg-transparent text-base font-medium outline-none tracking-tight " +
            (isDark
              ? "text-white placeholder:text-white/35"
              : "text-black placeholder:text-black/35")
          }
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-12 px-6 rounded-full bg-[var(--color-accent)] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 active:scale-[0.97] hover:bg-[var(--color-accent-deep)]"
        >
          {status === "loading" ? <Spinner /> : "Unirme"}
        </button>
      </div>

      <div className="flex items-center justify-center min-h-[18px]">
        {errorMsg ? (
          <p
            className={
              "text-[11px] tracking-wide " +
              (isDark ? "text-red-300" : "text-red-500")
            }
          >
            {errorMsg}
          </p>
        ) : !expanded ? (
          <button
            type="button"
            onClick={() => setStep("cta")}
            className={
              "text-[11px] tracking-[0.15em] uppercase transition-colors " +
              (isDark
                ? "text-white/40 hover:text-white"
                : "text-black/40 hover:text-black")
            }
          >
            ← regresar
          </button>
        ) : (
          <p
            className={
              "text-[11px] tracking-wide " +
              (isDark ? "text-white/45" : "text-black/45")
            }
          >
            Sin spam. Solo novedades relevantes de lanzamiento.
          </p>
        )}
      </div>
    </form>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="rgb(16, 185, 129)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
