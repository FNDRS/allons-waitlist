"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm() {
  const params = useSearchParams();
  const source = params.get("src");

  const [step, setStep] = useState<"cta" | "email">("cta");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "email") {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [step]);

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
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-sm flex flex-col items-center gap-3">
        <div className="w-full h-14 rounded-full bg-white/5 border border-[var(--color-border)] flex items-center justify-center">
          <span className="text-sm font-semibold">¡Estás en la lista! 🎉</span>
        </div>
        <p className="text-xs text-[var(--color-muted)] text-center">
          Te escribiremos a {email} cuando lancemos.
        </p>
      </div>
    );
  }

  if (step === "cta") {
    return (
      <button
        type="button"
        onClick={() => setStep("email")}
        className="group w-full max-w-sm h-14 pl-7 pr-2 bg-white text-black rounded-full flex items-center justify-between font-semibold text-base shadow-[0_8px_30px_rgba(255,255,255,0.08)] transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <span className="flex-1 text-center -ml-12">Request Early Access!</span>
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5">
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
      className="w-full max-w-sm flex flex-col items-stretch gap-3"
    >
      <div className="relative w-full h-14 bg-white rounded-full flex items-center pr-2 pl-6">
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
          className="flex-1 h-full bg-transparent text-black placeholder:text-black/40 text-base font-medium outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-12 px-6 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-transform active:scale-[0.97]"
        >
          {status === "loading" ? <Spinner /> : "Submit"}
        </button>
      </div>

      {errorMsg ? (
        <p className="text-xs text-red-400 text-center">{errorMsg}</p>
      ) : (
        <button
          type="button"
          onClick={() => setStep("cta")}
          className="text-xs text-[var(--color-muted)] hover:text-white transition-colors"
        >
          ← regresar
        </button>
      )}
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
