
import { GoogleGenAI, Type } from "@google/genai";
import { Slide, SlideLayout } from "../types";

const outlineSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "A concise, engaging title for the slide."
            },
            content: {
                type: Type.ARRAY,
                description: "An array of strings, where each string is a key bullet point. For a TITLE_SLIDE, this can be a subtitle. For a SECTION_HEADER, it can be a short description. For a BLANK slide, it should be an empty array.",
                items: {
                    type: Type.STRING
                }
            },
            layout: {
                type: Type.STRING,
                enum: ["TITLE_SLIDE", "TITLE_CONTENT", "SECTION_HEADER", "TWO_COLUMN", "BLANK"],
                description: "The suggested layout for the slide based on its content."
            }
        },
        required: ["title", "content", "layout"]
    }
};

export const generateOutlineFromText = async (apiKey: string, documentText: string): Promise<Slide[]> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `You are an expert presentation creator. Analyze the following document and generate a structured presentation outline in JSON format. The outline should consist of a series of slides.

    For each slide, provide:
    1. A concise 'title'.
    2. A 'content' array of strings (bullet points).
    3. A suggested 'layout' from the available options.

    Layout instructions:
    - Use "TITLE_SLIDE" for the very first slide, with the main title of the presentation and a subtitle in the content array.
    - Use "TITLE_CONTENT" for standard content slides with a title and bullet points.
    - Use "SECTION_HEADER" for slides that introduce a new major topic. The title should be the topic name, and the content can have a short descriptive subtitle.
    - Use "TWO_COLUMN" for slides that compare items or have two related sets of bullet points. Try to provide an even number of bullet points for this layout.
    - Use "BLANK" sparingly for slides that might contain just a single, powerful image or quote (you can put the quote in the title).

    Extract the most important information, focusing on headings, key concepts, data, and conclusions. Create a logical flow.

    Document Text:
    ---
    ${documentText}
    ---
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: outlineSchema,
        },
    });

    const jsonText = response.text;
    const slidesData = JSON.parse(jsonText);
    
    if (!Array.isArray(slidesData)) {
      throw new Error("AI returned an invalid format. Expected an array of slides.");
    }

    return slidesData.map((slide: any, index: number) => ({
      id: `slide-${index}-${Date.now()}`,
      title: slide.title || "Untitled Slide",
      content: slide.content || [],
      layout: (slide.layout as SlideLayout) || "TITLE_CONTENT",
    }));

  } catch (error) {
    console.error("Error generating outline:", error);
    throw new Error("Failed to generate presentation outline. The AI model might be busy or an error occurred.");
  }
};

export const refineText = async (apiKey: string, textToRefine: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const prompt = `You are an expert copywriter specializing in presentations. Your task is to refine the following text to be more clear, concise, and impactful for a presentation slide. You can summarize it, rephrase it for clarity, or fix grammar. Return only the refined text, without any preamble.

        Original Text:
        ---
        ${textToRefine}
        ---

        Refined Text:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text.trim();
    } catch(error) {
        console.error("Error refining text:", error);
        throw new Error("Failed to refine text. The AI model might be busy or an error occurred.");
    }
}
