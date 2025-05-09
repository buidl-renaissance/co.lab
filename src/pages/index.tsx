import React, { useState } from "react";
import styled from "styled-components";
import { defaultTemplates, Template } from "@/data/template";
import {
  Title,
  Section,
  SectionTitle,
  Description,
  Container,
  Main,
  Hero,
  Footer,
  FooterContent,
  FooterColumn,
} from "@/components/Layout";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import router from "next/router";

const WaveAnimation = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: url("/images/voice-wave.svg");
  background-size: 100% auto;
  opacity: 0.6;
  animation: wave 15s linear infinite;

  @keyframes wave {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 100% 0;
    }
  }
`;

const CTAContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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
  background-color: #6d9dc5;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const StepTitle = styled.h3`
  font-family: "Space Grotesk", sans-serif;
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
    background-color: #6d9dc5;
    border-radius: 6px;
  }
`;

const TemplateCard = styled.div<{ selected: boolean }>`
  min-width: 280px;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${(props) => (props.selected ? "#FF7A59" : "#e0e0e0")};
  background-color: white;
  box-shadow: ${(props) =>
    props.selected
      ? "0 8px 20px rgba(255, 122, 89, 0.15)"
      : "0 4px 12px rgba(0, 0, 0, 0.05)"};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: ${(props) => (props.selected ? "#FF7A59" : "#6D9DC5")};
  }

  h3 {
    font-family: "Space Grotesk", sans-serif;
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
    color: ${(props) => (props.selected ? "#FF7A59" : "#1C1C1E")};
  }

  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const TemplateTag = styled.span`
  display: inline-block;
  background-color: #ffe169;
  color: #1c1c1e;
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
  background-color: #ffe169;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;

  h2 {
    font-family: "Space Grotesk", sans-serif;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }
`;

const SelectTemplatePrompt = styled.div`
  margin: 3rem 0;
  text-align: center;
  padding: 2rem;
  background-color: #f5f4f0;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  border: 2px dashed #6d9dc5;

  h2 {
    font-family: "Space Grotesk", sans-serif;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    color: #6d9dc5;
  }
`;

const StickyRecordButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ff7a59;
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
    background-color: #6d9dc5;
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

export const getServerSideProps = async () => {
  return {
    props: {
      metadata: {
        title: "CollabFlow - Turn Conversations into Organized Collaboration",
        description:
          "Voice-first project planning for creative teams. Transform freeform conversations into structured, actionable project plans.",
        keywords:
          "collaboration, project planning, voice-first, creative teams, structured plans",
        openGraph: {
          title: "CollabFlow - Turn Conversations into Organized Collaboration",
          description:
            "Voice-first project planning for creative teams. Transform freeform conversations into structured, actionable project plans.",
          images: [
            {
              url: "https://collabflow.com/og-image.png",
              width: 1200,
              height: 630,
              alt: "CollabFlow - Turn Conversations into Organized Collaboration",
            },
          ],
        },
      },
    },
  };
};

const CollabFlowHome: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  return (
    <Container>
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
              <StepDescription>
                Capture your collaborative conversations naturally, without
                interrupting your creative flow.
              </StepDescription>
            </Step>
            <Step>
              <StepNumber>2</StepNumber>
              <StepTitle>We Structure It</StepTitle>
              <StepDescription>
                Our AI automatically organizes your ideas into tasks, timelines,
                and action items.
              </StepDescription>
            </Step>
            <Step>
              <StepNumber>3</StepNumber>
              <StepTitle>You Build Together</StepTitle>
              <StepDescription>
                Share the structured plan, assign tasks, and track progress as a
                team.
              </StepDescription>
            </Step>
          </HowItWorks>
        </Section>

        <TemplatesSection className="TemplatesSection">
          <SectionTitle>Choose Your Template</SectionTitle>
          <TemplateGrid>
            {defaultTemplates.map((template: Template) => (
              <TemplateCard
                key={template.id}
                selected={selectedTemplate?.id === template.id}
                onClick={() => setSelectedTemplate(template)}
              >
                <TemplateTag>{template.tag}</TemplateTag>
                <h3>{template.name}</h3>
                <p>
                  Pre-configured structure and prompts designed specifically for{" "}
                  {template.name.toLowerCase()} collaborations.
                </p>
              </TemplateCard>
            ))}
          </TemplateGrid>
        </TemplatesSection>

        {selectedTemplate ? (
          <StartSession>
            <h2>
              Ready to start your{" "}
              {
                defaultTemplates.find((t) => t.id === selectedTemplate?.id)
                  ?.name
              }{" "}
              session?
            </h2>
            <PrimaryButton
              onClick={() => {
                router.push(`/create/${selectedTemplate?.id}`);
              }}
            >
              Start Recording Session
            </PrimaryButton>
          </StartSession>
        ) : (
          <SelectTemplatePrompt>
            <h2>Please select a template to continue</h2>
            <SecondaryButton
              onClick={() =>
                document
                  .querySelector(".TemplatesSection")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Browse Templates
            </SecondaryButton>
          </SelectTemplatePrompt>
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
            {/* <EmailSignup>
              <input type="email" placeholder="Your email" />
              <button>Subscribe</button>
            </EmailSignup> */}
          </FooterColumn>
          {/* <FooterColumn>
            <h3>RESOURCES</h3>
            <a href="#">Templates</a>
            <a href="#">Guides</a>
            <a href="#">API</a>
            <a href="#">Pricing</a>
          </FooterColumn> */}
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
        <p>Concept by John Gulbronson, Nick Robb, and AJ</p>
      </Footer>
    </Container>
  );
};

export default CollabFlowHome;
