import React, { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import { useRouter } from "next/router";
import { defaultTemplates, templateQuestions, Template } from "@/data/template";
import {
  Container as LayoutContainer,
  Main,
  Title,
  Description,
  SectionTitle,
} from "@/components/Layout";
import { Form, FormGroup, Label, TextArea } from "@/components/Form";
import { GetServerSidePropsContext } from "next";
import {
  ButtonGroup,
  PrimaryButton,
  SecondaryButton,
} from "@/components/Buttons";
import { Loading } from "@/components/Loading";
import Transcriber from "@/components/Transcriber";
import { Modal } from "@/components/Modal";
import MobileNav from "@/components/MobileNav";
import { useCollaborations } from "@/hooks/useCollaborations";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { template } = context.query;
  const foundTemplate = defaultTemplates.find((t) => t.id === template);

  if (!foundTemplate) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      template: foundTemplate,
    },
  };
};

const TemplateCreatePage = ({ template }: { template: Template }) => {
  const router = useRouter();
  const [transcript, setTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manuallyInput, setManuallyInput] = useState(false);
  const { collaborations } = useCollaborations();

  if (!template) {
    return <div>Template not found</div>;
  }

  const questions =
    templateQuestions[template.id as keyof typeof templateQuestions] || [];


  const handleTranscriptSubmit = async (transcript: string) => {
    setTranscript(transcript);
    setIsSubmitting(true);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          templateId: template.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.id) {
        router.push(`/collab/${data.data.id}`);
      } else {
        console.error("Error creating collaboration:", data.error);
        setIsSubmitting(false);
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTranscriptSubmit(transcript);
  };

  return (
    <Container>
      <Head>
        <title>Create {template.name} Collaboration</title>
        <meta
          name="description"
          content={`Create a new ${template.name} collaboration`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MobileNav collaborations={collaborations} />

      {isAnalyzing && <Loading />}

      <Main style={{ paddingBottom: "8rem" }}>
        <Title style={{ margin: "1rem 0", marginTop: "3rem" }}>
          <span>{template.name}</span>
        </Title>

        <QuestionsList>
          <SectionTitle size="small">Question Guide</SectionTitle>
          <Description size="small" style={{ textAlign: "center" }}>
            Answer the questions below to help us understand your project.
          </Description>
          {questions.map((question, index) => (
            <QuestionItem key={index}>
              <Label
                htmlFor={`question_${index}`}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  marginBottom: "0rem",
                }}
              >
                {question}
              </Label>
            </QuestionItem>
          ))}
        </QuestionsList>

        <RecordingContainer>
          <Transcriber onTranscriptSubmit={handleTranscriptSubmit} />
        </RecordingContainer>

        <ButtonGroup style={{ marginTop: "0rem" }}>
          <SecondaryButton
            onClick={() => {
              setManuallyInput(!manuallyInput);
            }}
          >
            Manually Input Transcript
          </SecondaryButton>
        </ButtonGroup>

        <Modal isOpen={manuallyInput} onClose={() => setManuallyInput(false)}>
          <FormContainer>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <TextArea
                  id="transcript"
                  name="transcript"
                  rows={6}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your voice transcript here..."
                />
              </FormGroup>

              <ButtonGroup style={{ marginTop: "0rem" }}>
                <PrimaryButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Collaboration"}
                </PrimaryButton>
              </ButtonGroup>
            </Form>
          </FormContainer>
        </Modal>
      </Main>
    </Container>
  );
};

export default TemplateCreatePage;

const Container = styled(LayoutContainer)`
  background-color: ${({ theme }) => theme.surface};
`;

const QuestionsList = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 2rem;
  background-color: ${({ theme }) => theme.background};
  box-shadow: 0 6px 16px ${({ theme }) => theme.shadow};
`;

const QuestionItem = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  line-height: 1.6;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  padding: 2rem;
  background-color: ${({ theme }) => theme.background};
`;

const RecordingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;
