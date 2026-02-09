
import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// List of free/performant models to rotate through
const MODELS = [
  "groq/compound",
  "groq/compound-mini",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "moonshotai/kimi-k2-instruct-0905",
  "qwen/qwen3-32b",
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
    - Don't use "—" em dash and other special characters, you can use relevent emojis.
    - Enhance the user's rough draft to fit the "${templateName}" theme perfecty.
    - Keep it concise (under 50 words) unless the user wrote a long draft.
    - Use evocative, sensory language but avoid clichés words.
    - Return ONLY the enhanced text. No "Here is the improved version:" prefixes.`;

    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is my rough draft/idea: "${prompt}". Please improve it.` },
      ],
      model: selectedModel,
      temperature: 0.7,
      max_tokens: 200,
    });

    let enhancedText = completion.choices[0]?.message?.content || "";
    
    // Strip any thinking/reasoning tags that might appear in the response
    enhancedText = enhancedText
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
      .replace(/\[REASONING\][\s\S]*?\[\/REASONING\]/gi, '')
      .replace(/\[THINK\][\s\S]*?\[\/THINK\]/gi, '')
      .trim();

    return NextResponse.json({ 
      text: enhancedText,
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
