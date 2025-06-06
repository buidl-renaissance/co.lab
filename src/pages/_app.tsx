import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DefaultSeo, NextSeo } from "next-seo";
import { StyleSheetManager } from "styled-components";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GlobalStyle } from "@/styles/globalStyles";

export default function App({ Component, pageProps }: AppProps) {
  const { metadata } = pageProps;
  return (
    <ThemeProvider>
      <StyleSheetManager shouldForwardProp={(prop) => !prop.startsWith('$')}>
        <GlobalStyle />
        <DefaultSeo
          titleTemplate="%s | Collaborative Platform"
          defaultTitle="Collaborative Platform"
          description="A platform for collaborative projects and events"
          openGraph={{
            images: [
              {
                url: '/co.lab-thumb.jpg',
                width: 1200,
                height: 630,
                alt: 'Collaborative Platform',
              },
            ],
          }}
        />
        {metadata && <NextSeo {...metadata} />}
        <Component {...pageProps} />
      </StyleSheetManager>
      <Analytics />
    </ThemeProvider>
  );
}
