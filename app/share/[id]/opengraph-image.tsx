import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { getTemplateById } from "@/lib/templates";

export const runtime = "edge";
export const alt = "LetterLove Card Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Initialize Supabase client for Edge Runtime
// We recreate it here to ensure Edge compatibility if the main lib has node-specificdeps
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getCard(id: string) {
  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = await params; // Await params in newer Next.js versions
  const card = await getCard(id);

  if (!card) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        LetterLove - Card Not Found
      </div>,
      { ...size },
    );
  }

  const template = getTemplateById(card.template_id);
  const recipient = card.data.recipientName || "Someone Special";
  const sender = card.data.senderName || "Someone";

  // Default colors if template not found
  const primaryColor = template?.colors.primary || "#ec4899";
  const secondaryColor = template?.colors.secondary || "#fce7f3";
  const divStyle = {
    display: "flex" as const, // Explicit cast for TS
  };

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${secondaryColor} 0%, white 50%, ${primaryColor}20 100%)`,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Decorative Circles */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `${primaryColor}20`,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `${secondaryColor}40`,
          filter: "blur(80px)",
        }}
      />

      {/* Card Container */}
      <div
        style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: 40,
          padding: "60px 80px",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.5)",
          maxWidth: "900px",
        }}
      >
        {/* Category / Template Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${primaryColor}20`,
            color: primaryColor,
            padding: "10px 24px",
            borderRadius: 50,
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {template?.emoji} {template?.name || "Letter"}
        </div>

        {/* Main Emoji */}
        <div style={{ fontSize: 100, marginBottom: 30 }}>
          {template?.emoji || "💌"}
        </div>

        {/* Text Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, color: "#666", marginBottom: 10 }}>
            A letter for
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: primaryColor,
              marginBottom: 10,
              lineHeight: 1.1,
            }}
          >
            {recipient}
          </div>
          <div style={{ fontSize: 28, color: "#666" }}>from {sender}</div>
        </div>
      </div>

      {/* Footer Branding */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 24,
          color: "#666",
          fontWeight: 500,
        }}
      >
        <span>Made with LetterLove 💕</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
