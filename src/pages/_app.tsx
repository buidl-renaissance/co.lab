import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DefaultSeo, NextSeo } from "next-seo";

export default function App({ Component, pageProps }: AppProps) {
  const { metadata } = pageProps;
  return (
    <>
      <DefaultSeo
        titleTemplate="%s | Collaborative Platform"
        defaultTitle="Collaborative Platform"
        description="A platform for collaborative projects and events"
      />
      {metadata && <NextSeo {...metadata} />}
      <Component {...pageProps} />
    </>
  );
}
