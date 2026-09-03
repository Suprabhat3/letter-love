import { Metadata } from "next";
import { cache } from "react";
import { getCard } from "@/lib/supabase";
import { getTemplateById } from "@/lib/templates";
import { readCardContent } from "@/lib/cardStyle";
import ShareCardView from "@/components/ShareCardView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// generateMetadata and the page body both need the card. Without this the same
// row is fetched twice per request.
const loadCard = cache(getCard);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await loadCard(id);

  if (!card) {
    return {
      title: "Letter Not Found | LetterLove",
      description:
        "The letter you are looking for does not exist or has expired.",
    };
  }

  const template = getTemplateById(card.template_id);
  const data = readCardContent(card.data);
  const recipient = data.recipientName || "Someone Special";
  const sender = data.senderName || "Someone";

  // Deliberately a teaser, never the letter body. The previous version put
  // `message.substring(0, 100)` here, so the WhatsApp link preview spoiled the
  // letter before the recipient ever opened it.
  const teaser = `${sender} wrote something for you. Tap to read it. 💌`;

  return {
    title: `💌 A Letter for ${recipient} from ${sender} | LetterLove`,
    description: `Read this beautiful ${template?.name.toLowerCase() || "letter"} sent via LetterLove.`,
    openGraph: {
      title: `💌 A Letter for ${recipient}`,
      description: teaser,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `💌 A Letter for ${recipient}`,
      description: teaser,
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;
  const card = await loadCard(id);

  if (!card) {
    return notFound();
  }

  const template = getTemplateById(card.template_id);

  if (!template) {
    return notFound();
  }

  return <ShareCardView card={card} template={template} />;
}
