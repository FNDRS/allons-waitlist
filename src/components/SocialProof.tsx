"use client";

import { useEffect, useState } from "react";

const FALLBACK_COUNT = 320;
const COUNT_OFFSET = 247;

const avatars = [
  { initials: "AM", color: "from-orange-500 to-amber-300" },
  { initials: "LR", color: "from-zinc-100 to-zinc-400" },
  { initials: "DV", color: "from-[#f67010] to-red-500" },
  { initials: "NC", color: "from-neutral-600 to-neutral-300" },
  { initials: "+", color: "from-white to-neutral-500" },
];

export function SocialProof() {
  const [count, setCount] = useState<number>(FALLBACK_COUNT);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/waitlist", { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && typeof data?.count === "number") {
          setCount(Math.max(FALLBACK_COUNT, data.count + COUNT_OFFSET));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fade-up delay-5 mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <div className="flex" aria-hidden>
        {avatars.map((avatar, index) => (
          <div
            key={avatar.initials}
            className={`grid size-10 place-items-center rounded-full border-2 border-black bg-gradient-to-br ${avatar.color} text-[11px] font-bold text-black shadow-[0_8px_28px_rgba(0,0,0,0.45)] ${index === 0 ? "" : "-ml-3"}`}
          >
            {avatar.initials}
          </div>
        ))}
      </div>

      <p className="text-sm text-white/58">
        Únete a más de{" "}
        <span className="font-semibold text-white tabular-nums">
          {count.toLocaleString("es-HN")}
        </span>{" "}
        personas en la lista.
      </p>
    </div>
  );
}
