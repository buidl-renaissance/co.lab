import { OpenAI } from "openai";
import { Template } from "@/data/template";
import { EventDetails } from "@/data/collaboration";

export type AnalysisResponse = {
  title: string;
  description: string;
  participants: string[];
  answers: { question: string; answer: string }[];
  actions: { action: string; description: string; completed: boolean }[];
  summary: string;
  features?: string[]; // Added optional features array for product templates
  eventDetails?: EventDetails; // Added for event templates
};

// Questions to filter from Key Insights for event templates (displayed in EventCard instead)
export const EVENT_CARD_QUESTIONS = [
  "What is the name of your event?",
  "When will the event take place?",
  "What is the location of your event?",
];

// Lazy-initialize OpenAI client to avoid errors at module load time
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

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
    const lastTranscript = transcripts[transcripts.length - 1];
    const otherTranscripts = transcripts.slice(0, transcripts.length - 1);

    const transcriptPrompt =
      transcripts.length > 1
        ? `
      Previous Transcripts:
      ${otherTranscripts.join("\n")}

      Update the analysis with the latest transcript, including the title, description, participants, answers to the questions, action items and summary:
      ${lastTranscript}

      Be sure to look for completed action items, and mark them as such. Look out for the word "done" or "completed" to mark an action as completed. Also, look out for the word "next" to mark an action as a next step.

      The current analysis, JSON format: ${JSON.stringify(analysis)}
    `
        : `
      Transcript:
      ${lastTranscript}
    `;

    // Create a prompt for the AI to analyze the transcript
    const prompt = `
      You are an AI assistant helping to analyze a conversation transcript for a ${
        template.name
      } collaboration.
      
      Please extract the following information from the transcript:

      Title of the collaboration based on the transcript and template: ${
        template.name
      }, ${template.description}

      A short description of the collaboration.
      
      1. Key participants mentioned in the conversation
      2. Answers to these specific questions related to ${template.description}:
      ${
        template.questions
          ?.map((q: string, i: number) => `   ${i + 1}. ${q}`)
          .join("\n") || ""
      }

      A list of action items (or next steps), and a summary of the conversation.
      ${
        template.name.toLowerCase().includes("product")
          ? "Also extract a list of product features mentioned in the conversation."
          : ""
      }
      ${
        template.id === "event"
          ? `
      For this event, also extract structured event details:
      - eventTitle: The name/title of the event
      - date: The date of the event (format: YYYY-MM-DD if possible)
      - time: The start time of the event (format: HH:MM or descriptive like "6:00 PM")
      - endTime: The end time of the event if mentioned (format: HH:MM or descriptive like "11:00 PM")
      - location: The venue or location of the event
      - tags: Array of relevant tags for the event (e.g., ["tech", "conference", "networking"])
      - eventType: Set to "renaissance" if the event has sponsors, multiple sessions/activities, or is a conference/multi-day event. Otherwise "standard".
      - metadata: Any additional info like price, capacity, dress code as key-value pairs
      
      For renaissance events (conferences, festivals, multi-session events), also extract:
      - sponsors: Array of sponsors with name, and optionally websiteUrl
      - activities: Array of sub-events/sessions with name, description, startTime, endTime, location, and optionally capacity
      `
          : ""
      }
      
      ${transcriptPrompt}
    `;

    console.log("Prompt:", prompt);

    // Call OpenAI API with parse method
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `
You are a helpful assistant that analyzes conversation transcripts to help a user organize their collaboration. 
You will be given a transcript of a conversation and a template for the collaboration.
You will need to extract the information from the transcript and return it in a structured format. 
`,
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
                  items: { type: "string" },
                },
                answers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                    },
                    required: ["question", "answer"],
                  },
                },
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      description: { type: "string" },
                      completed: { type: "boolean" },
                    },
                    required: ["action", "description", "completed"],
                  },
                },
                features: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "List of product features mentioned in the conversation (for product templates only)",
                },
                eventDetails: {
                  type: "object",
                  properties: {
                    eventTitle: { type: "string", description: "The name/title of the event" },
                    date: { type: "string", description: "The date of the event (YYYY-MM-DD format preferred)" },
                    time: { type: "string", description: "The start time of the event" },
                    endTime: { type: "string", description: "The end time of the event" },
                    location: { type: "string", description: "The venue or location of the event" },
                    tags: { 
                      type: "array", 
                      items: { type: "string" },
                      description: "Relevant tags for the event" 
                    },
                    eventType: { 
                      type: "string", 
                      enum: ["standard", "renaissance"],
                      description: "Set to 'renaissance' for events with sponsors, multiple sessions, or conferences"
                    },
                    metadata: {
                      type: "object",
                      description: "Additional event info like price, capacity, dress code"
                    },
                    sponsors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Sponsor name" },
                          websiteUrl: { type: "string", description: "Sponsor website URL" }
                        },
                        required: ["name"]
                      },
                      description: "Event sponsors (for renaissance events)"
                    },
                    activities: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Activity/session name" },
                          description: { type: "string", description: "Activity description" },
                          startTime: { type: "string", description: "Start time (ISO format preferred)" },
                          endTime: { type: "string", description: "End time (ISO format preferred)" },
                          location: { type: "string", description: "Activity location/room" },
                          capacity: { type: "number", description: "Max attendees (omit for unlimited)" }
                        },
                        required: ["name"]
                      },
                      description: "Sub-events/sessions/activities (for renaissance events)"
                    }
                  },
                  required: ["eventTitle", "date", "time", "location"],
                  description: "Structured event details (for event templates only)",
                },
                summary: { type: "string" },
              },
              required: [
                "title",
                "description",
                "participants",
                "answers",
                "actions",
                "summary",
              ],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "analyzeTranscript" },
      },
    });

    const result =
      completion.choices[0].message.tool_calls?.[0]?.function?.arguments;
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
      features: [],
      eventDetails: undefined,
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
