import { Template } from "./types";

export const templates: Template[] = [
  // 💝 VALENTINE Category
  {
    id: "valentine-ask",
    name: "Be My Valentine?",
    description: "Ask the big question differently",
    category: "love",
    emoji: "💝",
    tags: ["Romantic", "Propose", "Valentine", "Crush", "Partner"],
    popularity: 5,
    estimatedTime: "2 min",
    previewText: "I've been wanting to ask you this for a while...",
    colors: {
      primary: "#e11d48",
      secondary: "#fecdd3",
      accent: "#be123c",
    },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Crush", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Secret Admirer", type: "text", required: true },
       { name: "reason", label: "Why them?", placeholder: "You make me smile every day...", type: "textarea", required: true },
    ],
  },

  // 💕 LOVE Category
  {
    id: "love-letter",
    name: "Love Letter",
    description: "Pour your heart out with a romantic letter",
    category: "love",
    emoji: "💌",
    tags: ["Romantic", "Classic", "Letter", "Partner", "Her", "Him"],
    popularity: 5,
    estimatedTime: "5 min",
    previewText: "My dearest, every moment with you feels like magic...",
    colors: {
      primary: "#ec4899",
      secondary: "#f9a8d4",
      accent: "#be185d",
    },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Forever Yours", type: "text", required: true },
      { name: "petName", label: "Pet Name", placeholder: "Sweetheart", type: "text", required: false },
      { name: "message", label: "Your Message", placeholder: "Write from your heart...", type: "textarea", required: true },
      { name: "memory", label: "Favorite Memory Together", placeholder: "That day when we...", type: "textarea", required: false },
    ],
  },
  {
    id: "anniversary",
    name: "Anniversary",
    description: "Celebrate your special milestone",
    category: "love",
    emoji: "💍",
    tags: ["Milestone", "Romantic", "Celebration", "Partner", "Spouse"],
    popularity: 4,
    estimatedTime: "3 min",
    previewText: "Another year of loving you has been the greatest gift...",
    colors: {
      primary: "#a855f7",
      secondary: "#e9d5ff",
      accent: "#7c3aed",
    },
    fields: [
      { name: "recipientName", label: "Partner's Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Love", type: "text", required: true },
      { name: "years", label: "Years Together", placeholder: "5", type: "text", required: false },
      { name: "message", label: "Anniversary Message", placeholder: "Celebrating our journey...", type: "textarea", required: true },
    ],
  },

  // 🎉 CELEBRATION Category
  {
    id: "birthday-wish",
    name: "Birthday Wish",
    description: "Make their birthday extra special",
    category: "celebration",
    emoji: "🎂",
    tags: ["Birthday", "Fun", "Friends", "Friend", "Family", "Partner"],
    popularity: 5,
    estimatedTime: "2 min",
    previewText: "Wishing you a day filled with love, laughter, and cake!",
    colors: {
      primary: "#f59e0b",
      secondary: "#fde68a",
      accent: "#d97706",
    },
    fields: [
      { name: "recipientName", label: "Birthday Person", placeholder: "Amazing Person", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Friend", type: "text", required: true },
      { name: "age", label: "Turning (optional)", placeholder: "25", type: "text", required: false },
      { name: "message", label: "Birthday Message", placeholder: "Wishing you the happiest birthday...", type: "textarea", required: true },
      { name: "wish", label: "Special Wish", placeholder: "May all your dreams come true!", type: "text", required: false },
    ],
  },

  // 😢 APOLOGY Category
  {
    id: "sorry-card",
    name: "I'm Sorry",
    description: "Apologize with sincerity and heart",
    category: "apology",
    emoji: "🥺",
    tags: ["Sincere", "Forgiveness", "Heartfelt", "Partner", "Friend"],
    popularity: 3,
    estimatedTime: "4 min",
    previewText: "I know I messed up, and I'm truly sorry...",
    colors: {
      primary: "#3b82f6",
      secondary: "#bfdbfe",
      accent: "#1d4ed8",
    },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Dear Friend", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Sincerely Sorry", type: "text", required: true },
      { name: "reason", label: "What happened", placeholder: "I'm sorry for...", type: "textarea", required: true },
      { name: "promise", label: "Your Promise", placeholder: "I promise to...", type: "textarea", required: false },
    ],
  },

  // 💭 LONGING Category
  {
    id: "miss-you",
    name: "Miss You",
    description: "Tell someone you're thinking of them",
    category: "longing",
    emoji: "💭",
    tags: ["Distance", "Love", "Thinking of You", "Partner", "Family"],
    popularity: 4,
    estimatedTime: "3 min",
    previewText: "Distance means nothing when someone means everything...",
    colors: {
      primary: "#06b6d4",
      secondary: "#a5f3fc",
      accent: "#0891b2",
    },
    fields: [
      { name: "recipientName", label: "Who You Miss", placeholder: "My Dear", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Missing You", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "I think about you every day...", type: "textarea", required: true },
      { name: "memory", label: "A Memory", placeholder: "I keep thinking about when we...", type: "textarea", required: false },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🪔 FESTIVAL Category
  //
  // The highest-volume moments for this audience, and the only ones that come
  // back every single year. Field names are kept deliberately boring and
  // shared (`message`, `memory`, `wish`) so the default theme renders a new
  // template correctly even before it has a bespoke one.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "diwali",
    name: "Diwali Wishes",
    description: "Light up their day with a Diwali note",
    category: "festival",
    emoji: "🪔",
    tags: ["Diwali", "Festival", "Family", "Friend", "Friends", "Partner"],
    popularity: 5,
    estimatedTime: "2 min",
    previewText: "May this Diwali fill your home with light, laughter and mithai.",
    colors: { primary: "#f59e0b", secondary: "#fde68a", accent: "#b45309" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Riya", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Diwali Message", placeholder: "Iss Diwali, tumhare liye...", type: "textarea", required: true },
      { name: "wish", label: "A Wish For Them", placeholder: "May every diya bring you one good year", type: "text", required: false },
    ],
  },
  {
    id: "rakhi",
    name: "Raksha Bandhan",
    description: "For the sibling who is also your safest place",
    category: "festival",
    emoji: "🪢",
    tags: ["Rakhi", "Festival", "Family", "Sibling", "Sister", "Brother"],
    popularity: 5,
    estimatedTime: "2 min",
    previewText: "Distance can't undo a thread this old.",
    colors: { primary: "#dc2626", secondary: "#fecaca", accent: "#991b1b" },
    fields: [
      { name: "recipientName", label: "Sibling's Name", placeholder: "Bhai / Didi", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "Har saal yeh dhaaga...", type: "textarea", required: true },
      { name: "promise", label: "Your Promise", placeholder: "I'll always pick up, whatever time it is", type: "textarea", required: false },
    ],
  },
  {
    id: "holi",
    name: "Holi Hai!",
    description: "Loud, messy, colourful wishes",
    category: "festival",
    emoji: "🎨",
    tags: ["Holi", "Festival", "Fun", "Friends", "Friend", "Family"],
    popularity: 4,
    estimatedTime: "2 min",
    previewText: "Bura na maano — Holi hai!",
    colors: { primary: "#db2777", secondary: "#fbcfe8", accent: "#7c3aed" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Rohit", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Holi Message", placeholder: "Iss baar rang chhodenge nahi...", type: "textarea", required: true },
      { name: "memory", label: "A Holi Memory", placeholder: "Woh saal jab tumne poora balti ulta diya tha", type: "textarea", required: false },
    ],
  },
  {
    id: "eid",
    name: "Eid Mubarak",
    description: "Warm wishes for Eid",
    category: "festival",
    emoji: "🌙",
    tags: ["Eid", "Festival", "Family", "Friend", "Friends"],
    popularity: 4,
    estimatedTime: "2 min",
    previewText: "Eid Mubarak — may this one be gentle and full.",
    colors: { primary: "#059669", secondary: "#a7f3d0", accent: "#047857" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Their Name", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Eid Message", placeholder: "Eid Mubarak. Iss saal...", type: "textarea", required: true },
      { name: "wish", label: "A Wish For Them", placeholder: "May your year be full of quiet good news", type: "text", required: false },
    ],
  },
  {
    id: "karwa-chauth",
    name: "Karwa Chauth",
    description: "For the one you fast and wait for",
    category: "festival",
    emoji: "🌕",
    tags: ["Karwa Chauth", "Festival", "Romantic", "Partner", "Spouse"],
    popularity: 4,
    estimatedTime: "3 min",
    previewText: "The moon took its time tonight. So did I.",
    colors: { primary: "#b91c1c", secondary: "#fecdd3", accent: "#7f1d1d" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "Chaand ka intezaar tumse aasaan hai...", type: "textarea", required: true },
      { name: "memory", label: "A Memory", placeholder: "Our first Karwa Chauth together...", type: "textarea", required: false },
    ],
  },
  {
    id: "new-year",
    name: "New Year Wish",
    description: "Start their year with your words",
    category: "festival",
    emoji: "🎆",
    tags: ["New Year", "Festival", "Friends", "Friend", "Family", "Partner"],
    popularity: 4,
    estimatedTime: "2 min",
    previewText: "Same me, same you, better year.",
    colors: { primary: "#6366f1", secondary: "#c7d2fe", accent: "#4338ca" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Their Name", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "years", label: "The Year", placeholder: "2027", type: "text", required: false },
      { name: "message", label: "Your Message", placeholder: "Iss saal tumhare liye...", type: "textarea", required: true },
      { name: "wish", label: "One Wish For Them", placeholder: "May this be the year it finally works out", type: "text", required: false },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🫂 FRIENDSHIP Category
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "best-friend",
    name: "Best Friend",
    description: "For the one who has seen you at your worst",
    category: "friendship",
    emoji: "🫂",
    tags: ["Friendship", "Best Friend", "Friend", "Friends", "Thank You"],
    popularity: 5,
    estimatedTime: "3 min",
    previewText: "You've seen the worst version of me and stayed. That's the whole thing.",
    colors: { primary: "#f97316", secondary: "#fed7aa", accent: "#c2410c" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Best Friend", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "years", label: "Years of Friendship", placeholder: "8", type: "text", required: false },
      { name: "message", label: "Your Message", placeholder: "Tumhe pata bhi nahi ki...", type: "textarea", required: true },
      { name: "memory", label: "A Memory", placeholder: "That night we walked home at 3am...", type: "textarea", required: false },
    ],
  },
  {
    id: "friendship-day",
    name: "Friendship Day",
    description: "The yearly excuse to actually say it",
    category: "friendship",
    emoji: "🤝",
    tags: ["Friendship", "Friend", "Friends", "Fun"],
    popularity: 3,
    estimatedTime: "2 min",
    previewText: "One day a year to say what I never say out loud.",
    colors: { primary: "#eab308", secondary: "#fef08a", accent: "#a16207" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Their Name", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "Yaar, seriously...", type: "textarea", required: true },
      { name: "memory", label: "A Memory", placeholder: "Remember when we...", type: "textarea", required: false },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🙏 GRATITUDE Category
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "thank-you",
    name: "Thank You",
    description: "Say it properly, not over text",
    category: "gratitude",
    emoji: "🙏",
    tags: ["Thank You", "Gratitude", "Friend", "Family", "Friends", "Partner"],
    popularity: 5,
    estimatedTime: "2 min",
    previewText: "You probably don't even remember doing it. I do.",
    colors: { primary: "#0d9488", secondary: "#ccfbf1", accent: "#0f766e" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Their Name", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Thank You", placeholder: "Thank you for...", type: "textarea", required: true },
      { name: "memory", label: "The Moment You Remember", placeholder: "That day you just showed up...", type: "textarea", required: false },
    ],
  },
  {
    id: "proud-of-you",
    name: "Proud of You",
    description: "Four words most people wait years to hear",
    category: "gratitude",
    emoji: "🌟",
    tags: ["Gratitude", "Proud", "Family", "Friend", "Friends", "Partner"],
    popularity: 4,
    estimatedTime: "2 min",
    previewText: "I've watched you do the hard version of this. I'm proud of you.",
    colors: { primary: "#7c3aed", secondary: "#ddd6fe", accent: "#5b21b6" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Their Name", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "achievement", label: "What They Did", placeholder: "Cleared her exam after two attempts", type: "text", required: false },
      { name: "message", label: "Your Message", placeholder: "Main tumhe shuru se dekh raha hoon...", type: "textarea", required: true },
      { name: "wish", label: "One Line For Them", placeholder: "Don't shrink this. You earned it.", type: "text", required: false },
    ],
  },
  {
    id: "teachers-day",
    name: "Teacher's Day",
    description: "For the teacher who changed something",
    category: "gratitude",
    emoji: "📚",
    tags: ["Teacher", "Gratitude", "Thank You", "School", "College"],
    popularity: 4,
    estimatedTime: "2 min",
    previewText: "You probably taught hundreds of us. I still think about one thing you said.",
    colors: { primary: "#1d4ed8", secondary: "#dbeafe", accent: "#1e3a8a" },
    fields: [
      { name: "recipientName", label: "Teacher's Name", placeholder: "Sharma Sir / Ma'am", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "subject", label: "Subject / Class", placeholder: "Class 10 Physics", type: "text", required: false },
      { name: "message", label: "Your Message", placeholder: "Aapne ek baat kahi thi jo...", type: "textarea", required: true },
      { name: "memory", label: "Something You Remember", placeholder: "The day you stayed back to explain it again", type: "textarea", required: false },
    ],
  },
  {
    id: "mothers-day",
    name: "For Maa",
    description: "The letter you keep meaning to write",
    category: "gratitude",
    emoji: "🌷",
    tags: ["Mother", "Gratitude", "Family", "Mother's Day", "Thank You"],
    popularity: 5,
    estimatedTime: "3 min",
    previewText: "You never asked for thanks. That's exactly why this exists.",
    colors: { primary: "#e11d48", secondary: "#ffe4e6", accent: "#9f1239" },
    fields: [
      { name: "recipientName", label: "What You Call Her", placeholder: "Maa", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "Maa, tumhe kabhi bola nahi...", type: "textarea", required: true },
      { name: "memory", label: "A Memory", placeholder: "Woh raat jab tum meri exam ke saath jaagi thi", type: "textarea", required: false },
    ],
  },
  {
    id: "fathers-day",
    name: "For Papa",
    description: "For the man who says less than he feels",
    category: "gratitude",
    emoji: "👔",
    tags: ["Father", "Gratitude", "Family", "Father's Day", "Thank You"],
    popularity: 4,
    estimatedTime: "3 min",
    previewText: "You never said much. I understood most of it anyway.",
    colors: { primary: "#0f766e", secondary: "#cbd5e1", accent: "#334155" },
    fields: [
      { name: "recipientName", label: "What You Call Him", placeholder: "Papa", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "Papa, aapne kabhi kaha nahi, par...", type: "textarea", required: true },
      { name: "memory", label: "A Memory", placeholder: "Scooter pe woh lambi wapsi...", type: "textarea", required: false },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🎉 CELEBRATION (more)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "congratulations",
    name: "Congratulations!",
    description: "Make the good news feel bigger",
    category: "celebration",
    emoji: "🎊",
    tags: ["Congrats", "Celebration", "Friend", "Friends", "Family", "Partner"],
    popularity: 4,
    estimatedTime: "2 min",
    previewText: "You did it. Everyone else is surprised. I'm not.",
    colors: { primary: "#16a34a", secondary: "#bbf7d0", accent: "#15803d" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Their Name", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Your Name", type: "text", required: true },
      { name: "achievement", label: "What They Achieved", placeholder: "New job at last!", type: "text", required: false },
      { name: "message", label: "Your Message", placeholder: "Yaar, tumne kar hi diya...", type: "textarea", required: true },
      { name: "wish", label: "A Wish", placeholder: "May this be the smallest thing you achieve", type: "text", required: false },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ✨ HIGH-EMOTION SPECIALS
  //
  // These exist to exercise the layout axis rather than the palette one — a
  // numbered list, a pack of sealed notes, a yes/no proposal. They are the
  // most screenshot-worthy things in the catalogue precisely because they do
  // not look like the other cards.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "reasons-i-love-you",
    name: "Reasons I Love You",
    description: "A numbered list they'll screenshot",
    category: "love",
    emoji: "❤️‍🔥",
    tags: ["Romantic", "List", "Partner", "Spouse", "Her", "Him"],
    popularity: 5,
    estimatedTime: "4 min",
    previewText: "1. The way you say my name when you're tired.",
    colors: { primary: "#e11d48", secondary: "#ffe4e6", accent: "#9f1239" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Yours", type: "text", required: true },
      {
        name: "reasons",
        label: "Your Reasons — one per line",
        placeholder:
          "The way you laugh at your own jokes\nHow you always order extra just in case\nThat you never make me explain twice",
        type: "textarea",
        required: true,
      },
      { name: "message", label: "One Line To Close With", placeholder: "And a hundred more I haven't written down.", type: "text", required: false },
    ],
  },
  {
    id: "open-when",
    name: "Open When…",
    description: "A pack of sealed notes for later",
    category: "love",
    emoji: "📩",
    tags: ["Romantic", "Distance", "Partner", "Spouse", "Friend"],
    popularity: 5,
    estimatedTime: "6 min",
    previewText: "Four sealed notes. Open the one you need.",
    colors: { primary: "#7c3aed", secondary: "#ede9fe", accent: "#5b21b6" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Yours", type: "text", required: true },
      { name: "whenSad", label: "Open when you're sad", placeholder: "Listen. This passes. And I'm right here...", type: "textarea", required: true },
      { name: "whenMissMe", label: "Open when you miss me", placeholder: "I'm missing you too, at exactly the same time...", type: "textarea", required: false },
      { name: "whenCantSleep", label: "Open when you can't sleep", placeholder: "Close your eyes. Let me tell you about the day we...", type: "textarea", required: false },
      { name: "whenNeedLaugh", label: "Open when you need a laugh", placeholder: "Remember when you...", type: "textarea", required: false },
    ],
  },
  {
    id: "proposal",
    name: "Will You Marry Me?",
    description: "The question, with nowhere to hide",
    category: "love",
    emoji: "💐",
    tags: ["Romantic", "Propose", "Partner", "Spouse", "Milestone"],
    popularity: 5,
    estimatedTime: "5 min",
    previewText: "I've thought about this every day for a year. Here goes.",
    colors: { primary: "#be123c", secondary: "#fecdd3", accent: "#881337" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Yours, always", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "Jab se tum mile ho...", type: "textarea", required: true },
      { name: "memory", label: "The Moment You Knew", placeholder: "That ordinary Tuesday when...", type: "textarea", required: false },
    ],
  },
  {
    id: "long-distance",
    name: "Long Distance",
    description: "Count down to the next hug",
    category: "longing",
    emoji: "✈️",
    tags: ["Distance", "Longing", "Partner", "Spouse", "Friend"],
    popularity: 4,
    estimatedTime: "3 min",
    previewText: "Some days it's fine. Today isn't one of them.",
    colors: { primary: "#0284c7", secondary: "#bae6fd", accent: "#075985" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "My Love", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Yours", type: "text", required: true },
      { name: "daysLeft", label: "Days Until You Meet", placeholder: "42", type: "text", required: false },
      { name: "message", label: "Your Message", placeholder: "Aaj thoda zyada mushkil hai...", type: "textarea", required: true },
      { name: "memory", label: "A Memory", placeholder: "The airport, last time...", type: "textarea", required: false },
    ],
  },
  {
    id: "crush-confession",
    name: "Finally Saying It",
    description: "The message you've drafted eleven times",
    category: "love",
    emoji: "🫣",
    tags: ["Crush", "Romantic", "Confession", "Her", "Him"],
    popularity: 4,
    estimatedTime: "3 min",
    previewText: "I've typed and deleted this so many times. Not this time.",
    colors: { primary: "#f43f5e", secondary: "#ffe4e6", accent: "#be123c" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "Their Name", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Me", type: "text", required: true },
      { name: "since", label: "Since When", placeholder: "Two semesters, honestly", type: "text", required: false },
      { name: "message", label: "What You Want To Say", placeholder: "Dekho, main ghuma ke nahi kahunga...", type: "textarea", required: true },
    ],
  },
  {
    id: "just-because",
    name: "Just Because",
    description: "No occasion. That's the point.",
    category: "love",
    emoji: "☀️",
    tags: ["Romantic", "Partner", "Spouse", "Friend", "Classic"],
    popularity: 4,
    estimatedTime: "2 min",
    previewText: "No birthday, no fight, no reason. Just thinking about you.",
    colors: { primary: "#f59e0b", secondary: "#fef3c7", accent: "#b45309" },
    fields: [
      { name: "recipientName", label: "Their Name", placeholder: "You", type: "text", required: true },
      { name: "senderName", label: "Your Name", placeholder: "Me", type: "text", required: true },
      { name: "message", label: "Your Message", placeholder: "Bas aise hi...", type: "textarea", required: true },
    ],
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  if (category === "all") return templates;
  return templates.filter((t) => t.category === category);
}
