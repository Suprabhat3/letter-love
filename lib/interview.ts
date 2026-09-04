// The memory interview.
//
// [agent.md](agent.md) promised that "users input small details and AI weaves
// them into a tear-jerking love letter", and the landing page sells exactly
// that. What shipped was a polish button. This is the missing half: four or
// five small, concrete questions whose answers are the raw material the model
// actually needs.
//
// Shared between the modal that renders the questions and the prompt builder
// that consumes the answers, for the same reason as lib/tones.ts. There is
// nothing secret in a question.
//
// Written in Hinglish on purpose. "Pehli baar kab laga ki yeh special hai?"
// gets a real answer from the audience this is for; "Describe a formative
// moment in your relationship" gets a blank stare and a skip.

export interface InterviewQuestion {
  /** Stable key for the answer map. Never renumber these. */
  id: string;
  /** The question itself, shown in big type, one per screen. */
  prompt: string;
  /** A nudge under the input for anyone stuck. */
  hint: string;
  placeholder: string;
  /**
   * How this answer is labelled when handed to the model. Kept separate from
   * `prompt` so the question can be rewritten for humans without changing what
   * the model is told the answer means.
   */
  facet: string;
}

/** Long enough for a real memory, short enough to stay a prompt and not a letter. */
export const MAX_ANSWER_CHARS = 300;

const WHO: InterviewQuestion = {
  id: "who",
  prompt: "Unka naam ya nickname?",
  hint: "Jo tum sach mein bulate ho — formal naam nahi",
  placeholder: "Riya, ya 'Bandar' 🐒",
  facet: "What the sender calls them",
};

const LOVE: InterviewQuestion[] = [
  WHO,
  {
    id: "first",
    prompt: "Pehli baar kab laga ki yeh special hai?",
    hint: "Ek pal, ek din, ek chhoti si baat",
    placeholder: "Jab woh mujhe bina bataye station lene aayi thi...",
    facet: "The moment the sender knew",
  },
  {
    id: "secret",
    prompt: "Ek cheez jo sirf tum dono ko pata ho?",
    hint: "Inside joke, ek aadat, ek naam",
    placeholder: "Woh har chai mein do chammach cheeni daalti hai",
    facet: "A detail only the two of them share",
  },
  {
    id: "miss",
    prompt: "Unki kaunsi cheez sabse zyada yaad aati hai?",
    hint: "Awaaz, hansi, koi aadat",
    placeholder: "Uski hansi, jab woh khud pe hi has deti hai",
    facet: "What the sender misses most",
  },
  {
    id: "oneline",
    prompt: "Agar ek line kehni ho, toh kya?",
    hint: "Bas dil se. Sudharenge hum",
    placeholder: "Tere bina sab kuch adhoora lagta hai",
    facet: "The one line the sender wants to say",
  },
];

const CELEBRATION: InterviewQuestion[] = [
  WHO,
  {
    id: "howlong",
    prompt: "Inko kab se jaante ho?",
    hint: "School, college, kaam — ya bachpan se",
    placeholder: "College ke first day se, 6 saal ho gaye",
    facet: "How long they have known each other",
  },
  {
    id: "story",
    prompt: "Ek kahani jo yaad aate hi hasi aa jaaye?",
    hint: "Woh wala din jo tum dono bhool hi nahi sakte",
    placeholder: "Jab hum raat ko 2 baje maggi dhundhne nikle the",
    facet: "A story that makes them both laugh",
  },
  {
    id: "quality",
    prompt: "Inki sabse acchi baat kya hai?",
    hint: "Woh cheez jo inhe alag banati hai",
    placeholder: "Kabhi kisi ko akela feel nahi hone deti",
    facet: "What the sender admires about them",
  },
  {
    id: "wish",
    prompt: "Is saal inke liye kya dua hai?",
    hint: "Ek chhoti si wish, dil se",
    placeholder: "Jo bhi chahti hai, sab mile",
    facet: "The wish for the year ahead",
  },
];

const APOLOGY: InterviewQuestion[] = [
  WHO,
  {
    id: "what",
    prompt: "Hua kya tha?",
    hint: "Seedhe seedhe. Safai baad mein",
    placeholder: "Maine unki baat beech mein kaat di, sabke saamne",
    facet: "What happened",
  },
  {
    id: "feel",
    prompt: "Unhe kaisa laga hoga?",
    hint: "Sabse mushkil sawaal, sabse zaroori",
    placeholder: "Unhe laga hoga ki main unki respect nahi karta",
    facet: "How the sender thinks it made them feel",
  },
  {
    id: "change",
    prompt: "Ab kya alag karoge?",
    hint: "Ek cheez, jo tum sach mein kar sakte ho",
    placeholder: "Pehle sunuga, phir bolunga",
    facet: "What the sender will do differently",
  },
  {
    id: "matter",
    prompt: "Yeh rishta tumhare liye kya hai?",
    hint: "Yehi woh baat hai jo sorry ko sach banati hai",
    placeholder: "Inke bina meri koi baat poori nahi hoti",
    facet: "Why the relationship matters to the sender",
  },
];

