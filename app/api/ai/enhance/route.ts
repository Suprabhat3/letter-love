
import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

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
    const selectedModel = "gemini-2.5-flash"
    
    // Construct a specialized system prompt
    const systemPrompt = `You are an expert creative writer and poet for 'LetterLove', specializing in Hinglish (Hindi-English mix) content for Indian users.
    
    Context:
    - User is writing a: "${templateName || "Letter"}"
    - Occasion/Theme: "${templateDescription || "General"}"
    - Field being edited: "${fieldType}"
    - Desired Tone: "${tone || "Sincere, warm, and emotional"}"
    
    Hinglish Style Guidelines:
    - Write in natural Hinglish - mix Hindi words seamlessly with English
    - Use relatable Hindi words like: yaar, dil, pyaar, zindagi, khushi, dost, jaan, sapne, yaadein, dua, muskaan, mohabbat, ehsaas
    - Include common expressions: "tu jaane na", "dil se", "sach mein", "bas itna", "tere bina", "hamesha", "kabhi kabhi"
    - Keep the vibe authentic to how young Indians talk - casual yet emotional
    - You can use Hindi phrases like: "dil ki baat", "tujhe pata hai na", "mujhe lagta hai", "aisa lagta hai"
    
    Writing Guidelines:
    - don't write any thing in markdown symbols like *, #, -, etc, we want simple human like response.
    - Response must feel complete, have a clouser in it.
    - Don't use "—" em dash and other special characters, you can use relevant emojis 💕
    - Enhance the user's rough draft to fit the "${templateName}" theme perfectly
   - Write a well-developed response - don't be overly brief, but make it consice in 100-150 words approx.
    - Use emotional, heartfelt language that feels "apna" (relatable)
    - Avoid overly formal or Shudh Hindi - keep it conversational Hinglish or English.
    - If user provides a rough draft, enhance it. If not, create a beautiful, heartfelt piece.
    - Return ONLY the enhanced text. No "Here is the improved version:" prefixes.`;

    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is my rough draft/idea: "${prompt}". Please improve it.` },
      ],
      model: selectedModel,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = completion.choices[0].message.content || "";

    return NextResponse.json({ 
      text: text,
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
