"use client";

import { useEffect, useRef, useState } from "react";
import { WAITLIST_BASE_SUBSCRIBERS } from "@/lib/waitlist-count";

const avatars = [
  { initials: "AM", color: "from-orange-500 to-amber-300" },
  { initials: "LR", color: "from-zinc-100 to-zinc-400" },
  { initials: "DV", color: "from-[#f67010] to-red-500" },
  { initials: "NC", color: "from-neutral-600 to-neutral-300" },
  { initials: "+", color: "from-white to-neutral-500" },
];

function initialsFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local
    .split(/[^a-z0-9]+/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  const compact = (parts[0] ?? local).replace(/[^a-z0-9]/gi, "");
  return (compact.slice(0, 2) || "+").toUpperCase();
}

export function SocialProof() {
  const [count, setCount] = useState<number>(WAITLIST_BASE_SUBSCRIBERS);
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [latestInitials, setLatestInitials] = useState<string>("+");
  const animRef = useRef<number | null>(null);
  const displayRef = useRef<number>(0);
  const hasAnimatedOnceRef = useRef(false);

  const animateTo = (next: number) => {
    if (animRef.current) window.cancelAnimationFrame(animRef.current);
    const from = displayRef.current;
    const to = Math.max(WAITLIST_BASE_SUBSCRIBERS, next);
    const durationMs = 2600;
    const start = performance.now();

    // Only do the “big number” effect if there is something to animate.
    setIsAnimating(from !== to);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // Ease-out cubic.
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (to - from) * eased);
      displayRef.current = value;
      setDisplayCount(value);
      if (t < 1) {
        animRef.current = window.requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
      }
    };

    animRef.current = window.requestAnimationFrame(tick);
  };

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      fetch("/api/waitlist/count", { method: "GET" })
        .then((response) => response.json())
        .then((data) => {
          if (!cancelled && typeof data?.totalSubscribers === "number") {
            setCount(
              Math.max(WAITLIST_BASE_SUBSCRIBERS, data.totalSubscribers),
            );
          }
        })
        .catch(() => {});
    };

    refresh();

    const onSignup = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          email?: string;
          totalSubscribers?: number;
          duplicate?: boolean;
        }>
      ).detail;

      // Optimistic UI: if backend returns total, use it; otherwise bump once.
      if (typeof detail?.totalSubscribers === "number") {
        setCount(Math.max(WAITLIST_BASE_SUBSCRIBERS, detail.totalSubscribers));
      } else if (!detail?.duplicate) {
        setCount((prev) => prev + 1);
      }

      if (detail?.email) setLatestInitials(initialsFromEmail(detail.email));
      refresh();
    };
    window.addEventListener("waitlist:signup", onSignup as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("waitlist:signup", onSignup as EventListener);
      if (animRef.current) window.cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    // Animate on first load and whenever count updates.
    if (!hasAnimatedOnceRef.current) {
      hasAnimatedOnceRef.current = true;
      displayRef.current = 0;
      setDisplayCount(0);
    }
    animateTo(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="fade-up delay-5 mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <div className="flex" aria-hidden>
        {avatars.map((avatar, index) => {
          const initials =
            index === avatars.length - 1 ? latestInitials : avatar.initials;
          return (
          <div
            key={`${avatar.initials}-${index}`}
            className={`grid size-10 place-items-center rounded-full border-2 border-black bg-gradient-to-br ${avatar.color} text-[11px] font-bold text-black shadow-[0_8px_28px_rgba(0,0,0,0.45)] ${index === 0 ? "" : "-ml-3"}`}
          >
            {initials}
          </div>
          );
        })}
      </div>

      <p className="text-sm text-white/58">
        Únete a más de{" "}
        <span
          className={
            "font-semibold text-white tabular-nums transition-all duration-500 ease-out " +
            (isAnimating ? "text-[20px] sm:text-[22px]" : "text-[16px]")
          }
        >
          {displayCount.toLocaleString("es-HN")}
        </span>{" "}
        personas suscritas.
      </p>
    </div>
  );
}
