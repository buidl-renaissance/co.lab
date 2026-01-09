import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import {
  Container,
  Main,
  Title,
  Description,
  Section,
} from "@/components/Layout";
import { GetServerSidePropsContext } from "next";
import { getCollaborationById, getAllCollaborations } from "@/db/collaboration";
import { Collaboration, EventDetails } from "@/data/collaboration";
import EditTranscript from "@/components/EditTranscript";
import { Loading } from "@/components/Loading";
import QRCode from "react-qr-code";
import MobileNav from "@/components/MobileNav";
import Transcriber from "@/components/Transcriber";
import NextSteps from "@/components/NextSteps";
import SectionHeader from "@/components/SectionHeader";
import { useRouter } from "next/router";
import EventCard from "@/components/EventCard";
import { EVENT_CARD_QUESTIONS } from "@/lib/analyze";

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  @media (min-width: 768px) {
    margin-top: 3rem;
  }
`;

const AnalysisSection = styled(Section)`
  text-align: left;
  align-items: flex-start;
  padding: 0;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const ParticipantsList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
`;

const Participant = styled.div`
  background: ${({ theme }) => theme.surface};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.accent};
  }
`;

const AnswersList = styled.div`
  margin-top: 1.5rem;
  width: 100%;
`;

const AnswerItem = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  width: 100%;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const Question = styled.h4`
  margin-bottom: 0.5rem;
  font-weight: 600;
  word-break: break-word;
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
`;

const Answer = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  word-break: break-word;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const SummarySection = styled(Section)`
  text-align: left;
  align-items: flex-start;
  padding: 0;
  margin-top: 1rem;
  width: 100%;
  max-width: 900px;
  margin: 1.5rem auto;
`;

const SummaryText = styled.p`
  margin-bottom: 1rem;
  word-break: break-word;
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

const TranscriptsList = styled.div`
  margin-top: 1rem;
  margin-bottom: 6rem;
  width: 100%;
  max-width: 900px;
  margin: 1.5rem auto 6rem;
`;

const TranscriptItem = styled.div`
  margin-bottom: 1rem;
  word-break: break-word;
  position: relative;
  padding: 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 4px;
  padding-right: 3rem;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border};
`;

const QRCodeContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 2rem auto;
  background: ${({ theme }) => theme.background};
  padding: 1rem;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const FeaturesSection = styled(Section)`
  background: ${({ theme }) => theme.surface};
  border-left: 4px solid ${({ theme }) => theme.accent};
  text-align: left;
  align-items: flex-start;
  padding: 1rem;
  width: 100%;
  max-width: 900px;
  margin: 1.5rem auto;
`;

const FeaturesTitle = styled(SectionHeader)`
  color: ${({ theme }) => theme.accent};
`;

const FeaturesList = styled.ul`
  padding-left: 1.5rem;
  margin-right: 1rem;
  width: 100%;
  color: ${({ theme }) => theme.text};
  list-style-type: disc;
`;

const FeatureItem = styled.li`
  margin-bottom: 0.5rem;
  word-break: break-word;
`;

const EditButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    color: ${({ theme }) => theme.accent};
    background: ${({ theme }) => theme.surface};
  }

  &:active {
    background: ${({ theme }) => theme.border};
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 1.5rem;
  }
`;

const FadeOutContainer = styled.div<{ isVisible: boolean }>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: opacity 300ms ease-out;
`;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id } = context.query;
  const collaboration = await getCollaborationById(id as string);
  const allCollaborations = await getAllCollaborations();

  if (!collaboration) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialCollaboration: collaboration,
      allCollaborations: allCollaborations.map((collab) => ({
        id: collab.id,
        title: collab.title,
      })),
      metadata: {
        title: `Collaboration: ${collaboration.title}`,
        description: collaboration.description,
        openGraph: {
          title: `Collaboration: ${collaboration.title}`,
          description: collaboration.description,
          images: [
            {
              url: "/co.lab-thumb.jpg",
              width: 1200,
              height: 630,
            },
          ],
        },
      },
    },
  };
};

