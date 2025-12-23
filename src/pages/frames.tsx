import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { APP_URL } from "@/lib/framesConfig";

const FramesPage: NextPage = () => {
  const frameUrl = `${APP_URL}/frames`;
  
  // Signal to Farcaster that the app is ready
  useEffect(() => {
    // Call ready() when the app loads to transition from splash screen
    const signalReady = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        const sdk = win.farcaster || win.__FARCASTER_SDK__ || win.FarcasterSDK;
        
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          console.log('✅ Calling sdk.actions.ready()');
          await sdk.actions.ready();
        } else {
          console.log('⚠️ SDK not found or ready() not available');
        }
      } catch (error) {
        console.error('Error calling ready():', error);
      }
    };

    // Wait a bit for SDK to be available
    const timer = setTimeout(signalReady, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // MiniAppEmbed JSON for Farcaster app identification
  const miniAppEmbed = {
    version: '1',
    imageUrl: `${APP_URL}/co.lab-thumb.jpg`,
    button: {
      title: 'Start a Collab',
      action: {
        type: 'launch_frame',
        name: 'Co.Lab',
        url: APP_URL,
        splashImageUrl: `${APP_URL}/co.lab-start.jpg`,
        splashBackgroundColor: '#ffffff',
      },
    },
  };

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

        {/* Farcaster Mini App Embed Metadata */}
        <meta
          name="fc:miniapp"
          content={JSON.stringify(miniAppEmbed)}
        />

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


