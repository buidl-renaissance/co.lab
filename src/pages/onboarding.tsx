import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styled from "styled-components";
import { Container, Main, Title, Description } from "@/components/Layout";
import { PrimaryButton } from "@/components/Buttons";
import Onboarding from "@/components/Onboarding";
import { useUser } from "@/contexts/UserContext";
import Footer from "@/components/Footer";

const OnboardingPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
`;

const OnboardingContent = styled.div`
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const NextStepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
`;

const StepCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 1.5rem;
  text-align: left;
`;

const StepTitle = styled.h3`
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.3rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.text};
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Redirect to home if user is not authenticated (after loading)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Container>
        <Head>
          <title>Onboarding | Co.Lab</title>
        </Head>
        <Main>
          <OnboardingPageContainer>
            <Onboarding />
          </OnboardingPageContainer>
        </Main>
        <Footer />
      </Container>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <Container>
      <Head>
        <title>Welcome to Co.Lab | Co.Lab</title>
        <meta name="description" content="Welcome to Co.Lab - Get started with collaborative project planning" />
      </Head>
      <Main>
        <OnboardingPageContainer>
          <OnboardingContent>
            <Title size="large">Welcome to Co.Lab!</Title>
            <Onboarding />
            <NextStepsContainer>
              <StepCard>
                <StepTitle>1. Start a Conversation</StepTitle>
                <StepDescription>
                  Record or upload a conversation with your team. Our AI will help structure your ideas.
                </StepDescription>
              </StepCard>
              <StepCard>
                <StepTitle>2. Choose a Template</StepTitle>
                <StepDescription>
                  Select from our templates to organize your collaboration into actionable plans.
                </StepDescription>
              </StepCard>
              <StepCard>
                <StepTitle>3. Collaborate</StepTitle>
                <StepDescription>
                  Share your structured plans, assign tasks, and track progress together.
                </StepDescription>
              </StepCard>
            </NextStepsContainer>
            <ButtonContainer>
              <PrimaryButton onClick={() => router.push("/create")}>
                Create Your First Collaboration
              </PrimaryButton>
              <PrimaryButton onClick={() => router.push("/")}>
                Explore Templates
              </PrimaryButton>
            </ButtonContainer>
          </OnboardingContent>
        </OnboardingPageContainer>
      </Main>
      <Footer />
    </Container>
  );
};

export default OnboardingPage;

