import { Metadata } from "next";
import { cache } from "react";
import { getPublicCard } from "@/lib/cards-server";
import { getTemplateById } from "@/lib/templates";
import CardView from "@/components/card/CardView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// generateMetadata and the page body both need the card. Without this the same
// row is fetched twice per request.
const loadCard = cache(getPublicCard);

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

  const template = getTemplateById(card.templateId);
  const recipient = card.content.recipientName || "Someone Special";
  const sender = card.content.senderName || "Someone";

  // Deliberately a teaser, never the letter body. The previous version put
  // `message.substring(0, 100)` here, so the WhatsApp link preview spoiled the
  // letter before the recipient ever opened it — which also defeats the whole
  // point of the envelope.
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

  // Read through the service role: since migration 0002 there is no public
  // SELECT policy on `cards`, so this is the only path a non-owner has to a
  // card — and the only place that decides what a stranger may see.
  const card = await loadCard(id);

  if (!card) {
    return notFound();
  }

  // A card whose template was removed still resolves to a fallback theme, but
  // an unknown template id means a broken or tampered link, not a card.
  if (!getTemplateById(card.templateId)) {
    return notFound();
  }

  return <CardView card={card} />;
}
