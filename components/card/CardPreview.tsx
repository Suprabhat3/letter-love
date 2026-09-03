"use client";

import { useMemo, useState } from "react";
import type { Phase } from "@/lib/theme";
import { resolveTheme } from "@/lib/theme";
import type { FontId } from "@/lib/fonts";
import type { Template } from "@/lib/types";
import CardStage from "./CardStage";
import CardRenderer from "./CardRenderer";
import type { CardContent } from "./BlockRenderer";

/**
 * Placeholder-filled content, so a template can preview itself with no input.
 *
 * Derived from the template's own field placeholders rather than a hand-written
 * demo object per template — which is what lets a Phase 6 template appear in the
 * gallery preview the moment it is added to `lib/templates.ts`.
 */
export function demoContent(template: Template): CardContent {
  const out: CardContent = {};
  for (const field of template.fields) out[field.name] = field.placeholder;
  return out;
}

export interface CardPreviewProps {
  templateId: string;
  content: CardContent;
  font?: FontId;
  /** "panel" is the editor's bounded box; "page" is the full-bleed gallery demo. */
  variant?: "panel" | "page";
  /** The gallery demo lets you actually play the yes/no game; the editor does not. */
  interactive?: boolean;
  seed?: string;
}

/**
 * The real card renderer, mounted outside a share page.
 *
 * The editor's live preview used to be a separate hand-rolled mini-card, so for
 * Birthday / Sorry / Valentine what you previewed looked nothing like what you
 * sent. This is the same `CardStage` + `CardRenderer` the recipient gets, with
 * the envelope and the paced reveal off — a preview that made you wait for a
 * reveal on every keystroke would be unusable.
 */
export default function CardPreview({
  templateId,
  content,
  font,
  variant = "panel",
  interactive = false,
  seed = "preview",
}: CardPreviewProps) {
  const theme = useMemo(() => resolveTheme(templateId), [templateId]);

  const [phase, setPhase] = useState<Phase>(
    interactive && theme.interaction.kind !== "none" ? "pre" : "post",
  );

  return (
    <CardStage theme={theme} seed={seed} phase={phase} variant={variant}>
      <CardRenderer
        theme={theme}
        content={content}
        font={font}
        seed={seed}
        paced={false}
        interactive={interactive}
        phase={phase}
        onPhaseChange={setPhase}
      />
    </CardStage>
  );
}
