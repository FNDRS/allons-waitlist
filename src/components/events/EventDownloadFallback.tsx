import { AllonsLogo } from "@/components/AllonsLogo";

type Props = {
  appDeepLink: string;
  appStoreLink: string | null;
  playStoreLink: string;
};

export function EventDownloadFallback({
  appDeepLink,
  appStoreLink,
  playStoreLink,
}: Props) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] px-5 py-8 text-white sm:px-8">
      <div className="absolute inset-x-[-30%] top-[-20%] h-[520px] rounded-full bg-[#f67010]/20 blur-[120px]" />
      <div className="absolute inset-x-[10%] top-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col items-center justify-center text-center">
        <AllonsLogo className="h-auto w-32 sm:w-40" />

        <div className="mt-10 w-full max-w-xl rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_32px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f67010]">
            Evento compartido
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl">
            Abre este evento en Allons.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 tracking-tight text-white/58 sm:text-lg">
            Si ya tienes la app, vuelve a intentar abrir el evento. Si aún no la
            tienes, descárgala y regresa a este enlace compartido.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={appDeepLink}
              className="inline-flex items-center justify-center rounded-full bg-[#f67010] px-6 py-4 text-sm font-bold text-white shadow-[0_18px_45px_rgba(246,112,16,0.28)] transition hover:bg-[#ff7b1f]"
            >
              Abrir en Allons
            </a>
            <a
              href={playStoreLink}
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/12"
            >
              Google Play
            </a>
            {appStoreLink ? (
              <a
                href={appStoreLink}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/12"
              >
                App Store
              </a>
            ) : null}
          </div>

          {!appStoreLink ? (
            <p className="mt-5 text-xs leading-5 text-white/42">
              App Store se activará cuando la app esté publicada.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
