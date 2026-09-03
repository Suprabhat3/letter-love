"use client";

import { SharedCard, Template } from "@/lib/types";
import { readCardContent, readCardStyle } from "@/lib/cardStyle";
import SorryCard from "./templates/SorryCard";
import BirthdayCard from "./templates/BirthdayCard";
import ValentineCard from "./templates/ValentineCard";
import GenericCardView from "./GenericCardView";
import CardView from "./card/CardView";

interface ShareCardViewProps {
  card: SharedCard;
  template: Template;
  /**
   * "new" routes through the lib/theme renderer. Driven by `?renderer=new` so
   * both paths can be compared on real card ids; step 4 of the Phase 1
   * migration makes "new" the only path and deletes everything below it.
   */
  renderer?: "legacy" | "new";
}

/**
 * Pure dispatcher — deliberately calls no hooks of its own.
 *
 * This file previously called useState/useEffect *after* three conditional
 * early returns, which violates the rules of hooks (React 19 can hard-error).
 * Keeping the branch hook-free and pushing all state into the leaf components
 * makes that class of bug structurally impossible.
 */
export default function ShareCardView({
  card,
  template,
  renderer = "legacy",
}: ShareCardViewProps) {
  if (renderer === "new") return <CardView card={card} />;

  switch (template.id) {
    case "sorry-card":
    case "birthday-wish":
    case "valentine-ask": {
      const props = {
        data: readCardContent(card.data),
        font: readCardStyle(card.data).font,
        cardId: card.id,
      };
      if (template.id === "sorry-card") return <SorryCard {...props} />;
      if (template.id === "birthday-wish") return <BirthdayCard {...props} />;
      return <ValentineCard {...props} />;
    }
    default:
      return <GenericCardView card={card} template={template} />;
  }
}
