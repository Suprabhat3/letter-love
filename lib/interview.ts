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
  placeholder: "Aarohi, ya 'Jaan' 🫠",
  facet: "What the sender calls them",
};

// The romantic WHO's tone ("Aarohi, ya 'Jaan'") reads wrong the moment the
// recipient isn't a partner or crush — a teacher or a mother is never
// "Jaan". Gratitude gets its own, and a few relationships inside it are
// fixed enough (a teacher is always a teacher) to earn their own placeholder
// on top of that.
const WHO_GRATITUDE: InterviewQuestion = {
  id: "who",
  prompt: "Unhe kya bulate ho?",
  hint: "Jo tum unhe assli mein bulate ho — naam ya rishta",
  placeholder: "Ritu, ya 'Sharma Sir', ya Maa",
  facet: "What the sender calls them",
};

const WHO_TEACHER: InterviewQuestion = {
  id: "who",
  prompt: "Unhe kya bulate ho?",
  hint: "Sir, Ma'am, ya jo bhi class mein bulate the",
  placeholder: "Sharma Sir",
  facet: "What the sender calls them",
};

const WHO_MOTHER: InterviewQuestion = {
  id: "who",
  prompt: "Tum unhe kya bulate ho?",
  hint: "Maa, Mummy, Amma — jo bhi sach mein bologe",
  placeholder: "Maa",
  facet: "What the sender calls them",
};

const WHO_FATHER: InterviewQuestion = {
  id: "who",
  prompt: "Tum unhe kya bulate ho?",
  hint: "Papa, Baba, Dad — jo bhi sach mein bologe",
  placeholder: "Papa",
  facet: "What the sender calls them",
};

