import { ImageResponse } from "next/og";

export const alt = "Allons — Eventos sin fricción";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          color: "#ffffff",
          padding: 72,
          position: "relative",
          overflow: "hidden",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -140,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "#F67010",
            opacity: 0.16,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -160,
            bottom: -200,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: "#ffffff",
            opacity: 0.06,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#F67010",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 650, letterSpacing: "-0.02em" }}>
            Allons
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 920,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
              fontWeight: 600,
            }}
          >
            Honduras · Próximamente
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              lineHeight: 1.03,
              letterSpacing: "-0.03em",
              fontWeight: 650,
            }}
          >
            Eventos sin fricción.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              lineHeight: 1.3,
              color: "rgba(255,255,255,0.62)",
              fontWeight: 500,
            }}
          >
            Únete a la lista de espera.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 22,
            color: "rgba(255,255,255,0.58)",
            alignItems: "center",
            fontWeight: 500,
          }}
        >
          <span>Descubre</span>
          <span style={{ color: "#F67010" }}>•</span>
          <span>Gestiona</span>
          <span style={{ color: "#F67010" }}>•</span>
          <span>Entra</span>
        </div>
      </div>
    ),
    size,
  );
}
