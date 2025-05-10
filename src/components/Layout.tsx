import React, { ReactNode } from "react";
import styled from "styled-components";
import Head from "next/head";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

type Size = "small" | "default" | "large";

const Container = styled.div`
  min-height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-family: "Inter", sans-serif;
  width: 100%;
  overflow-x: hidden;
`;

export const Main = styled.main<{ full?: boolean, layout?: 'left' | 'center' }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: ${({ layout }) => layout === 'left' ? 'flex-start' : 'center'};
  width: 100%;
  max-width: ${({ full }) => (full ? "100%" : "1200px")};
  margin: 0 auto;
  padding: 2rem 0rem;

  @media (max-width: 768px) {
    padding-top: calc(60px + 1rem);
  }
`;

const Section = styled.section<{ alt?: boolean }>`
  width: 100%;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme, alt }) => (alt ? theme.backgroundAlt : theme.background)};
  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const SectionTitle = styled.h2<{ size?: Size }>`
  font-family: "Space Grotesk", sans-serif;
  font-size: ${(props) =>
    props.size === "small"
      ? "1.5rem"
      : props.size === "default"
      ? "2rem"
      : "2.5rem"};
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  @media (min-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 3rem;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background-color: #ffe169;

    @media (min-width: 768px) {
      width: 80px;
    }
  }
`;

const Hero = styled.div`
  width: 100%;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-image: url("/images/sketch-texture.png");
  background-size: cover;
  background-blend-mode: overlay;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

const Title = styled.h1<{ size?: Size }>`
  margin: 0;
  line-height: 1.15;
  font-size: ${({ size = "default" }) =>
    size === "small" ? "2rem" : size === "large" ? "5rem" : "2.5rem"};
  font-family: "Space Grotesk", sans-serif;
  font-weight: bold;

  @media (min-width: 768px) {
    font-size: ${({ size = "default" }) =>
      size === "small" ? "3rem" : size === "large" ? "6rem" : "4.2rem"};
  }

  span {
    color: #ff7a59;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #ff7a59;
      transform: skew(-12deg);

      @media (min-width: 768px) {
        bottom: -5px;
        height: 3px;
      }
    }
  }
`;

const Description = styled.p<{ size?: Size }>`
  line-height: 1.5;
  font-size: ${({ size = "default" }) =>
    size === "small" ? "0.9rem" : size === "large" ? "1.3rem" : "1.1rem"};
  margin: 1rem 0 2rem;
  max-width: 700px;

  @media (min-width: 768px) {
    font-size: ${({ size = "default" }) =>
      size === "small" ? "1.2rem" : size === "large" ? "1.8rem" : "1.5rem"};
    margin: 1.5rem 0 2.5rem;
  }
`;

const Layout = ({
  children,
  title = "Voice Transcription App",
}: LayoutProps) => {
  return (
    <Container>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Voice transcription application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>{children}</Main>
    </Container>
  );
};

export default Layout;
export {
  Container,
  Section,
  SectionTitle,
  Hero,
  Title,
  Description,
};
