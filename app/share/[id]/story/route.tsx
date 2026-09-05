import { ImageResponse } from "next/og";
import { getPublicCard } from "@/lib/cards-server";
import { resolveColor, resolveTheme } from "@/lib/theme";

export const runtime = "nodejs";

const WIDTH = 1080;
const HEIGHT = 1920;
/** Instagram and WhatsApp both overlay chrome on roughly this much of a story. */
const SAFE_AREA = 250;

/**
 * A 1080×1920 story graphic for the card.
 *
 * Rendered server-side with Satori rather than with a client canvas library,
 * for four reasons that all matter for this audience: it ships zero client JS
 * to a mid-range Android on mobile data; `html-to-image` and `html2canvas`
 * produce blank or half-rendered output inside the in-app WebViews people
 * actually open these links in, and cannot rasterise the `backdrop-blur` this
 * whole visual style leans on; the result is a URL, so it doubles as something
 * that can be long-pressed and saved; and it is deterministic across devices.
 *
 * The cost, stated plainly: Satori is not a browser, so this is a hand-authored
 * parallel layout rather than a screenshot of CardRenderer, and it will drift
 * from the card unless the shared parts stay in the theme config. That is an
 * acceptable trade — a vertical story wants a different composition anyway.
 *
 * DELIBERATE DEVIATION FROM THE PLAN: the plan suggested two or three lines of
 * the letter here. This renders none. The URL is public and unauthenticated, so
 * any line printed on it is a line anyone holding the share link can read
 * without opening the envelope — which is exactly the leak the og:description
 * fix closed. One rule, no exceptions: the letter body exists only behind the
 * unwrap.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const card = await getPublicCard(id);

  const origin = new URL(request.url).origin.replace(/^https?:\/\//, "");

  if (!card) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            background: "#fff",
            color: "#333",
            fontSize: 64,
          }}
        >
          <div style={{ fontSize: 160, marginBottom: 40 }}>💔</div>
          <div>Letter Not Found</div>
        </div>
      ),
      { width: WIDTH, height: HEIGHT },
    );
  }

  const theme = resolveTheme(card.templateId, card.style);
  const og = theme.og;
  const primary = resolveColor(og.primaryColor, theme.palette);
  const recipient = card.content.recipientName || "Someone Special";
  const sender = card.content.senderName || "Someone";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          backgroundImage: og.bgGradient,
          fontFamily: "sans-serif",
          position: "relative",
          paddingTop: SAFE_AREA,
          paddingBottom: SAFE_AREA,
        }}
      >
        {/* Corner decor, kept inside the safe area so the story UI never
            clips it. */}
        {(
          [
            { top: SAFE_AREA - 60, left: 70 },
            { top: SAFE_AREA - 60, right: 70 },
            { bottom: SAFE_AREA - 60, left: 70 },
            { bottom: SAFE_AREA - 60, right: 70 },
          ] as const
        ).map((pos, i) => (
          <div
            key={i}
            style={{ position: "absolute", ...pos, fontSize: 110, opacity: 0.2 }}
          >
            {og.decorations}
          </div>
        ))}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 72,
            border: "3px solid rgba(255,255,255,0.85)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.18)",
            padding: "90px 70px",
            width: 880,
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 6,
              color: primary,
              background: `${primary}15`,
              padding: "16px 40px",
              borderRadius: 100,
              marginBottom: 60,
            }}
          >
            {og.title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: `${primary}10`,
              border: `6px solid ${primary}30`,
              marginBottom: 60,
            }}
          >
            <div style={{ fontSize: 140 }}>{og.mainIcon}</div>
          </div>

          <div
            style={{
              fontSize: 104,
              fontWeight: 900,
              color: "#1f2937",
              textAlign: "center",
              lineHeight: 1.1,
              maxWidth: 760,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {recipient}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "#6b7280",
              fontWeight: 500,
              marginTop: 24,
            }}
          >
            from <span style={{ color: primary, fontWeight: 700 }}>&nbsp;{sender}</span>
          </div>
        </div>

        {/* The viral payload. Everything above is decoration; this is the only
            part that turns a screenshot into a visit. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 80,
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 700, color: "#374151" }}>
            Read the full letter →
          </div>
          {/* Satori treats every interpolation as its own child node, and a
              non-flex div with more than one child is a hard error — so the URL
              is joined into a single string rather than composed inline. */}
          <div style={{ fontSize: 36, color: primary, marginTop: 16, fontWeight: 600 }}>
            {`${origin}/share/${card.id}`}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        // A story graphic never changes once the card is written, and it is
        // fetched by the person sharing it, sometimes repeatedly.
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
