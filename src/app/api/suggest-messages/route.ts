import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API Key missing" }, { status: 500 });
    }

    // --- CHANGE: Use a supported 2026 model name ---
    // 'gemini-2.5-flash' is the stable current version
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = "Create 3 short, engaging anonymous questions for a social media profile. Separate them with '||'. Do not include numbers or extra text.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Empty AI response");

    return NextResponse.json({ 
        success: true, 
        questions: text.trim() 
    });

  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // If you still get a 404, the model name might have just changed again.
    // Use this to help debug:
    return NextResponse.json(
      { success: false, error: "Model version mismatch or service busy." },
      { status: 500 }
    );
  }
}