const LONGING: InterviewQuestion[] = [
  WHO,
  {
    id: "distance",
    prompt: "Kitne door ho, aur kab se?",
    hint: "Sheher, desh, ya bas time zone",
    placeholder: "Do saal se, Bangalore aur Delhi",
    facet: "The distance between them",
  },
  {
    id: "reminds",
    prompt: "Kaunsi cheez dekh ke unki yaad aa jaati hai?",
    hint: "Gaana, jagah, khushboo, mausam",
    placeholder: "Baarish. Woh hamesha bhigne ki zid karti thi",
    facet: "What reminds the sender of them",
  },
  {
    id: "lastmet",
    prompt: "Aakhri baar milne pe kya hua tha?",
    hint: "Jo aakhri baat hui, ya jo reh gayi",
    placeholder: "Station pe usne kaha 'jaldi aana' aur mud gayi",
    facet: "Their last time together",
  },
  {
    id: "when",
    prompt: "Agli baar milne pe sabse pehle kya karoge?",
    hint: "Woh pehla minute",
    placeholder: "Bas gale lagunga, kuch bolunga hi nahi",
    facet: "What the sender will do when they next meet",
  },
];

/**
 * Keyed by template first, category second.
 *
 * Per-template beats per-category wherever the questions genuinely differ —
 * an anniversary wants "kitne saal" and a valentine wants "kab se pasand hai",
 * and asking the wrong one is exactly the kind of thing that makes an
 * interview feel like a form.
 */
const BY_TEMPLATE: Record<string, InterviewQuestion[]> = {
  "valentine-ask": [
    WHO,
    {
      id: "since",
      prompt: "Kab se pasand hai?",
      hint: "Aur kya tumne kabhi bataya?",
      placeholder: "Do saal se, aur ab tak himmat nahi hui",
      facet: "How long the sender has felt this way",
    },
    {
      id: "notice",
      prompt: "Sabse pehle kya notice kiya tha?",
      hint: "Woh chhoti si cheez",
      placeholder: "Jaise woh sabki baat dhyaan se sunti hai",
      facet: "What the sender first noticed",
    },
    {
      id: "scared",
      prompt: "Poochhne se darr kyun lagta hai?",
      hint: "Yeh line letter ko sach banati hai",
      placeholder: "Kahin dosti kharab na ho jaaye",
      facet: "What the sender is afraid of",
    },
    {
      id: "oneline",
      prompt: "Agar ek line kehni ho, toh kya?",
      hint: "Bas dil se",
      placeholder: "Tumhare saath sab kuch aasaan lagta hai",
      facet: "The one line the sender wants to say",
    },
  ],
  anniversary: [
    WHO,
    {
      id: "years",
      prompt: "Kitne saal ho gaye?",
      hint: "Aur woh din yaad hai?",
      placeholder: "5 saal, aur woh baarish wala din aaj bhi yaad hai",
      facet: "How long they have been together",
    },
    {
      id: "changed",
      prompt: "In saalon mein kya badla hai?",
      hint: "Tum dono mein, ya tum dono ke beech",
      placeholder: "Ab ladai kam hoti hai, aur baat zyada",
      facet: "What has changed over the years",
    },
    {
      id: "same",
      prompt: "Aur kya bilkul nahi badla?",
      hint: "Yeh sabse pyaari line banti hai",
      placeholder: "Aaj bhi mere har mazaak pe sabse pehle wohi hasti hai",
      facet: "What has stayed exactly the same",
    },
    {
      id: "next",
      prompt: "Agle saal ke liye kya chahte ho?",
      hint: "Chhota sa bhi chalega",
      placeholder: "Bas ek trip, sirf hum dono",
      facet: "What the sender wants for the year ahead",
    },
  ],
};

const BY_CATEGORY: Record<string, InterviewQuestion[]> = {
  love: LOVE,
  celebration: CELEBRATION,
  apology: APOLOGY,
  longing: LONGING,
};

export function interviewFor(
  templateId: string,
  category?: string,
): InterviewQuestion[] {
  return BY_TEMPLATE[templateId] ?? BY_CATEGORY[category ?? ""] ?? LOVE;
}

/**
 * Trim an answer map down to what the prompt builder will accept.
 *
 * Answers arrive over the wire, so the server re-derives the question list from
 * the template id and keeps only ids that actually belong to it. Anything else
 * is a client sending keys we never asked for.
 */
export function pickAnswers(
  questions: InterviewQuestion[],
  raw: unknown,
): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const question of questions) {
    const value = source[question.id];
    if (typeof value === "string" && value.trim()) {
      out[question.id] = value.slice(0, MAX_ANSWER_CHARS);
    }
  }
  return out;
}
