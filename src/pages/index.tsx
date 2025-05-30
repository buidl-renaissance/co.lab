import React, { useRef } from "react";
import styled from "styled-components";
import {
  Section,
  SectionTitle,
  Description as DescriptionText,
  Container as LayoutContainer,
  Main,
  Hero,
} from "@/components/Layout";
import { PrimaryButton } from "@/components/Buttons";
import router from "next/router";
import Footer from '@/components/Footer';
import Templates from "@/components/Templates";
import CoLab from "@/components/CoLab";

const Container = styled(LayoutContainer)`
  padding: 0rem;
`;

const Description = styled(DescriptionText)`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.text};
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
  background: ${({ theme }) => theme.accent};
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
  color: ${({ theme }) => theme.text};
`;

const StepDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.textSecondary};
`;

const TemplatesSection = styled(Section)`
  background: ${({ theme }) => theme.surface};
  padding: 2rem 0rem;
`;

const RecentCollaborationsSection = styled(Section)`
  background: ${({ theme }) => theme.background};
`;

const GitHubLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  margin-top: 1rem;

  &:hover {
    color: ${({ theme }) => theme.accent};
    background: ${({ theme }) => theme.surface};
  }

  svg {
    margin-right: 8px;
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
              url: "/co.lab-thumb.jpg",
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
  const templatesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToTemplates = () => {
    if (templatesSectionRef.current) {
      const yOffset = -20; // Small offset to account for any fixed headers
      const y =
        templatesSectionRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  return (
    <Container>
      <Main full>
        <Hero>
          {/* <WaveAnimation /> */}

          <CoLab />

          <Description style={{ fontSize: "1.5rem" }}>
            Turn conversations into <span>collaborations</span> with a
            voice-first project planning for creative teams
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

        <TemplatesSection ref={templatesSectionRef}>
          <Templates />
        </TemplatesSection>

        <RecentCollaborationsSection id="recent-collaborations">
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
        </RecentCollaborationsSection>

        <Section alt>
          <SectionTitle>Built on Open Source</SectionTitle>
          <Description style={{ textAlign: "center" }}>
            At Co.Lab, we believe in open collaboration.
          </Description>
          <GitHubLink
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
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </GitHubLink>
        </Section>
      </Main>
      <Footer />
    </Container>
  );
};

export default CollabFlowHome;
