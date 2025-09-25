
import { GoogleGenAI, Type } from "@google/genai";
import { Slide, SlideLayout, AiConfig } from "../types";

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

const generateGeminiOutline = async (apiKey: string, model: string, documentText: string, language: 'EN' | 'ZH_TW'): Promise<Slide[]> => {
  const ai = new GoogleGenAI({ apiKey });

  try {
    const outputLanguage = language === 'EN' ? 'English' : 'Traditional Chinese (繁體中文)';
    const prompt = `You are an expert presentation creator. Analyze the following document and generate a structured presentation outline in JSON format. The output content (titles and bullet points) MUST be in ${outputLanguage}.

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
        model: model,
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
    console.error("Error generating outline with Gemini:", error);
    throw new Error("Failed to generate presentation outline. The AI model might be busy or an error occurred.");
  }
};

const refineGeminiText = async (apiKey: string, model: string, textToRefine: string, onChunk?: (text: string) => void): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });

    try {
        const prompt = `You are an expert copywriter specializing in presentations. Your task is to refine the following text to be more clear, concise, and impactful for a presentation slide. You can summarize it, rephrase it for clarity, or fix grammar. It is crucial that you respond in the same language as the original text. Return only the refined text, without any preamble.

        Original Text:
        ---
        ${textToRefine}
        ---

        Refined Text:`;

        if (onChunk) {
            const responseStream = await ai.models.generateContentStream({
                model,
                contents: prompt,
            });
            let accumulatedText = "";
            for await (const chunk of responseStream) {
                accumulatedText += chunk.text;
                onChunk(accumulatedText);
            }
            return accumulatedText.trim();
        } else {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            return response.text.trim();
        }
    } catch(error) {
        console.error("Error refining text with Gemini:", error);
        throw new Error("Failed to refine text. The AI model might be busy or an error occurred.");
    }
};

const generateGeminiImage = async (apiKey: string, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }

        throw new Error("AI did not return an image. The response may have been blocked due to safety policies.");

    } catch(error) {
        console.error("Error generating image with Gemini:", error);
        let userMessage = "Failed to generate image. The model might be busy or an error occurred.";
        if (error instanceof Error && error.message) {
            if (error.message.includes('SAFETY')) {
                userMessage = "Image generation failed due to safety policies. Please adjust your prompt.";
            } else {
                userMessage = `Image generation failed: ${error.message}`;
            }
        }
        throw new Error(userMessage);
    }
};


// --- Main Service Dispatcher Functions ---

export const generateOutlineFromText = async (aiConfig: AiConfig, documentText: string, language: 'EN' | 'ZH_TW'): Promise<Slide[]> => {
  if (!aiConfig.apiKey) {
      throw new Error(`API Key for ${aiConfig.provider} is missing.`);
  }

  switch (aiConfig.provider) {
    case 'gemini':
      return generateGeminiOutline(aiConfig.apiKey, aiConfig.model, documentText, language);
    case 'openai':
    case 'anthropic':
    case 'grok':
      throw new Error(`${aiConfig.provider} integration is not implemented yet.`);
    default:
      // This should not happen with proper typing, but as a fallback
      const exhaustiveCheck: never = aiConfig.provider;
      throw new Error(`Unsupported AI provider: ${exhaustiveCheck}`);
  }
};

export const refineText = async (aiConfig: AiConfig, textToRefine: string, onChunk?: (text: string) => void): Promise<string> => {
    if (!aiConfig.apiKey) {
        throw new Error(`API Key for ${aiConfig.provider} is missing.`);
    }

    switch (aiConfig.provider) {
        case 'gemini':
            return refineGeminiText(aiConfig.apiKey, aiConfig.model, textToRefine, onChunk);
        case 'openai':
        case 'anthropic':
        case 'grok':
            throw new Error(`${aiConfig.provider} integration is not implemented yet.`);
        default:
            const exhaustiveCheck: never = aiConfig.provider;
            throw new Error(`Unsupported AI provider: ${exhaustiveCheck}`);
    }
};

export const generateImage = async (aiConfig: AiConfig, prompt: string): Promise<string> => {
    if (!aiConfig.apiKey) {
        throw new Error(`API Key for ${aiConfig.provider} is missing.`);
    }

    switch (aiConfig.provider) {
        case 'gemini':
            return generateGeminiImage(aiConfig.apiKey, prompt);
        case 'openai':
        case 'anthropic':
        case 'grok':
            throw new Error(`${aiConfig.provider} integration is not implemented yet.`);
        default:
            const exhaustiveCheck: never = aiConfig.provider;
            throw new Error(`Unsupported AI provider: ${exhaustiveCheck}`);
    }
}
