import React from 'react';
import styled from 'styled-components';
import { Container, Main, Title, Description, Footer, FooterContent, FooterColumn } from '@/components/Layout';
import Head from 'next/head';

const AboutSection = styled.section`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const TeamSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (min-width: 768px) {
    gap: 2rem;
    margin-top: 3rem;
  }
`;

const TeamMember = styled.div`
  text-align: center;
  padding: 1rem;
  
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    margin: 1rem 0 0.5rem;
    font-size: 1.2rem;
    
    @media (min-width: 768px) {
      font-size: 1.4rem;
    }
  }
  
  p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
    
    @media (min-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const MissionSection = styled.section`
  background-color: #f5f4f0;
  padding: 2rem 1rem;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const MissionContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  
  h2 {
    font-size: 1.5rem;
    
    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }
  
  p {
    font-size: 0.95rem;
    line-height: 1.6;
    
    @media (min-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const AboutPage = () => {
  return (
    <Container>
      <Head>
        <title>About CollabFlow</title>
        <meta name="description" content="Learn about CollabFlow and our mission to transform collaborative work" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Main>
        <AboutSection>
          <Title>About CollabFlow</Title>
          <Description>
            We&apos;re building the future of collaborative work, one conversation at a time.
          </Description>
        </AboutSection>

        <MissionSection>
          <MissionContent>
            <h2>Our Mission</h2>
            <p>
              At CollabFlow, we believe that the best ideas come from natural conversations.
              Our mission is to bridge the gap between free-flowing discussions and structured
              project management, making it easier for teams to capture, organize, and act on
              their collaborative ideas.
            </p>
          </MissionContent>
        </MissionSection>

        <TeamSection>
          <h2>Meet the Team</h2>
          <TeamGrid>
            <TeamMember>
              <h3>John Gulbronson</h3>
              <p>Builder & Co-Creator</p>
            </TeamMember>
            <TeamMember>
              <h3>Nick Robb</h3>
              <p>Co-Creator</p>
            </TeamMember>
            <TeamMember>
              <h3>AJ</h3>
              <p>Co-Creator</p>
            </TeamMember>
          </TeamGrid>
        </TeamSection>
      </Main>

      <Footer>
        <FooterContent>
          <FooterColumn>
            <h3>COLLABFLOW</h3>
            <p>Built for Creators by Creators</p>
          </FooterColumn>
          <FooterColumn>
            <h3>COMPANY</h3>
            <a href="/about">About</a>
            <a href="/blog">Blog</a>
            <a href="/careers">Careers</a>
            <a href="/contact">Contact</a>
          </FooterColumn>
          <FooterColumn>
            <h3>LEGAL</h3>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/cookies">Cookies</a>
          </FooterColumn>
        </FooterContent>
        <p>Concept by John Gulbronson, Nick Robb, and AJ</p>
      </Footer>
    </Container>
  );
};

export default AboutPage; 