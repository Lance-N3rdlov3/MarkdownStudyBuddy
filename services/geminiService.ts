
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getPrompt = (topic: string): string => {
  const today = new Date().toISOString().split('T')[0];
  return `
You are an expert researcher and educational content creator specializing in creating comprehensive, structured study guides in Obsidian-flavored Markdown.

Your task is to perform deep research on the following topic/URL and generate a detailed study guide. The guide should be structured for progressive learning, starting with fundamentals and moving to advanced concepts.

Topic/URL: "${topic}"

The output MUST be a single, complete block of Obsidian-flavored Markdown text.

Follow these instructions precisely:

1.  **YAML Front Matter:** Begin the document with a YAML front matter block enclosed in \`---\`. This block MUST include the following keys:
    *   \`title\`: A concise and descriptive title for the study guide.
    *   \`tags\`: A YAML array of at least 5 relevant keywords (e.g., \`[keyword1, keyword2, keyword3]\`).
    *   \`Area of study\`: The primary academic or professional field this topic belongs to.
    *   \`file_creation_date\`: Use this date: ${today}.
    *   \`level of complexity\`: An estimation (e.g., Beginner, Intermediate, Advanced, Expert).
    *   \`related areas or topics\`: A YAML array of subjects or skills that are related to the main topic.

2.  **Table of Contents:** Immediately after the front matter, create a section titled \`## Table of Contents\`. This section should contain a bulleted list of Markdown links that point to the main \`##\` headers within the study guide. For example: \`- [Introduction](#introduction)\`. Ensure the link slugs match the generated headers precisely (lowercase, dashes for spaces).

3.  **Main Content:** Structure the body of the guide using clear headers (\`##\`, \`###\`, etc.). Organize the content logically to facilitate learning, starting with an introduction and foundational concepts, and then progressing to more complex material. Use Markdown formatting like bold, italics, lists, and blockquotes to enhance readability.

4.  **Project-Based Learning (Conditional):** If the provided topic is a practical, learnable skill (like a programming language, a design methodology, a craft, etc.), you MUST include a major section titled \`## Project-Based Learning Paths\`.
    *   This section must outline at least three distinct projects.
    *   For each project, provide a title, a brief description, and a step-by-step guide or walkthrough.
    *   If coding is involved, include well-commented code blocks and snippets using the correct language identifier (e.g., \`\`\`javascript ... \`\`\` \`).

5.  **Citations:** Conclude the entire guide with a section titled \`## Citations and Further Reading\`. This section should list key resources, articles, and documents that a learner can use for deeper study. Use information from your grounding search to populate this.

Adhere strictly to Obsidian-flavored Markdown syntax.
`;
};

export const generateStudyGuide = async (topic: string): Promise<{ guide: string; sources: any[] }> => {
  try {
    const prompt = getPrompt(topic);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const guide = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    if (!guide) {
      throw new Error("Received an empty response from the API.");
    }
    
    return { guide, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate study guide from the Gemini API.");
  }
};