// Celebration and festival cards go out much wider than a partner or crush —
// a birthday card or a Diwali note can just as easily be for a colleague, an
// aunt, or a childhood friend — so their WHO can't lean on a flirty nickname
// the way LOVE's does.
const WHO_NEUTRAL: InterviewQuestion = {
  id: "who",
  prompt: "Unka naam ya nickname?",
  hint: "Jo tum unhe bulate ho",
  placeholder: "Riya, ya Rohan bhai",
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
  WHO_NEUTRAL,
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

const FESTIVAL: InterviewQuestion[] = [
  WHO_NEUTRAL,
  {
    id: "howcelebrate",
    prompt: "Yeh tyohaar tum dono kaise manate ho?",
    hint: "Ghar pe, saath mein, ya ab phone pe",
    placeholder: "Pehle saath, ab video call pe. Har saal.",
    facet: "How the two of them mark this festival",
  },
  {
    id: "bestyear",
    prompt: "Sabse yaadgaar wala saal kaunsa tha?",
    hint: "Ek saal, ek scene",
    placeholder: "Woh saal jab bijli chali gayi aur sirf diye jal rahe the",
    facet: "The most memorable year they shared",
  },
  {
    id: "apart",
    prompt: "Iss baar saath ho ya door?",
    hint: "Agar door ho, toh yeh line letter mein aayegi",
    placeholder: "Iss baar main Bangalore mein hoon, ghar nahi ja paunga",
    facet: "Whether they are together or apart this year",
  },
  {
    id: "wish",
    prompt: "Iss saal inke liye kya dua hai?",
    hint: "Ek chhoti si wish, dil se",
    placeholder: "Bas sab theek rahe, aur tum thoda so bhi lo",
    facet: "The wish for the year ahead",
  },
];

const FRIENDSHIP: InterviewQuestion[] = [
  WHO,
  {
    id: "howmet",
    prompt: "Dosti shuru kaise hui thi?",
    hint: "Pehli mulaqat, ya woh din jab dost ban gaye",
    placeholder: "Hostel ki chhat pe, dono ko neend nahi aa rahi thi",
    facet: "How the friendship started",
  },
  {
    id: "story",
    prompt: "Ek kissa jo aaj bhi hasa deta hai?",
    hint: "Woh wala jo baar baar sunate ho",
    placeholder: "Jab tumne meri jagah viva de diya tha",
    facet: "A story they still laugh about",
  },
  {
    id: "showedup",
    prompt: "Kab yeh tumhare liye khade the?",
    hint: "Woh din jab kisi aur ne poocha bhi nahi",
    placeholder: "Papa ki tabiyat kharab hui thi, yeh raat bhar hospital mein baitha raha",
    facet: "A time they showed up for the sender",
  },
  {
    id: "neversaid",
    prompt: "Kya cheez tumne kabhi bola nahi?",
    hint: "Yehi poora letter hai",
    placeholder: "Ki tere bina main yeh saal nikaal hi nahi paata",
    facet: "What the sender has never said out loud",
  },
];

const GRATITUDE: InterviewQuestion[] = [
  WHO_GRATITUDE,
  {
    id: "what",
    prompt: "Inhone aisa kya kiya?",
    hint: "Chhoti cheez bhi chalegi — usse hi letter banta hai",
    placeholder: "Bina poochhe mere liye ruk gaye the",
    facet: "What they did",
  },
  {
    id: "cost",
    prompt: "Unhe iska kya mol chukana pada?",
    hint: "Time, paisa, neend, ya bas himmat",
    placeholder: "Apni chhutti cancel kar di thi",
    facet: "What it cost them",
  },
  {
    id: "changed",
    prompt: "Isse tumhare liye kya badla?",
    hint: "Yeh woh hissa hai jo unhe pata hi nahi",
    placeholder: "Us din ke baad maine haar maanna chhod diya",
    facet: "What it changed for the sender",
  },
  {
    id: "neversaid",
    prompt: "Ab tak thank you kyun nahi bola?",
    hint: "Sach likho. Sudharenge hum",
    placeholder: "Lagta tha awkward ho jaayega",
    facet: "Why the sender never said thank you before",
  },
];

/**
 * Shared by "Be My Valentine?" and "Finally Saying It". Both are the same
 * situation — you have not told them yet — and the question that makes either
 * letter work is "why does asking scare you".
 */
const CONFESSION: InterviewQuestion[] = [
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
  "valentine-ask": CONFESSION,
  "crush-confession": CONFESSION,

  // Same GRATITUDE questions, but the relationship is fixed rather than
  // generic, so the opening question can name it instead of asking as if it
  // could be anyone.
  "teachers-day": [WHO_TEACHER, ...GRATITUDE.slice(1)],
  "mothers-day": [WHO_MOTHER, ...GRATITUDE.slice(1)],
  "fathers-day": [WHO_FATHER, ...GRATITUDE.slice(1)],

  // The one FESTIVAL template that isn't wide-audience: Karwa Chauth is
  // always for a spouse, so it keeps the closer, partner-flavoured WHO
  // instead of the neutral one the rest of the category uses.
  "karwa-chauth": [WHO, ...FESTIVAL.slice(1)],

  // The AI writes into this template's `reasons` field, which is a list, not
  // a paragraph — so the questions have to collect list material. Asking "ek
  // pal batao" here would produce one lovely paragraph in a box built for
  // fifteen short lines.
  "reasons-i-love-you": [
    WHO,
    {
      id: "everyday",
      prompt: "Roz ki kaunsi cheez hai jo tumhe achhi lagti hai?",
      hint: "Chhoti, bekaar si aadat — wohi sabse acchi line banti hai",
      placeholder: "Chai peene se pehle hamesha phoonk maarti hai",
      facet: "Small everyday habits the sender loves",
    },
    {
      id: "annoying",
      prompt: "Kaunsi cheez irritating hai, par tum miss karoge?",
      hint: "Yeh list ko sach banati hai",
      placeholder: "Har movie ka ending pehle hi bata deti hai",
      facet: "An annoying habit the sender secretly loves",
    },
    {
      id: "proud",
      prompt: "Inki kaunsi baat pe tumhe garv hota hai?",
      hint: "Jo tum doosron ko batate ho",
      placeholder: "Kisi ko bhi akela nahi chhodti, chahe kuch bhi ho",
      facet: "What the sender is proud of about them",
    },
    {
      id: "oneline",
      prompt: "Aakhri line kya honi chahiye?",
      hint: "Jo list ko band kare",
      placeholder: "Aur sau aur, jo maine likhi hi nahi",
      facet: "The line that should close the list",
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
  festival: FESTIVAL,
  friendship: FRIENDSHIP,
  gratitude: GRATITUDE,
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
