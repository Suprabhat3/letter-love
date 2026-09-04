// Text hygiene, in and out.
//
// Moved out of the request handler verbatim. The blast radius of a prompt
// injection here is "a card contains weird text", not data loss — so these are
// deliberately cheap, ordered by value, and not over-engineered.

/** Long enough for a real draft; short enough that nobody pastes a novel. */
export const MAX_PROMPT_CHARS = 2000;

/**
 * Drop C0/C1 control characters, zero-width joiners and bidi overrides, which
 * are the usual carriers for invisible prompt-injection payloads. Expressed as
 * code-point comparisons so there are no escape sequences to get mangled.
 * Tab, newline and carriage return are kept.
 */
function stripUnsafeChars(input: string): string {
  let out = "";
  for (const ch of input) {
    const c = ch.codePointAt(0) as number;
    if (c < 9) continue;
    if (c === 11 || c === 12) continue;
    if (c > 13 && c < 32) continue;
    if (c >= 127 && c <= 159) continue;
    if (c >= 8203 && c <= 8207) continue;
    if (c >= 8232 && c <= 8238) continue;
    if (c === 65279) continue;
    out += ch;
  }
  return out;
}

/**
 * Strip control, zero-width and bidi characters; normalise; cap length.
 *
 * The fence-token strip matters more than it looks: user text is delivered
 * inside `<user_draft>` tags, so a draft containing a literal closing tag could
 * otherwise end the data section early and have everything after it read as
 * instructions.
 */
export function sanitizeUserText(input: string, max = MAX_PROMPT_CHARS): string {
  return stripUnsafeChars(input.normalize("NFKC"))
    .replace(/<\/?user_draft>/gi, "")
    .replace(/<\/?answers>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

/**
 * Clean the model's output.
 *
 * The prompt already asks for no markdown and no em-dashes, and the model still
 * occasionally drifts — so this is the guard rather than only asking nicely.
 * It also strips the "Here is your letter:" preambles that survive every
 * instruction not to write them.
 */
export function cleanOutput(text: string): string {
  return text
    .replace(/^\s*(?:#{1,6}\s*)/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/[—–]/g, ",")
    .replace(
      /^\s*(?:here(?:'s| is)[^\n:]*:|sure[^\n:]*:|of course[^\n:]*:)\s*/i,
      "",
    )
    // [\s\S] rather than the dotAll flag: tsconfig targets below es2018.
    .replace(/^["“]([\s\S]+)["”]$/, "$1")
    .trim();
}
