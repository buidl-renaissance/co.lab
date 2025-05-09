import React, { useEffect } from "react";
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
import { getCollaborationById } from "@/db/collaboration";
import { Collaboration } from "@/data/collaboration";
import AddTranscript from "@/components/AddTranscript";
import EditTranscript from "@/components/EditTranscript";
import { Loading } from "@/components/Loading";
import QRCode from "react-qr-code";

const AnalysisSection = styled(Section)`
  background-color: #f8f9fa;
  text-align: left;
  align-items: flex-start;
  padding: 0;
`;

const ParticipantsList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Participant = styled.div`
  background-color: #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const AnswersList = styled.div`
  margin-top: 1.5rem;
  width: 100%;
`;

const AnswerItem = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
  width: 100%;

  &:last-child {
    border-bottom: none;
  }
`;

const Question = styled.h4`
  margin-bottom: 0.5rem;
  font-weight: 600;
  word-break: break-word;
`;

const Answer = styled.p`
  color: #495057;
  word-break: break-word;
`;

const NextStepsSection = styled(Section)`
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
  text-align: left;
  align-items: flex-start;
  padding: 1rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 1rem;
  word-break: break-word;
`;

const NextStepsTitle = styled(SectionTitle)`
  color: #0050b3;
`;

const StepsList = styled.ul`
  padding-left: 1.5rem;
  margin-right: 1rem;
`;

const StepItem = styled.li`
  margin-bottom: 0.5rem;
  word-break: break-word;
`;

const SummarySection = styled(Section)`
  background-color: #f8f9fa;
  text-align: left;
  align-items: flex-start;
  padding: 0;
  margin-top: 1rem;
`;

const SummaryTitle = styled(SectionTitle)`
  color: #0050b3;
`;

const SummaryText = styled.p`
  margin-bottom: 1rem;
  word-break: break-word;
`;

const TranscriptsList = styled.div`
  margin-top: 1rem;
  margin-bottom: 6rem;
`;

const TranscriptItem = styled.div`
  margin-bottom: 1rem;
  word-break: break-word;
  position: relative;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const EditButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  transition: color 0.2s;

  &:hover {
    color: #0050b3;
  }
`;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id } = context.query;
  const collaboration = await getCollaborationById(id as string);
  console.log("Collaboration:", collaboration?.transcripts);

  if (!collaboration) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialCollaboration: collaboration,
      metadata: {
        title: `Collaboration: ${collaboration.title}`,
        description: collaboration.description,
      },
    },
  };
};

const CollaborationPage = ({
  initialCollaboration,
}: {
  initialCollaboration: Collaboration;
}) => {
  const [collaboration, setCollaboration] =
    React.useState<Collaboration>(initialCollaboration);
  const [isLoading, setIsLoading] = React.useState(false);
  const [editingTranscript, setEditingTranscript] = React.useState<{
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
        <title>Collaboration: {collaboration.title}</title>
        <meta name="description" content={collaboration.description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <Title>
          <span>{collaboration.title}</span>
        </Title>

        <Description>{collaboration.description}</Description>

        <AddTranscript onSubmit={handleAddTranscript} />

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

        <NextStepsSection>
          <NextStepsTitle>Next Action Steps</NextStepsTitle>
          <StepsList>
            {collaboration.analysis && collaboration.analysis.actions ? (
              collaboration.analysis.actions.map(
                (
                  action: { action: string; description: string },
                  index: number
                ) => (
                  <StepItem key={index}>
                    <strong>{action.action}</strong>: {action.description}
                  </StepItem>
                )
              )
            ) : (
              <StepItem>No action steps found</StepItem>
            )}
          </StepsList>
        </NextStepsSection>

        <SummarySection>
          <SummaryTitle>Summary</SummaryTitle>
          <SummaryText>{collaboration.summary}</SummaryText>
        </SummarySection>

        <QRCode
          value={`https://co.lab.builddetroit.xyz/collab/${collaboration.id}`}
        />

        <TranscriptsList>
          <SummaryTitle>Transcripts</SummaryTitle>
          {collaboration.transcripts?.map((transcript, index) => (
            <TranscriptItem key={index}>
              <EditButton
                onClick={() =>
                  setEditingTranscript({ index, text: transcript })
                }
                title="Edit transcript"
              >
                ✏️
              </EditButton>
              {transcript}
            </TranscriptItem>
          ))}
        </TranscriptsList>
      </Main>
    </Container>
  );
};

export default CollaborationPage;
