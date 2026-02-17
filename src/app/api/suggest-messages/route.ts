// Use the new SDK import
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY as string;
const ai = new GoogleGenAI({ apiKey });

export async function POST(request: Request) {
  try {
    const prompt = "Create a list of three open-ended... (your prompt)";

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // --- THE FIX ---
    // Instead of response.text(), access the content part directly:
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Safety check: If Gemini didn't return text, throw an error
    if (!text) {
        throw new Error("AI returned an empty response");
    }

    const cleanText = text.replace(/```/g, "").trim();

    return NextResponse.json({ success: true, questions: cleanText });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini Integration Error:", errorMessage);
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI response." },
      { status: 500 }
    );
  }
}