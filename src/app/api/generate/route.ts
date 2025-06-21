import { NextResponse } from "next/server";
import OpenAI from "openai";

type ColorCount = "monochrome" | "2-4" | "5-7";

interface GenerateRequest {
  projectDescription: string;
  colorVibe: string;
  colorCount: ColorCount;
}

function buildPrompt(input: GenerateRequest): string {
  const colorDescription = {
    monochrome: "in a single consistent color palette",
    "2-4": "using 2 to 4 complementary colors",
    "5-7": "with a bold mix of 5 to 7 different colors",
  }[input.colorCount];

  return `A highly detailed image of a handmade crochet project. The project is described as: ${input.projectDescription}. The overall color vibe is: ${input.colorVibe}. Please visualize the crochet item ${colorDescription}, with realistic yarn textures such as cotton, chenille, or wool. The background should be minimal, studio-lit, and clean.`;
}

async function generateImages(prompt: string): Promise<string[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 3,
      size: "1024x1024",
    });

    if (!response.data) {
      throw new Error("No images generated");
    }

    // Convert all base64 images to data URLs
    return response.data.map((img) => {
      if (!img.b64_json) {
        throw new Error("Missing base64 data in image response");
      }
      return `data:image/png;base64,${img.b64_json}`;
    });
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error("Failed to generate images");
  }
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();

    // Validate required fields
    if (!body.projectDescription || !body.colorVibe || !body.colorCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(body);
    console.log(prompt);
    const images = await generateImages(prompt);

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
