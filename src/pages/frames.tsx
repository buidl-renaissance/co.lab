import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { APP_URL } from "@/lib/framesConfig";

const FramesPage: NextPage = () => {
  const frameUrl = `${APP_URL}/frames`;
  
  // Signal to Farcaster that the app is ready
  useEffect(() => {
    let readyCalled = false;
    
    const signalReady = async () => {
      if (readyCalled) return;
      
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        
        // Try multiple ways to access the SDK
        let sdk = win.farcaster || win.__FARCASTER_SDK__ || win.FarcasterSDK || win.sdk;
        
        // If farcaster is a promise, await it
        if (win.farcaster && typeof win.farcaster.then === 'function') {
          try {
            sdk = await win.farcaster;
          } catch (e) {
            console.log('Error awaiting farcaster promise:', e);
          }
        }
        
        // Try accessing actions.ready
        if (sdk) {
          // Try sdk.actions.ready()
          if (sdk.actions && typeof sdk.actions.ready === 'function') {
            console.log('✅ Calling sdk.actions.ready()');
            await sdk.actions.ready();
            readyCalled = true;
            return;
          }
          
          // Try sdk.ready() directly
          if (typeof sdk.ready === 'function') {
            console.log('✅ Calling sdk.ready()');
            await sdk.ready();
            readyCalled = true;
            return;
          }
          
          // Try window.farcaster.ready() if it's an RPC object
          if (win.farcaster && typeof win.farcaster.ready === 'function') {
            console.log('✅ Calling window.farcaster.ready()');
            await win.farcaster.ready();
            readyCalled = true;
            return;
          }
        }
        
        console.log('⚠️ SDK not found or ready() not available. SDK:', sdk);
      } catch (error) {
        console.error('Error calling ready():', error);
      }
    };

    // Also check if we're in a Farcaster mini app context and should redirect
    const checkAndRedirect = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      const isInFarcaster = win.farcaster || win.__FARCASTER_SDK__;
      
      // If we're in Farcaster and on the frames page, redirect to main app
      if (isInFarcaster && window.location.pathname === '/frames') {
        console.log('🔄 Redirecting to main app from frames page');
        window.location.href = '/collabs';
      }
    };

    // Try immediately
    signalReady();
    checkAndRedirect();
    
    // Try after a short delay
    const timer1 = setTimeout(() => {
      signalReady();
      checkAndRedirect();
    }, 100);
    
    // Try after DOM is ready
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        setTimeout(() => {
          signalReady();
          checkAndRedirect();
        }, 200);
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            signalReady();
            checkAndRedirect();
          }, 200);
        });
      }
    }
    
    // Poll for SDK (in case it loads late)
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount++;
      if (!readyCalled && pollCount < 20) {
        signalReady();
        if (pollCount > 2) {
          checkAndRedirect();
        }
      } else {
        clearInterval(pollInterval);
      }
    }, 500);
    
    return () => {
      clearTimeout(timer1);
      clearInterval(pollInterval);
    };
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
        splashImageUrl: `${APP_URL}/co.lab-tile.png`,
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


