import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abrir invitación",
  description: "Continúa en la app de Allons para crear tu contraseña.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
};

function buildAppDeepLink(tokenHash: string, type: string) {
  const qs = new URLSearchParams({ token_hash: tokenHash, type });
  return `allons://verify?${qs.toString()}`;
}

export default async function VerifyInvitePage({ searchParams }: Props) {
  const sp = await searchParams;
  const tokenHash = sp.token_hash?.trim() ?? "";
  const type = sp.type?.trim() || "invite";
  const appUrl = tokenHash ? buildAppDeepLink(tokenHash, type) : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#131516] px-6 py-12 text-[#fbfbfb]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1c1b20] p-8 text-center">
        <p className="text-2xl font-bold text-[#f67010]">Allons</p>
        <h1 className="mt-6 text-xl font-semibold">Abre tu invitación</h1>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Toca el botón para abrir la app en tu celular y crear tu contraseña.
        </p>

        {appUrl ? (
          <>
            <a
              href={appUrl}
              className="mt-8 inline-block rounded-xl bg-[#f67010] px-6 py-3.5 text-sm font-bold text-white no-underline"
            >
              Abrir Allons
            </a>
            <p className="mt-6 text-left text-xs leading-5 text-white/45">
              ¿No se abrió la app? Instala Allons desde la tienda y vuelve a
              tocar el botón. Si usas Android, también puedes copiar el enlace
              del correo y abrirlo aquí de nuevo.
            </p>
          </>
        ) : (
          <p className="mt-8 text-sm text-amber-300/90">
            Enlace incompleto. Abre de nuevo el correo de invitación o pide al
            admin que reenvíe la invitación.
          </p>
        )}
      </div>
    </main>
  );
}
