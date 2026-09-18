import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt,
      apiKey: customApiKey,
      folderPath,
      aspectRatio = "1024x1024",
      city = "Central Mississippi",
      service = "Roofing",
    } = body;

    const apiKey = customApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API Key is required. Please provide your API key in the studio or in .env.local.",
        },
        { status: 401 }
      );
    }

    if (!prompt) {
      return NextResponse.json({ error: "Missing image prompt" }, { status: 400 });
    }

    // Call OpenAI DALL-E 3 API
    console.log("[OpenAI] Generating AI Image with prompt:", prompt);
    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: aspectRatio === "1024x1792" ? "1024x1792" : "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    });

    if (!openaiRes.ok) {
      const errData = await openaiRes.json();
      console.error("[OpenAI] Generation error:", errData);
      return NextResponse.json(
        { error: errData.error?.message || "Failed to generate image via OpenAI" },
        { status: openaiRes.status }
      );
    }

    const data = await openaiRes.json();
    const generatedUrl = data.data?.[0]?.url;
    const revisedPrompt = data.data?.[0]?.revised_prompt || prompt;

    if (!generatedUrl) {
      return NextResponse.json({ error: "No image URL returned from OpenAI" }, { status: 500 });
    }

    // Download generated image and save to disk
    let savedFilePath = null;
    try {
      const imgRes = await fetch(generatedUrl);
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const baseDir = folderPath || process.env.EXPORTS_DIR || path.join(process.cwd(), "exports");
        if (!fs.existsSync(baseDir)) {
          fs.mkdirSync(baseDir, { recursive: true });
        }
        const fileName = `chatgpt_ai_graphic_${Date.now()}.png`;
        savedFilePath = path.join(baseDir, fileName);
        fs.writeFileSync(savedFilePath, buffer);
      }
    } catch (saveErr) {
      console.warn("Could not save AI image to disk automatically:", saveErr);
    }

    return NextResponse.json({
      success: true,
      imageUrl: generatedUrl,
      revisedPrompt,
      savedFilePath,
    });
  } catch (error: any) {
    console.error("AI Image route exception:", error);
    return NextResponse.json({ error: error.message || "AI image generation failed" }, { status: 500 });
  }
}
