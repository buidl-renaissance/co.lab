import React, { useState, useRef } from "react";
import styled from "styled-components";
import { defaultTemplates, Template } from "@/data/template";
import {
  Title,
  Section,
  SectionTitle,
  Description as DescriptionText,
  Container,
  Main,
  Hero,
  Footer,
  FooterContent,
  FooterColumn,
} from "@/components/Layout";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import router from "next/router";
import Link from "next/link";

const Description = styled(DescriptionText)`
  font-size: 1.3rem;
`;

// const WaveAnimation = styled.div`
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   width: 100%;
//   height: 120px;
//   background: url("/images/voice-wave.svg");
//   background-size: 100% auto;
//   opacity: 0.6;
//   animation: wave 15s linear infinite;
//   z-index: -1;

//   @keyframes wave {
//     0% {
//       background-position: 0 0;
//     }
//     100% {
//       background-position: 100% 0;
//     }
//   }
// `;

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

export const getServerSideProps = async () => {
  return {
    props: {
      metadata: {
        title: "Co.Lab - Turn Conversations into Organized Collaboration",
        description:
          "A voice-first project planning tool for creative teams. Transform freeform conversations into structured, actionable project plans.",
        keywords:
          "collaboration, project planning, voice-first, creative teams, structured plans",
        openGraph: {
          title: "Co.Lab - Turn Conversations into Organized Collaboration",
          description:
            "Voice-first project planning for creative teams. Transform freeform conversations into structured, actionable project plans.",
          images: [
            {
              url: "/co.lab-start.jpg",
              width: 1200,
              height: 630,
              alt: "Co.Lab - Turn Conversations into Organized Collaboration",
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
  const templatesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToTemplates = () => {
    if (templatesSectionRef.current) {
      const yOffset = -20; // Small offset to account for any fixed headers
      const y = templatesSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Container>
      <Main>
        <Hero>
          {/* <WaveAnimation /> */}
          <Title>
            Turn Conversations into <span>Collaborations</span>
          </Title>

          <Description>
            Voice-first project planning for creative teams
          </Description>

          <CTAContainer>
            <PrimaryButton onClick={scrollToTemplates}>
              Get Started
            </PrimaryButton>
            {/* <SecondaryButton>Watch Demo</SecondaryButton> */}
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

        <TemplatesSection className="TemplatesSection" ref={templatesSectionRef}>
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
              onClick={scrollToTemplates}
            >
              Browse Templates
            </SecondaryButton>
          </SelectTemplatePrompt>
        )}

        <Section
          id="recent-collaborations"
          style={{ backgroundColor: "#f5f4f0" }}
        >
          <SectionTitle>Recent Collaborations</SectionTitle>
          <Description style={{ textAlign: "center", fontSize: "1.2rem" }}>
            Continue working on your recent collaboration sessions or start a
            new one.
          </Description>
          <CTAContainer>
            <PrimaryButton onClick={() => router.push("/collabs")}>
              View My Collaborations
            </PrimaryButton>
          </CTAContainer>
        </Section>

        <Section>
          <SectionTitle>Built on Open Source</SectionTitle>
          <Description style={{ textAlign: "center" }}>
            At Co.Lab, we believe in open collaboration.
          </Description>
          <a
            href="https://github.com/buidl-renaissance/co.lab"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </Section>
      </Main>

      <Footer>
        <FooterContent>
          <FooterColumn>
            <h3>COL.LAB</h3>
            <p>Built for Creators by Creators</p>
          </FooterColumn>
          <FooterColumn>
            <h3>COMPANY</h3>
            <Link href="/about">About</Link>
            {/* <Link href="/blog">Blog</Link>
            <Link href="/careers">Careers</Link> */}
            <Link href="/contact">Contact</Link>
          </FooterColumn>
          <FooterColumn>
            <h3>LEGAL</h3>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            {/* <Link href="/cookies">Cookies</Link> */}
          </FooterColumn>
        </FooterContent>
        <p>Concept by WiredInSamurai, Nick Rob, and AJ</p>
      </Footer>
    </Container>
  );
};

export default CollabFlowHome;
