import { Template } from "@/data/template";
import { AnalysisResponse } from "@/lib/analyze";

// Event-specific details for event collaborations
export interface EventDetails {
  eventTitle: string;
  date: string;        // e.g., "2024-07-15"
  time: string;        // e.g., "6:00 PM"
  endTime?: string;    // e.g., "11:00 PM"
  location: string;
  flyerUrl?: string;   // DigitalOcean Spaces URL
  tags?: string[];     // Event tags
  eventType?: 'standard' | 'renaissance';
  metadata?: Record<string, unknown>;
  // External events API fields
  externalEventId?: number;  // ID from external events API
  publishedAt?: string;      // When event was published
}

export interface Collaboration {
  id: string;
  title: string;
  description: string;
  template: Template;
  createdAt: Date | string;
  updatedAt: Date | string;
  answers: { [key: string]: string };
  participants: string[];
  status: "active" | "completed" | "archived";
  analysis?: AnalysisResponse;
  transcripts?: string[];
  summary?: string;
  eventDetails?: EventDetails;
}

// Mock data for collaborations
export const mockCollaborations: Collaboration[] = [
  {
    id: "collab-1",
    title: "Summer Music Festival Planning",
    description:
      "Organizing our annual summer music festival with local artists and vendors.",
    template: {
      id: "event",
      name: "Event Planning",
      tag: "EVENT",
      description:
        "Organize events with clear tasks, timelines, and responsibilities.",
      icon: "🎪",
    },
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2023-11-20"),
    answers: {
      question_0: "Summer Vibes Music Festival",
      question_1: "July 15-17, 2024",
      question_2: "Riverside Park",
      question_3: "Approximately 2,000 attendees",
      question_4:
        "Showcase local musical talent and create community engagement",
      question_5:
        "Stage equipment, sound system, vendor tents, portable restrooms",
    },
    participants: [
      "user1@example.com",
      "user2@example.com",
      "user3@example.com",
    ],
    status: "active",
  },
  {
    id: "collab-2",
    title: "Community Mural Project",
    description:
      "Creating a collaborative mural to beautify the downtown area.",
    template: {
      id: "artwork",
      name: "Collaborative Artwork",
      tag: "ART",
      description:
        "Coordinate artistic collaborations with multiple contributors.",
      icon: "🎨",
    },
    createdAt: new Date("2023-10-05"),
    updatedAt: new Date("2023-11-10"),
    answers: {
      question_0: "Downtown Unity Mural",
      question_1: "Acrylic paints, brushes, scaffolding, protective coatings",
      question_2: "12 local artists plus community volunteers",
      question_3: "Design phase: 2 weeks, Painting: 4 weekends",
      question_4: "East wall of the Community Center",
      question_5:
        "Theme is 'Unity in Diversity' - artists should incorporate elements representing local cultures",
    },
    participants: [
      "user2@example.com",
      "user4@example.com",
      "user5@example.com",
    ],
    status: "active",
  },
  {
    id: "collab-3",
    title: "Charity 5K Run",
    description: "Annual fundraising run to support local children's hospital.",
    template: {
      id: "fundraise",
      name: "Fundraising Campaign",
      tag: "FUNDRAISE",
      description:
        "Organize fundraising efforts with goals and donor management.",
      icon: "💰",
    },
    createdAt: new Date("2023-09-20"),
    updatedAt: new Date("2023-11-05"),
    answers: {
      question_0: "Children's Hospital Foundation",
      question_1: "$50,000",
      question_2: "Online donations, registration fees, corporate sponsorships",
      question_3: "3 months of promotion, event on April 22, 2024",
      question_4:
        "Tiered recognition on event t-shirts, website, and social media",
      question_5:
        "Email newsletter, social media, local press, community bulletin boards",
    },
    participants: [
      "user1@example.com",
      "user3@example.com",
      "user6@example.com",
    ],
    status: "completed",
  },
];

// Function to get a collaboration by ID
export const getCollaborationById = (id: string): Collaboration | undefined => {
  return mockCollaborations.find((collab) => collab.id === id);
};

// Function to get all collaborations
export const getAllCollaborations = (): Collaboration[] => {
  return mockCollaborations;
};

// Function to get collaborations by status
export const getCollaborationsByStatus = (
  status: Collaboration["status"]
): Collaboration[] => {
  return mockCollaborations.filter((collab) => collab.status === status);
};
