import Link from "next/link";
import { AllonsLogo } from "@/components/AllonsLogo";

export function HeroNav() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" aria-label="Allons inicio" className="inline-flex items-center">
        <AllonsLogo className="h-9 w-auto sm:h-10" variant="dark" />
      </Link>

      <nav
        aria-label="Navegación principal"
        className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1 text-sm text-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:flex"
      >
        <a
          href="#lista"
          className="rounded-full px-4 py-2 transition-colors hover:bg-white/8 hover:text-white"
        >
          Lista
        </a>
        <a
          href="#lanzamiento"
          className="rounded-full px-4 py-2 transition-colors hover:bg-white/8 hover:text-white"
        >
          Lanzamiento
        </a>
      </nav>
    </header>
  );
}
