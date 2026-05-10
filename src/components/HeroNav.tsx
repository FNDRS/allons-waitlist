import Link from "next/link";
import { AllonsLogo } from "@/components/AllonsLogo";

export function HeroNav() {
  return (
    <header className="relative z-30 w-full pointer-events-none">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          aria-label="Allons inicio"
          className="inline-flex items-center pointer-events-auto"
        >
          <AllonsLogo className="h-9 w-auto sm:h-10" variant="dark" />
        </Link>
      </div>
    </header>
  );
}
