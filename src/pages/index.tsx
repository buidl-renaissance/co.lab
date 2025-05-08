import React, { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #FAF9F6;
  color: #1C1C1E;
  font-family: 'Inter', sans-serif;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Hero = styled.div`
  width: 100%;
  padding: 6rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-image: url('/images/sketch-texture.png');
  background-size: cover;
  background-blend-mode: overlay;
  position: relative;
  overflow: hidden;
`;

const WaveAnimation = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: url('/images/voice-wave.svg');
  background-size: 100% auto;
  opacity: 0.6;
  animation: wave 15s linear infinite;
  
  @keyframes wave {
    0% { background-position: 0 0; }
    100% { background-position: 100% 0; }
  }
`;

const Title = styled.h1`
  margin: 0;
  line-height: 1.15;
  font-size: 4.2rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: bold;
  
  span {
    color: #FF7A59;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: #FF7A59;
      transform: skew(-12deg);
    }
  }
`;

const Description = styled.p`
  text-align: center;
  line-height: 1.5;
  font-size: 1.5rem;
  margin: 1.5rem 0 2.5rem;
  max-width: 700px;
`;

const CTAContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PrimaryButton = styled.button`
  padding: 0.9rem 2.2rem;
  background-color: #FF7A59;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 122, 89, 0.2);
  
  &:hover {
    background-color: #ff6a45;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(255, 122, 89, 0.3);
  }
`;

const SecondaryButton = styled.button`
  padding: 0.9rem 2.2rem;
  background-color: transparent;
  color: #6D9DC5;
  border: 2px solid #6D9DC5;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(109, 157, 197, 0.1);
    transform: translateY(-2px);
  }
`;

const Section = styled.section`
  width: 100%;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: #FFE169;
  }
`;

const HowItWorks = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 300px;
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #6D9DC5;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const StepTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StepDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
`;

const TemplatesSection = styled(Section)`
  background-color: #f5f4f0;
`;

const TemplateGrid = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1.5rem;
  padding: 1rem 0;
  width: 100%;
  max-width: 1200px;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #6D9DC5;
    border-radius: 6px;
  }
`;

const TemplateCard = styled.div<{ selected: boolean }>`
  min-width: 280px;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${props => props.selected ? '#FF7A59' : '#e0e0e0'};
  background-color: white;
  box-shadow: ${props => props.selected ? '0 8px 20px rgba(255, 122, 89, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.selected ? '#FF7A59' : '#6D9DC5'};
  }
  
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
    color: ${props => props.selected ? '#FF7A59' : '#1C1C1E'};
  }
  
  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const TemplateTag = styled.span`
  display: inline-block;
  background-color: #FFE169;
  color: #1C1C1E;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StartSession = styled.div`
  margin: 3rem 0;
  text-align: center;
  padding: 2rem;
  background-color: #FFE169;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }
`;

const StickyRecordButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #FF7A59;
  color: white;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 100;
  
  &:hover {
    transform: scale(1.1);
    background-color: #ff6a45;
  }
`;

const Footer = styled.footer`
  width: 100%;
  padding: 3rem 2rem;
  background-color: #1C1C1E;
  color: #FAF9F6;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  p {
    font-size: 0.9rem;
    margin: 1rem 0;
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: 1200px;
  width: 100%;
  margin-bottom: 2rem;
`;

const FooterColumn = styled.div`
  min-width: 200px;
  margin: 1rem;
  
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

const EmailSignup = styled.div`
  display: flex;
  margin: 1rem 0;
  
  input {
    padding: 0.8rem 1rem;
    border: none;
    border-radius: 4px 0 0 4px;
    font-size: 1rem;
    min-width: 250px;
  }
  
  button {
    padding: 0.8rem 1.2rem;
    background-color: #6D9DC5;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    font-size: 1rem;
    cursor: pointer;
    
    &:hover {
      background-color: #5c89b0;
    }
  }
`;

const CollabFlowHome: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const templates = [
    { id: 'event', name: 'Host an Event', tag: 'Popular' },
    { id: 'artwork', name: 'Create a Collaborative Artwork', tag: 'Creative' },
    { id: 'contest', name: 'Run a Raffle or Contest', tag: 'Engagement' },
    { id: 'fundraise', name: 'Fundraise / Plan a Campaign', tag: 'Impact' },
    { id: 'workshop', name: 'Facilitate a Workshop', tag: 'Education' },
  ];

  return (
    <Container>
      <Head>
        <title>CollabFlow - Turn Conversations into Organized Collaboration</title>
        <meta name="description" content="Voice-first project planning for creative teams. Transform freeform conversations into structured, actionable project plans." />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <Main>
        <Hero>
          <WaveAnimation />
          <Title>
            Turn Conversations into <span>Collaborations</span>
          </Title>
          
          <Description>
            Voice-first project planning for creative teams
          </Description>

          <CTAContainer>
            <PrimaryButton>Start Recording</PrimaryButton>
            <SecondaryButton>Watch Demo</SecondaryButton>
          </CTAContainer>
        </Hero>

        <Section>
          <SectionTitle>How It Works</SectionTitle>
          <HowItWorks>
            <Step>
              <StepNumber>1</StepNumber>
              <StepTitle>Talk It Out</StepTitle>
              <StepDescription>Capture your collaborative conversations naturally, without interrupting your creative flow.</StepDescription>
            </Step>
            <Step>
              <StepNumber>2</StepNumber>
              <StepTitle>We Structure It</StepTitle>
              <StepDescription>Our AI automatically organizes your ideas into tasks, timelines, and action items.</StepDescription>
            </Step>
            <Step>
              <StepNumber>3</StepNumber>
              <StepTitle>You Build Together</StepTitle>
              <StepDescription>Share the structured plan, assign tasks, and track progress as a team.</StepDescription>
            </Step>
          </HowItWorks>
        </Section>

        <TemplatesSection>
          <SectionTitle>Choose Your Template</SectionTitle>
          <TemplateGrid>
            {templates.map((template) => (
              <TemplateCard 
                key={template.id}
                selected={selectedTemplate === template.id}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <TemplateTag>{template.tag}</TemplateTag>
                <h3>{template.name}</h3>
                <p>Pre-configured structure and prompts designed specifically for {template.name.toLowerCase()} collaborations.</p>
              </TemplateCard>
            ))}
          </TemplateGrid>
        </TemplatesSection>

        {selectedTemplate && (
          <StartSession>
            <h2>Ready to start your {templates.find(t => t.id === selectedTemplate)?.name} session?</h2>
            <PrimaryButton>
              Start Recording Session
            </PrimaryButton>
          </StartSession>
        )}
        
        <StickyRecordButton aria-label="Record a collaboration">
          🎙️
        </StickyRecordButton>
      </Main>

      <Footer>
        <FooterContent>
          <FooterColumn>
            <h3>COLLABFLOW</h3>
            <p>Built for Creators by Creators</p>
            <EmailSignup>
              <input type="email" placeholder="Your email" />
              <button>Subscribe</button>
            </EmailSignup>
          </FooterColumn>
          <FooterColumn>
            <h3>RESOURCES</h3>
            <a href="#">Templates</a>
            <a href="#">Guides</a>
            <a href="#">API</a>
            <a href="#">Pricing</a>
          </FooterColumn>
          <FooterColumn>
            <h3>COMPANY</h3>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </FooterColumn>
          <FooterColumn>
            <h3>LEGAL</h3>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
          </FooterColumn>
        </FooterContent>
        <p>
          Concept by John Gulbronson, Nick Robb, and AJ
        </p>
      </Footer>
    </Container>
  );
};

export default CollabFlowHome;
