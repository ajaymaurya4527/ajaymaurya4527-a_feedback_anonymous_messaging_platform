import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Configuration - Keep these outside the handler to prevent re-initialization
const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    // 2. Define the prompt clearly
    const prompt = 
      "Create a list of three open-ended and engaging questions separated by '||'. " +
      "Focus on universal, friendly themes for an anonymous platform.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 3. Return a standard Response/NextResponse object
    return NextResponse.json({ success: true, questions: text });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini Integration Error:", errorMessage);
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI response." },
      { status: 500 }
    );
  }
}