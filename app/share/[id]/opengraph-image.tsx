import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { getTemplateById } from "@/lib/templates";

// Route segment config
export const alt = "LetterLove Card Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getCard(id: string) {
  try {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("OG Image Supabase Error:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("OG Image Fetch Error:", e);
    return null;
  }
}

// Theme configuration helper
function getThemeConfig(template: any) {
  const category = template?.category || "love";
  const id = template?.id || "";

  // Base config
  let config = {
    bgGradient:
      "linear-gradient(135deg, #fce7f3 0%, white 50%, #ec489920 100%)",
    primaryColor: template?.colors?.primary || "#ec4899",
    secondaryColor: template?.colors?.secondary || "#fce7f3",
    mainIcon: template?.emoji || "💌",
    decorations: "💕",
    title: "A Letter For",
  };

  // Specific overrides
  if (id === "birthday-wish" || category === "celebration") {
    config = {
      ...config,
      bgGradient:
        "linear-gradient(135deg, #fef3c7 0%, white 50%, #f59e0b20 100%)",
      mainIcon: "🎂",
      decorations: "🎈",
      title: "Happy Birthday",
    };
  } else if (id === "sorry-card" || category === "apology") {
    config = {
      ...config,
      bgGradient:
        "linear-gradient(135deg, #dbeafe 0%, white 50%, #3b82f620 100%)",
      mainIcon: "🥺",
      decorations: "💙",
      title: "Note of Apology",
    };
  } else if (id === "miss-you" || category === "longing") {
    config = {
      ...config,
      bgGradient:
        "linear-gradient(135deg, #cffafe 0%, white 50%, #06b6d420 100%)",
      mainIcon: "💭",
      decorations: "✨",
      title: "Thinking of You",
    };
  } else if (id === "love-letter" || category === "love") {
    config = {
      ...config,
      bgGradient:
        "linear-gradient(135deg, #fce7f3 0%, white 50%, #ec489920 100%)",
      mainIcon: "💌",
      decorations: "💖",
      title: "A Love Letter For",
    };
  }

  return config;
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getCard(id);

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

  const template = getTemplateById(card.template_id);
  const recipient = card.data.recipientName || "Someone Special";
  const sender = card.data.senderName || "Someone";

  const theme = getThemeConfig(template);

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
        backgroundImage: theme.bgGradient,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Floating Background Elements */}
      {/* Top Left */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          fontSize: 80,
          opacity: 0.2,
        }}
      >
        {theme.decorations}
      </div>
      {/* Top Right */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          fontSize: 80,
          opacity: 0.2,
        }}
      >
        {theme.decorations}
      </div>
      {/* Bottom Left */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 40,
          fontSize: 80,
          opacity: 0.2,
        }}
      >
        {theme.decorations}
      </div>
      {/* Bottom Right */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          fontSize: 80,
          opacity: 0.2,
        }}
      >
        {theme.decorations}
      </div>

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
            color: theme.primaryColor,
            marginBottom: 30,
            background: `${theme.primaryColor}15`,
            padding: "10px 30px",
            borderRadius: "100px",
          }}
        >
          {theme.title}
        </div>

        {/* Main Visual Icon Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            background: `${theme.primaryColor}10`,
            borderRadius: "50%",
            marginBottom: 30,
            border: `4px solid ${theme.primaryColor}30`,
          }}
        >
          <div style={{ fontSize: 80 }}>{theme.mainIcon}</div>
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
          <span style={{ color: theme.primaryColor, fontWeight: 700 }}>
            {sender}
          </span>
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
        letterlove.ai
      </div>
    </div>,
    {
      ...size,
    },
  );
}
