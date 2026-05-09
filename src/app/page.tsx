import { Suspense } from "react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { AllonsLogo } from "@/components/AllonsLogo";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(246,112,16,0.10) 0%, rgba(246,112,16,0) 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-12">
        <AllonsLogo className="w-44 h-auto" />

        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Eventos sin fricción.
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted)] max-w-xs">
            Únete a la lista de espera. Te avisamos cuando lancemos.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-14 w-full max-w-sm rounded-full bg-white/5" />
          }
        >
          <WaitlistForm />
        </Suspense>

        <footer className="text-xs text-[var(--color-muted)]/60 mt-4">
          © {new Date().getFullYear()} Allons · Honduras
        </footer>
      </div>
    </main>
  );
}
