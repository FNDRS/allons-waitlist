"use client";

import { useEffect, useState } from "react";
import { HeroNav } from "@/components/HeroNav";

const FADE_SCROLL_DISTANCE = 420;

export function HeroStickyLayer() {
  const [layerStyle, setLayerStyle] = useState({
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
  });

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      const y = window.scrollY;
      const nextOpacity = Math.max(0, 1 - y / FADE_SCROLL_DISTANCE);
      setLayerStyle({
        opacity: nextOpacity,
        // Keep the layer locked to the top; only fade on scroll.
        transform: "translate3d(0, 0, 0)",
      });
      frame = null;
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="hero-sticky-layer" style={layerStyle}>
      <div className="hero-spotlight" aria-hidden />
      <HeroNav />
    </div>
  );
}
