
import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// List of free/performant models to rotate through
const MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "moonshotai/kimi-k2-instruct-0905",
  "qwen/qwen3-32b",
  "groq/compound",
  "llama-3.3-70b-versatile",
];

export async function POST(req: Request) {
  try {
    const { prompt, fieldType, templateName, templateDescription, tone } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Select a random model
    const selectedModel = MODELS[Math.floor(Math.random() * MODELS.length)];
    
    // Construct a specialized system prompt
    const systemPrompt = `You are an expert creative writer and poet for 'LetterLove'.
    
    Context:
    - User is writing a: "${templateName || "Letter"}"
    - Occasion/Theme: "${templateDescription || "General"}"
    - Field being edited: "${fieldType}"
    - Desired Tone: "${tone || "Sincere, warm, and emotional"}"
    
    Guidelines:
    1. Enhance the user's rough draft to fit the "${templateName}" theme perfecty.
    2. Keep it concise (under 60 words) unless the user wrote a long draft.
    3. Use evocative, sensory language but avoid clichés words, don't use "—" em dash and other special characters, you can use relevent emojis.
    4. Return ONLY the enhanced text. No "Here is the improved version:" prefixes.`;

    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is my rough draft/idea: "${prompt}". Please improve it.` },
      ],
      model: selectedModel,
      temperature: 0.7,
      max_tokens: 200,
    });

    const enhancedText = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ 
      text: enhancedText.trim(),
      model: selectedModel 
    });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
