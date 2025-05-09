import React from "react";
import Head from "next/head";
import styled from "styled-components";
import { Container, Main, Title, Description, Section } from "@/components/Layout";
import { GetServerSidePropsContext } from "next";
import { getCollaborationById } from "@/db/collaboration";
import { Collaboration } from "@/data/collaboration";
import AddTranscript from "@/components/AddTranscript";


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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id } = context.query;
  const collaboration = await getCollaborationById(id as string);

  if (!collaboration) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collaboration,
      metadata: {
        title: `Collaboration: ${collaboration.title}`,
        description: collaboration.description,
      },
    },
  };
};

const CollaborationPage = ({
  collaboration,
}: {
  collaboration: Collaboration;
}) => {

  const handleAddTranscript = (transcript: string) => {
    console.log('Transcript added:', transcript);
  };

  return (
    <Container>
      <Head>
        <title>Collaboration: {collaboration.title}</title>
        <meta
          name="description"
          content={collaboration.description}
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <Title>
          <span>{collaboration.title}</span>
        </Title>

        <Description>{collaboration.description}</Description>

        <AddTranscript onSubmit={handleAddTranscript} />

        {collaboration.analysis && (
          <AnalysisSection>            
            <h4>Participants</h4>
            <ParticipantsList>
              {collaboration.participants.map((participant, index) => (
                <Participant key={index}>{participant}</Participant>
              ))}
            </ParticipantsList>
            
            <AnswersList>
              <h4>Key Insights</h4>
              {collaboration.analysis.answers?.map((item: { question: string, answer: string }, index: number) => (
                <AnswerItem key={index}>
                  <Question>{item.question}</Question>
                  <Answer>{item.answer}</Answer>
                </AnswerItem>
              ))}
            </AnswersList>
          </AnalysisSection>
        )}

        <NextStepsSection>
          <NextStepsTitle>Next Action Steps</NextStepsTitle>
          <StepsList>
            {collaboration.analysis && collaboration.analysis.actions ? (
              collaboration.analysis.actions.map((action: { action: string, description: string }, index: number) => (
                <StepItem key={index}>
                  <strong>{action.action}</strong>: {action.description}
                </StepItem>
              ))
            ) : (
              <>
                <StepItem>Review the analysis and validate the extracted information</StepItem>
                <StepItem>Invite identified participants to collaborate</StepItem>
                <StepItem>Schedule a follow-up meeting to discuss key insights</StepItem>
                <StepItem>Assign action items based on the collaboration template</StepItem>
                <StepItem>Set deadlines for each action item</StepItem>
              </>
            )}
          </StepsList>
        </NextStepsSection>
      </Main>
    </Container>
  );
};

export default CollaborationPage;
