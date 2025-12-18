import type { NextApiRequest, NextApiResponse } from "next";
import { APP_URL } from "@/lib/framesConfig";

type FrameResponse = {
  image: string;
  buttons: { label: string; action?: "post" | "post_redirect" }[];
  postUrl?: string;
  text?: string;
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const response: FrameResponse = {
    image: `${APP_URL}/co.lab-start.jpg`,
    text: "You're ready to start a Collab session from Farcaster.",
    buttons: [
      {
        label: "Open Collabs",
        action: "post_redirect",
      },
    ],
    postUrl: `${APP_URL}/collabs`,
  };

  res.status(200).json(response);
}


