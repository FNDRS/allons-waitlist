"use client";

import { useEffect, useMemo, useRef } from "react";

interface MoteData {
  /** Base x position as ratio of viewport width (0-1) */
  x: number;
  /** Base y position as ratio of viewport height (0-1) */
  y: number;
  /** Radius in px */
  s: number;
  /** Opacity (0-1) */
  o: number;
}

// Distribution biased toward the spotlight zone (upper-center).
// Brighter, larger motes sit closer to the cone; dimmer ones spread to the edges.
const MOTE_DATA: MoteData[] = [
  // Hot cluster — right under the cone
  { x: 0.42, y: 0.1, s: 2.6, o: 1.0 },
  { x: 0.5, y: 0.14, s: 2.2, o: 0.95 },
  { x: 0.56, y: 0.1, s: 2.4, o: 1.0 },
  { x: 0.46, y: 0.2, s: 1.8, o: 0.9 },
  { x: 0.53, y: 0.22, s: 2.0, o: 0.92 },
  { x: 0.39, y: 0.25, s: 1.6, o: 0.8 },
  { x: 0.59, y: 0.26, s: 1.9, o: 0.85 },
  { x: 0.43, y: 0.32, s: 1.7, o: 0.78 },
  { x: 0.55, y: 0.34, s: 1.5, o: 0.72 },
  { x: 0.48, y: 0.38, s: 1.6, o: 0.75 },
  // Mid spread
  { x: 0.3, y: 0.18, s: 1.5, o: 0.65 },
  { x: 0.65, y: 0.16, s: 1.6, o: 0.7 },
  { x: 0.32, y: 0.3, s: 1.3, o: 0.6 },
  { x: 0.68, y: 0.3, s: 1.4, o: 0.65 },
  { x: 0.36, y: 0.42, s: 1.2, o: 0.55 },
  { x: 0.5, y: 0.46, s: 1.4, o: 0.6 },
  { x: 0.62, y: 0.42, s: 1.3, o: 0.55 },
  { x: 0.42, y: 0.5, s: 1.1, o: 0.5 },
  { x: 0.58, y: 0.52, s: 1.2, o: 0.55 },
  { x: 0.48, y: 0.6, s: 1.0, o: 0.45 },
  { x: 0.55, y: 0.66, s: 1.1, o: 0.5 },
  { x: 0.4, y: 0.68, s: 1.0, o: 0.45 },
  // Wider spread, dimmer
  { x: 0.2, y: 0.2, s: 1.2, o: 0.42 },
  { x: 0.78, y: 0.18, s: 1.3, o: 0.48 },
  { x: 0.22, y: 0.4, s: 1.0, o: 0.36 },
  { x: 0.76, y: 0.42, s: 1.1, o: 0.42 },
  { x: 0.18, y: 0.55, s: 0.9, o: 0.32 },
  { x: 0.8, y: 0.58, s: 1.0, o: 0.38 },
  { x: 0.28, y: 0.65, s: 0.9, o: 0.32 },
  { x: 0.72, y: 0.68, s: 1.0, o: 0.36 },
  // Edges / ambient
  { x: 0.08, y: 0.3, s: 0.8, o: 0.26 },
  { x: 0.92, y: 0.28, s: 0.9, o: 0.3 },
  { x: 0.1, y: 0.6, s: 0.7, o: 0.22 },
  { x: 0.9, y: 0.62, s: 0.8, o: 0.28 },
  { x: 0.05, y: 0.45, s: 0.7, o: 0.2 },
  { x: 0.95, y: 0.48, s: 0.7, o: 0.22 },
  // Bottom
  { x: 0.4, y: 0.78, s: 1.0, o: 0.34 },
  { x: 0.6, y: 0.8, s: 1.1, o: 0.38 },
  { x: 0.3, y: 0.85, s: 0.8, o: 0.26 },
  { x: 0.7, y: 0.88, s: 0.9, o: 0.3 },
  { x: 0.5, y: 0.92, s: 0.8, o: 0.24 },
];

const REPEL_RADIUS = 160;
const REPEL_STRENGTH = 80;

export function Motes() {
  const elsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number | null>(null);
  // Smoothed repel offsets per mote (lerp targets) so motion eases in/out.
  const offsetsRef = useRef(
    MOTE_DATA.map(() => ({ x: 0, y: 0 })),
  );

  // Phase offsets give each mote independent drift/twinkle without hydration mismatches.
  const phases = useMemo(
    () =>
      MOTE_DATA.map((_, i) => ({
        driftX: ((i * 137) % 100) / 100,
        driftY: ((i * 91) % 100) / 100,
        driftSpeed: 0.18 + ((i * 53) % 30) / 100,
        twinkleSpeed: 0.5 + ((i * 71) % 40) / 100,
        twinklePhase: ((i * 211) % 100) / 100,
      })),
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);

    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mouse = mouseRef.current;
      // Lerp factor: how quickly motes catch up to their target offset (0-1 per frame).
      const lerp = 0.18;

      for (let i = 0; i < MOTE_DATA.length; i++) {
        const el = elsRef.current[i];
        if (!el) continue;
        const m = MOTE_DATA[i];
        const p = phases[i];
        const off = offsetsRef.current[i];

        const driftX =
          Math.sin(t * p.driftSpeed + p.driftX * Math.PI * 2) * 18;
        const driftY =
          Math.cos(t * p.driftSpeed * 0.85 + p.driftY * Math.PI * 2) * 14;
        const baseX = m.x * w + driftX;
        const baseY = m.y * h + driftY;

        let targetOffX = 0;
        let targetOffY = 0;
        if (mouse.active) {
          const dx = baseX - mouse.x;
          const dy = baseY - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.5) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / REPEL_RADIUS) ** 2 * REPEL_STRENGTH;
            targetOffX = (dx / dist) * force;
            targetOffY = (dy / dist) * force;
          }
        }

        off.x += (targetOffX - off.x) * lerp;
        off.y += (targetOffY - off.y) * lerp;

        const tw =
          0.7 +
          Math.sin(t * p.twinkleSpeed + p.twinklePhase * Math.PI * 2) * 0.3;
        el.style.transform = `translate3d(${baseX + off.x}px, ${baseY + off.y}px, 0)`;
        el.style.opacity = String(m.o * tw);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phases]);

  return (
    <div className="motes" aria-hidden>
      {MOTE_DATA.map((m, i) => (
        <span
          key={i}
          ref={(el) => {
            elsRef.current[i] = el;
          }}
          className="mote"
          style={{
            width: `${m.s * 2}px`,
            height: `${m.s * 2}px`,
          }}
        />
      ))}
    </div>
  );
}
