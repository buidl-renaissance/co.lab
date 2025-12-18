import type { NextPage } from "next";
import Head from "next/head";
import { APP_URL } from "@/lib/framesConfig";

const FramesPage: NextPage = () => {
  const frameUrl = `${APP_URL}/frames`;

  return (
    <>
      <Head>
        <title>Collab Flow Farcaster Mini App</title>
        <meta
          name="description"
          content="Collab Flow Farcaster mini app for authenticated collaboration actions."
        />

        {/* Base Open Graph image used by the frame */}
        <meta property="og:title" content="Collab Flow" />
        <meta
          property="og:description"
          content="Start a collaborative session directly from Farcaster."
        />
        <meta
          property="og:image"
          content={`${APP_URL}/co.lab-thumb.jpg`}
        />
        <meta property="og:url" content={frameUrl} />

        {/* Farcaster frame v2 metadata */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${APP_URL}/co.lab-start.jpg`} />
        <meta property="fc:frame:button:1" content="Start a Collab" />
        <meta
          property="fc:frame:button:1:action"
          content="post"
        />
        <meta
          property="fc:frame:post_url"
          content={`${APP_URL}/api/frames/start`}
        />
      </Head>
      {/* Simple fallback content when opened in a browser */}
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "2rem",
        }}
      >
        <h1>Collab Flow Farcaster Mini App</h1>
        <p>
          This route is used as a Farcaster Frame. Open it from a Farcaster
          client (e.g., Warpcast) to start a collaborative session.
        </p>
      </main>
    </>
  );
};

export default FramesPage;


