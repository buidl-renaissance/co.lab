# Features

This document describes the core features and functionality of Co.Lab.

## Core Features

### 1. Voice-First Collaboration

Co.Lab enables teams to capture conversations naturally through voice recording:

- **Audio Recording**: Browser-based audio capture
- **Transcription**: Automatic speech-to-text via OpenAI Whisper
- **Multi-Transcript Support**: Add multiple recordings to a single collaboration

### 2. AI-Powered Analysis

Transcripts are automatically analyzed to extract structured information:

- **Title & Description**: Meaningful project names and summaries
- **Participants**: Identified collaborators from conversation context
- **Tasks & Timeline**: Extracted action items and deadlines
- **Event Details**: For event templates, extracts date, time, location, and tags

### 3. Template System

Pre-built templates guide collaboration structure:

| Template | Use Case | Key Questions |
|----------|----------|---------------|
| **Event** | Conferences, meetups | Name, date, location, attendees, resources |
| **Artwork** | Collaborative art | Type, materials, contributors, timeline, display |
| **Contest** | Raffles, competitions | Type, prizes, judging, eligibility |
| **Fundraise** | Campaigns, drives | Cause, goal, methods, recognition |
| **Workshop** | Training, education | Topic, audience, objectives, materials |
| **Web Product** | Software development | Name, problem, users, features, tech stack |

### 4. Event Management

For event-type collaborations:

- **Event Details**: Title, date, time, timezone, location, tags
- **Flyer Generation**: AI-generated promotional flyers via DALL-E 3
- **Event Publishing**: Publish to external events platform
- **Sponsor Management**: Track event sponsors with logos
- **Sub-Events**: Manage activities within a larger event

### 5. Farcaster Integration

Native integration with the Farcaster social protocol:

- **Mini App**: Launch Co.Lab directly from Farcaster
- **Frame Support**: Interactive frames for engagement
- **Authentication**: Sign-In With Farcaster (SIWF) and Quick Auth
- **User Profiles**: Farcaster username, display name, and profile picture

### 6. MCP API for AI Agents

Model Context Protocol endpoint enables AI agent integration:

- **List Tools**: Discover available collaboration tools
- **Call Tools**: Invoke tools programmatically
- **Supported Tools**:
  - `listCollaborations` - Get all collaborations
  - `getCollaboration` - Get specific collaboration by ID
  - `createCollaborationFromTranscript` - Create from transcript and template

### 7. GitHub Integration

Connect collaborations to GitHub repositories:

- **OAuth Authentication**: Secure GitHub login
- **Repository Linking**: Associate repos with projects
- **Issue Tracking**: Link GitHub issues to collaborations
- **PR Tracking**: Monitor pull request status

## User Flows

### Creating a New Collaboration

1. Select a template from the dashboard
2. Record or type a transcript describing the collaboration
3. AI analyzes and structures the input
4. Review and edit the generated plan
5. Invite participants and track progress

### Adding to an Existing Collaboration

1. Open an existing collaboration
2. Add a new transcript (voice or text)
3. AI merges new information with existing data
4. Updated analysis preserves prior context

### Publishing an Event

1. Create an event-type collaboration
2. Fill in event details (title, date, location)
3. Generate a promotional flyer
4. Review and publish to external platform
5. Track the published event ID and timestamp

## Collaboration States

| Status | Description |
|--------|-------------|
| `active` | Currently in progress |
| `completed` | Finished successfully |
| `archived` | Stored but inactive |
