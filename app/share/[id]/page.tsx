import { Metadata } from "next";
import { getCard } from "@/lib/supabase";
import { getTemplateById } from "@/lib/templates";
import ShareCardView from "@/components/ShareCardView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return {
      title: "Letter Not Found | LetterLove",
      description:
        "The letter you are looking for does not exist or has expired.",
    };
  }

  const template = getTemplateById(card.template_id);
  const recipient = card.data.recipientName || "Someone Special";
  const sender = card.data.senderName || "Someone";

  return {
    title: `💌 A Letter for ${recipient} from ${sender} | LetterLove`,
    description: `Read this beautiful ${template?.name.toLowerCase() || "letter"} sent via LetterLove.`,
    openGraph: {
      title: `💌 A Letter for ${recipient}`,
      description: `"${card.data.message?.substring(0, 100) || "You have a special message waiting..."}"`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `💌 A Letter for ${recipient}`,
      description: `A special message from ${sender}.`,
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return notFound();
  }

  const template = getTemplateById(card.template_id);

  if (!template) {
    return notFound();
  }

  return <ShareCardView card={card} template={template} />;
}
