# Co.Lab

Co.Lab is a voice-first project planning tool for creative teams. Transform freeform conversations into structured, actionable project plans.

## About

At Co.Lab, we believe that the best ideas come from natural conversations. Our mission is to bridge the gap between free-flowing discussions and structured project management, making it easier for teams to capture, organize, and act on their collaborative ideas.

## Features

- **Talk It Out**: Capture your collaborative conversations naturally, without interrupting your creative flow.
- **We Structure It**: Our AI automatically organizes your ideas into tasks, timelines, and action items.
- **You Build Together**: Share the structured plan, assign tasks, and track progress as a team.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/buidl-renaissance/co.lab.git
   cd co.lab
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Next.js pages and API routes
- `/src/data` - Data models and templates
- `/src/styles` - Global styles and theme configuration

## Contributing

We welcome contributions from the community! Please feel free to submit a Pull Request.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License - see the [LICENSE](LICENSE) file for details.

This means you are free to:
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

Under the following terms:
- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made.
- NonCommercial — You may not use the material for commercial purposes.

## MCP API

This app exposes a lightweight Model Context Protocol–style endpoint that lets AI agents list and call tools backed by the existing collaboration APIs.

- **Endpoint**: `POST /api/mcp`
- **Protocol**: JSON-RPC 2.0 with MCP-style methods:
  - `tools/list` — returns the available tools and their schemas.
  - `tools/call` — invokes a tool by name with structured arguments.

When the optional `MCP_API_KEY` environment variable is set, callers must include either:

- `Authorization: Bearer <MCP_API_KEY>` header, or
- `x-mcp-api-key: <MCP_API_KEY>` header.

The endpoint applies a simple in-memory rate limit per IP and logs each call (method, id, IP, and duration) as structured JSON to stdout.

To run a quick self-test of the MCP tooling from application code, you can call:

- `runMcpSelfTest()` from `src/lib/mcp/testHarness.ts`

## Contact

For questions or feedback, please contact us at john@builddetroit.xyz