const CollaborationPage = ({
  initialCollaboration,
  allCollaborations,
}: {
  initialCollaboration: Collaboration;
  allCollaborations: Array<{ id: string; title: string }>;
}) => {
  const router = useRouter();
  const [collaboration, setCollaboration] =
    useState<Collaboration>(initialCollaboration);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [editingTranscript, setEditingTranscript] = useState<{
    index: number;
    text: string;
  } | null>(null);

  // Track when collaboration is opened
  useEffect(() => {
    if (!router.isReady || !collaboration || typeof window === 'undefined') return;

    try {
      // Get existing opened timestamps or initialize empty object
      const openedTimestamps = JSON.parse(localStorage.getItem('collaborationOpenedTimestamps') || '{}');
      
      // Update timestamp for current collaboration
      openedTimestamps[collaboration.id] = Date.now();
      
      // Save back to localStorage
      localStorage.setItem('collaborationOpenedTimestamps', JSON.stringify(openedTimestamps));
    } catch (error) {
      console.error('Error updating collaboration timestamp:', error);
    }
  }, [router.isReady, collaboration]);

  // Load collaboration data when route changes
  useEffect(() => {
    const loadCollaboration = async () => {
      if (!router.isReady) return;

      setIsInitialLoad(true);
      setShowLoadingScreen(true);
      try {
        const response = await fetch(`/api/collaboration/${router.query.id}`);
        const data = await response.json();

        if (data.success && data.data) {
          setCollaboration(data.data);
        } else {
          // Fallback to localStorage if API fails
          const storedCollabs = JSON.parse(
            localStorage.getItem("collaborations") || "[]"
          );
          const storedCollab = storedCollabs.find(
            (c: Collaboration) => c.id === router.query.id
          );
          if (storedCollab) {
            setCollaboration(storedCollab);
          }
        }
      } catch (error) {
        console.error("Error loading collaboration:", error);
        // Fallback to localStorage if API fails
        const storedCollabs = JSON.parse(
          localStorage.getItem("collaborations") || "[]"
        );
        const storedCollab = storedCollabs.find(
          (c: Collaboration) => c.id === router.query.id
        );
        if (storedCollab) {
          setCollaboration(storedCollab);
        }
      } finally {
        setIsInitialLoad(false);
        // Start fade out animation
        setTimeout(() => {
          setShowLoadingScreen(false);
        }, 300);
      }
    };

    loadCollaboration();
  }, [router.isReady, router.query.id]);

  // Store collaboration in local storage
  useEffect(() => {
    if (!collaboration) return;

    // Get existing stored collaborations or initialize empty array
    const storedCollabs = JSON.parse(
      localStorage.getItem("collaborations") || "[]"
    );

    // Check if this collaboration already exists in the array
    const existingIndex = storedCollabs.findIndex(
      (collab: Collaboration) => collab.id === collaboration.id
    );

    if (existingIndex >= 0) {
      // Update existing collaboration
      storedCollabs[existingIndex] = collaboration;
    } else {
      // Add new collaboration to array
      storedCollabs.push(collaboration);
    }

    // Save updated array back to localStorage
    localStorage.setItem("collaborations", JSON.stringify(storedCollabs));
  }, [collaboration]);

  const handleAddTranscript = async (transcript: string) => {
    console.log("Transcript added:", transcript);
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/collaboration/${collaboration.id}/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcript }),
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        setCollaboration(data.data);
      }
    } catch (error) {
      console.error("Error adding transcript:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTranscript = async (transcript: string) => {
    if (!editingTranscript) return;

    setEditingTranscript(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/collaboration/${collaboration.id}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript,
            transcriptIndex: editingTranscript.index,
          }),
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        setCollaboration(data.data);
      }
    } catch (error) {
      console.error("Error updating transcript:", error);
    } finally {
      setIsLoading(false);
      setEditingTranscript(null);
    }
  };

  const handleEventDetailsUpdate = async (eventDetails: EventDetails) => {
    try {
      const response = await fetch(
        `/api/collaboration/${collaboration.id}/event-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ eventDetails }),
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        setCollaboration(data.data);
      }
    } catch (error) {
      console.error("Error updating event details:", error);
    }
  };

  // Filter out event-specific questions from Key Insights for event collaborations
  const getFilteredAnswers = () => {
    if (!collaboration.analysis?.answers) return [];
    
    // For event templates, filter out questions that are shown in the EventCard
    if (collaboration.template.id === "event") {
      return collaboration.analysis.answers.filter(
        (item) => !EVENT_CARD_QUESTIONS.some(
          (q) => item.question.toLowerCase().includes(q.toLowerCase().slice(0, 20))
        )
      );
    }
    
    return collaboration.analysis.answers;
  };

  // Get or create event details for event templates
  const getEventDetails = (): EventDetails => {
    if (collaboration.eventDetails) {
      return collaboration.eventDetails;
    }
    
    // Try to extract from analysis answers as fallback
    const answers = collaboration.analysis?.answers || [];
    const findAnswer = (keywords: string[]) => {
      const found = answers.find((a) =>
        keywords.some((k) => a.question.toLowerCase().includes(k))
      );
      return found?.answer || "";
    };

    return {
      eventTitle: findAnswer(["name of your event", "event name"]) || collaboration.title,
      date: findAnswer(["when", "date", "take place"]),
      time: "",
      location: findAnswer(["location", "where", "venue"]),
    };
  };

  if (isInitialLoad || showLoadingScreen) {
    return (
      <Container>
        <FadeOutContainer isVisible={showLoadingScreen}>
          <Loading text="Loading collaboration..." />
        </FadeOutContainer>
      </Container>
    );
  }

  if (!collaboration) {
    return (
      <Container>
        <Main layout="left">
          <Title>Collaboration Not Found</Title>
          <Description>
            The requested collaboration could not be found.
          </Description>
        </Main>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <title>{collaboration.title} | Co.Lab</title>
        <meta name="description" content={collaboration.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MobileNav collaborations={allCollaborations} />

      <ContentWrapper>
        <Main layout="left">
          <Title>
            <span>{collaboration.title}</span>
          </Title>

          <Description>{collaboration.description}</Description>

          <Transcriber onTranscriptSubmit={handleAddTranscript} />

          {isLoading && <Loading />}

          {editingTranscript && (
            <EditTranscript
              transcript={editingTranscript.text}
              onSubmit={handleEditTranscript}
              onClose={() => setEditingTranscript(null)}
              isOpen={true}
            />
          )}

          {/* Event Card for event-type collaborations */}
          {collaboration.template.id === "event" && (
            <EventCard
              eventDetails={getEventDetails()}
              collaborationId={collaboration.id}
              onUpdate={handleEventDetailsUpdate}
            />
          )}

          {collaboration.analysis && (
            <AnalysisSection>
              <SectionHeader>Participants</SectionHeader>
              <ParticipantsList>
                {collaboration.analysis.participants?.map(
                  (participant, index) => (
                    <Participant key={index}>{participant}</Participant>
                  )
                )}
              </ParticipantsList>

              {getFilteredAnswers().length > 0 && (
                <AnswersList>
                  <SectionHeader>Key Insights</SectionHeader>
                  {getFilteredAnswers().map(
                    (
                      item: { question: string; answer: string },
                      index: number
                    ) => (
                      <AnswerItem key={index}>
                        <Question>{item.question}</Question>
                        <Answer>{item.answer}</Answer>
                      </AnswerItem>
                    )
                  )}
                </AnswersList>
              )}
            </AnalysisSection>
          )}

          <NextSteps
            actions={collaboration.analysis?.actions}
            collaborationId={collaboration.id}
          />

          {collaboration.analysis?.features &&
            collaboration.analysis.features.length > 0 && (
              <FeaturesSection>
                <FeaturesTitle>Features</FeaturesTitle>
                <FeaturesList>
                  {collaboration.analysis.features.map((feature, index) => (
                    <FeatureItem key={index}>{feature}</FeatureItem>
                  ))}
                </FeaturesList>
              </FeaturesSection>
            )}

          {collaboration.summary && (
            <SummarySection>
              <SectionHeader>Summary</SectionHeader>
              <SummaryText>{collaboration.summary}</SummaryText>
            </SummarySection>
          )}

          <QRCodeContainer>
            <QRCode
              value={`https://co.lab.builddetroit.xyz/collab/${collaboration.id}`}
            />
          </QRCodeContainer>

          <TranscriptsList>
            <SectionHeader>Transcripts</SectionHeader>
            {collaboration.transcripts?.map((transcript, index) => (
              <TranscriptItem key={index}>
                <EditButton
                  onClick={() =>
                    setEditingTranscript({ index, text: transcript })
                  }
                  title="Edit transcript"
                  aria-label="Edit transcript"
                >
                  ✏️
                </EditButton>
                {transcript}
              </TranscriptItem>
            ))}
          </TranscriptsList>
        </Main>
      </ContentWrapper>
    </Container>
  );
};

export default CollaborationPage;
