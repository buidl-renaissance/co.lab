import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Container = styled.div`
  min-height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #FAF9F6;
  color: #1C1C1E;
  font-family: 'Inter', sans-serif;
  width: 100%;
  overflow-x: hidden;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
  padding: 1rem;
`;

const Section = styled.section`
  width: 100%;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 3rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background-color: #FFE169;
    
    @media (min-width: 768px) {
      width: 80px;
    }
  }
`;

const Footer = styled.footer`
  width: 100%;
  padding: 2rem 1rem;
  background-color: #1C1C1E;
  color: #FAF9F6;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
  
  p {
    font-size: 0.9rem;
    margin: 1rem 0;
    text-align: center;
  }
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    max-width: 1200px;
    margin-bottom: 2rem;
  }
`;

const FooterColumn = styled.div`
  width: 100%;
  margin: 0.5rem 0;
  text-align: center;
  
  @media (min-width: 768px) {
    min-width: 200px;
    margin: 1rem;
    text-align: left;
  }
  
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #FFE169;
  }
  
  a {
    display: block;
    color: #FAF9F6;
    margin-bottom: 0.5rem;
    text-decoration: none;
    
    &:hover {
      color: #6D9DC5;
    }
  }
`;

const Hero = styled.div`
  width: 100%;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-image: url('/images/sketch-texture.png');
  background-size: cover;
  background-blend-mode: overlay;
  position: relative;
  overflow: hidden;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  line-height: 1.15;
  font-size: 2.5rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: bold;
  
  @media (min-width: 768px) {
    font-size: 4.2rem;
  }
  
  span {
    color: #FF7A59;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #FF7A59;
      transform: skew(-12deg);
      
      @media (min-width: 768px) {
        bottom: -5px;
        height: 3px;
      }
    }
  }
`;

const Description = styled.p`
  line-height: 1.5;
  font-size: 1.1rem;
  margin: 1rem 0 2rem;
  max-width: 700px;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
    margin: 1.5rem 0 2.5rem;
  }
`;

const Layout = ({ children, title = 'Voice Transcription App' }: LayoutProps) => {
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
  Main,
  Section,
  SectionTitle,
  Footer,
  FooterContent,
  FooterColumn,
  Hero,
  Title,
  Description,
};
