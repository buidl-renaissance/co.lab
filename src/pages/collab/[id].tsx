import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import {
  Container,
  Main,
  Title,
  Description,
  Section,
  SectionTitle,
} from "@/components/Layout";
import { GetServerSidePropsContext } from "next";
import { getCollaborationById, getAllCollaborations } from "@/db/collaboration";
import { Collaboration } from "@/data/collaboration";
import EditTranscript from "@/components/EditTranscript";
import { Loading } from "@/components/Loading";
import QRCode from "react-qr-code";
import MobileNav from "@/components/MobileNav";
import Transcriber from "@/components/Transcriber";
import NextSteps from "@/components/NextSteps";

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

  &:last-child {
    border-bottom: none;
  }
`;

const Question = styled.h4`
  margin-bottom: 0.5rem;
  font-weight: 600;
  word-break: break-word;
  color: ${({ theme }) => theme.text};
`;

const Answer = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  word-break: break-word;
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

const SummaryTitle = styled(SectionTitle)`
  color: ${({ theme }) => theme.accent};
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

const FeaturesTitle = styled(SectionTitle)`
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
      allCollaborations: allCollaborations.map(collab => ({
        id: collab.id,
        title: collab.title
      })),
      metadata: {
        title: `Collaboration: ${collaboration.title}`,
        description: collaboration.description,
      },
    },
  };
};

const CollaborationPage = ({
  initialCollaboration,
  allCollaborations,
}: {
  initialCollaboration: Collaboration;
  allCollaborations: Array<{ id: string; title: string; }>;
}) => {
  const [collaboration, setCollaboration] = useState<Collaboration>(initialCollaboration);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState<{
    index: number;
    text: string;
  } | null>(null);

  // Store collaboration in local storage
  useEffect(() => {
    // Get existing stored collaborations or initialize empty array
    const storedCollabs = JSON.parse(localStorage.getItem('collaborations') || '[]');
    
    // Check if this collaboration already exists in the array
    const existingIndex = storedCollabs.findIndex((collab: Collaboration) => collab.id === collaboration.id);
    
    if (existingIndex >= 0) {
      // Update existing collaboration
      storedCollabs[existingIndex] = collaboration;
    } else {
      // Add new collaboration to array
      storedCollabs.push(collaboration);
    }
    
    // Save updated array back to localStorage
    localStorage.setItem('collaborations', JSON.stringify(storedCollabs));
  }, [collaboration]);

  const handleAddTranscript = async (transcript: string) => {
    console.log("Transcript added:", transcript);
    setIsLoading(true);
    const response = await fetch(`/api/collaboration/${collaboration.id}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });
    const data = await response.json();
    setCollaboration(data.data);
    setIsLoading(false);
  };

  const handleEditTranscript = async (transcript: string) => {
    if (!editingTranscript) return;
    
    setEditingTranscript(null);
    setIsLoading(true);
    const response = await fetch(`/api/collaboration/${collaboration.id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        transcriptIndex: editingTranscript.index,
      }),
    });
    const data = await response.json();
    setCollaboration(data.data);
    setIsLoading(false);
    setEditingTranscript(null);
  };

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

          {collaboration.analysis && (
            <AnalysisSection>
              <h4>Participants</h4>
              <ParticipantsList>
                {collaboration.analysis.participants?.map(
                  (participant, index) => (
                    <Participant key={index}>{participant}</Participant>
                  )
                )}
              </ParticipantsList>

              <AnswersList>
                <h4>Key Insights</h4>
                {collaboration.analysis.answers?.map(
                  (item: { question: string; answer: string }, index: number) => (
                    <AnswerItem key={index}>
                      <Question>{item.question}</Question>
                      <Answer>{item.answer}</Answer>
                    </AnswerItem>
                  )
                )}
              </AnswersList>
            </AnalysisSection>
          )}

          <NextSteps actions={collaboration.analysis?.actions} />

          {collaboration.analysis?.features && collaboration.analysis.features.length > 0 && (
            <FeaturesSection>
              <FeaturesTitle>Features</FeaturesTitle>
              <FeaturesList>
                {collaboration.analysis.features.map((feature, index) => (
                  <FeatureItem key={index}>
                    {feature}
                  </FeatureItem>
                ))}
              </FeaturesList>
            </FeaturesSection>
          )}

          <SummarySection>
            <SummaryTitle>Summary</SummaryTitle>
            <SummaryText>{collaboration.summary}</SummaryText>
          </SummarySection>

          <QRCodeContainer>
            <QRCode
              value={`https://co.lab.builddetroit.xyz/collab/${collaboration.id}`}
            />
          </QRCodeContainer>

          <TranscriptsList>
            <SummaryTitle>Transcripts</SummaryTitle>
            {collaboration.transcripts?.map((transcript, index) => (
              <TranscriptItem key={index}>
                <EditButton
                  onClick={() => setEditingTranscript({ index, text: transcript })}
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
