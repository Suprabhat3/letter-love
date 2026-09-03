import { ImageResponse } from "next/og";
import { getPublicCard } from "@/lib/cards-server";
import { resolveColor, resolveTheme } from "@/lib/theme";

// Route segment config
export const alt = "LetterLove Card Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// This route runs in its own Satori bundle. It calls getPublicCard directly
// rather than through the React.cache()'d wrapper in page.tsx — that cache
// belongs to a different request — but it goes through the same reader, so the
// preview can never show something the share page would withhold.

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getPublicCard(id);

  if (!card) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          color: "#333",
          background: "#fff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>💔</div>
        <div style={{ fontWeight: 600 }}>Letter Not Found</div>
      </div>,
      { ...size },
    );
  }

  const content = card.content;
  const recipient = content.recipientName || "Someone Special";
  const sender = content.senderName || "Someone";

  // The former `getThemeConfig()` if-chain now lives in lib/theme — one theme
  // per template, shared with the card renderer. Satori cannot share React
  // components (no grid, no backdrop-filter, no animation, and every
  // multi-child div needs an explicit `display: flex`), so what is shared here
  // is the *config*, not the markup.
  const theme = resolveTheme(card.templateId, card.style);
  const og = theme.og;
  // Follow the resolved palette so a per-card palette override also recolours
  // the link preview, not just the card.
  const primary = resolveColor(og.primaryColor, theme.palette);

  // Never render the letter body here. The whole point of the envelope is that
  // the preview does not spoil what is inside.
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        backgroundImage: og.bgGradient,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Floating Background Elements */}
      {(
        [
          { top: 40, left: 40 },
          { top: 40, right: 40 },
          { bottom: 40, left: 40 },
          { bottom: 40, right: 40 },
        ] as const
      ).map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            fontSize: 80,
            opacity: 0.2,
          }}
        >
          {og.decorations}
        </div>
      ))}

      {/* Main Card Container */}
      <div
        style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: 50,
          padding: "60px 80px",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          border: "2px solid rgba(255,255,255,0.8)",
          width: "900px",
        }}
      >
        {/* Top Label */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: primary,
            marginBottom: 30,
            background: `${primary}15`,
            padding: "10px 30px",
            borderRadius: "100px",
          }}
        >
          {og.title}
        </div>

        {/* Main Visual Icon Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            background: `${primary}10`,
            borderRadius: "50%",
            marginBottom: 30,
            border: `4px solid ${primary}30`,
          }}
        >
          <div style={{ fontSize: 80 }}>{og.mainIcon}</div>
        </div>

        {/* Recipient Name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#1f2937",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 20,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: "800px",
          }}
        >
          {recipient}
        </div>

        {/* Sender Line */}
        <div
          style={{
            fontSize: 32,
            color: "#6b7280",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: 10,
          }}
        >
          From{" "}
          <span style={{ color: primary, fontWeight: 700 }}>{sender}</span>
        </div>
      </div>

      {/* Branding Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          color: "#9ca3af",
          fontSize: 20,
          fontWeight: 500,
        }}
      >
        letterlove.fun
      </div>
    </div>,
    {
      ...size,
    },
  );
}
