import { OpenAI } from "openai";
import { Template } from "@/data/template";

export type AnalysisResponse = {
  title: string;
  description: string;
  participants: string[];
  answers: { question: string; answer: string }[];
  actions: { action: string; description: string }[];
  summary: string;
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a transcript using OpenAI to extract relevant information based on a template
 * @param transcript The conversation transcript to analyze
 * @param template The template containing structure and prompts
 * @returns An object with extracted answers and suggested participants
 */
export async function analyzeTranscript(
  transcripts: string[],
  template: Template,
  analysis?: AnalysisResponse
): Promise<AnalysisResponse> {
  try {
    // Create a prompt for the AI to analyze the transcript
    const prompt = `
      You are an AI assistant helping to analyze a conversation transcript for a ${
        template.name
      } collaboration.
      
      Please extract the following information from the transcript:

      Title of the collaboration based on the transcript and template: ${
        template.name
      }

      A short description of the collaboration.
      
      1. Key participants mentioned in the conversation
      2. Answers to these specific questions related to ${template.description}:
      ${
        template.questions
          ?.map((q: string, i: number) => `   ${i + 1}. ${q}`)
          .join("\n") || ""
      }

      Current Analysis, JSON format:
      ${JSON.stringify(analysis)}
      
      Transcripts:
      ${transcripts.join("\n")}

      A list of action items based on the conversation.
      
      And a summary of the conversation.
    `;

    console.log("Prompt:", prompt);

    // Call OpenAI API with parse method
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that analyzes conversation transcripts.",
        },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyzeTranscript",
            description: "Analyzes a conversation transcript",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                participants: { 
                  type: "array", 
                  items: { type: "string" } 
                },
                answers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" }
                    },
                    required: ["question", "answer"]
                  }
                },
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      description: { type: "string" }
                    },
                    required: ["action", "description"]
                  }
                },
                summary: { type: "string" }
              },
              required: ["title", "description", "participants", "answers", "actions", "summary"]
            }
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "analyzeTranscript" } },
    });

    const result = completion.choices[0].message.tool_calls?.[0]?.function?.arguments;
    console.log("Completion:", completion);
    console.log("Result:", result);
    return JSON.parse(result as string) as AnalysisResponse;
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    return {
      title: "",
      description: "",
      answers: [],
      participants: [],
      actions: [],
      summary: "",
    };
  }
}

// /**
//  * Updates a collaboration with AI-analyzed information
//  * @param collaboration The collaboration to update
//  * @param transcript The conversation transcript
//  * @returns The updated collaboration
//  */
// export async function updateCollaborationWithAnalysis(
//   collaboration: Collaboration,
//   transcript: string
// ): Promise<Collaboration> {
//   const analysis = await analyzeTranscript(transcript, collaboration.template);

//   return {
//     ...collaboration,
//     answers: {
//       ...collaboration.answers,
//       ...analysis.answers,
//     },
//     participants: [
//       ...collaboration.participants,
//       ...analysis.participants.filter(
//         (p) => !collaboration.participants.includes(p)
//       ),
//     ],
//   };
// }
