import React, { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import { useRouter } from "next/router";
import { defaultTemplates, templateQuestions, Template } from "@/data/template";
import { Container, Main, Title, Description } from "@/components/Layout";
import { Form, FormGroup, Label, TextArea } from "@/components/Form";
import { GetServerSidePropsContext } from "next";
import { Button, SecondaryButton, ButtonGroup } from "@/components/Buttons";

const QuestionsList = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 2rem;
  background-color: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
`;

const QuestionItem = styled.div`
  padding: 1.2rem 0;
  border-bottom: 1px solid #eee;
  line-height: 1.6;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  font-family: "Space Grotesk", sans-serif;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1c1c1e;
  font-size: 1.5rem;
`;

const TemplateHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const TemplateTag = styled.span`
  display: inline-block;
  background-color: #ffe169;
  color: #1c1c1e;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border-left-color: #FF7A59;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.h3`
  font-family: "Space Grotesk", sans-serif;
  color: #1c1c1e;
  margin-top: 1rem;
`;

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

  if (!template) {
    return <div>Template not found</div>;
  }

  const questions =
    templateQuestions[template.id as keyof typeof templateQuestions] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        console.error('Error creating collaboration:', data.error);
        setIsSubmitting(false);
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
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

      {isAnalyzing && (
        <LoadingOverlay>
          <Spinner />
          <LoadingText>Analyzing Transcript...</LoadingText>
        </LoadingOverlay>
      )}

      <Main>
        <TemplateHeader>
          <Title>
            <span>{template.name}</span>
          </Title>
          <TemplateTag>{template.tag}</TemplateTag>
        </TemplateHeader>

        <Description style={{ textAlign: "center" }}>
          Fill out the details below to set up your{" "}
          {template.name.toLowerCase()} collaboration.
        </Description>

        <QuestionsList>
          <SectionTitle>Template-Specific Questions</SectionTitle>
          {questions.map((question, index) => (
            <QuestionItem key={index}>
              <Label htmlFor={`question_${index}`} style={{ fontSize: "1.1rem", fontWeight: "500" }}>
                {question}
              </Label>
            </QuestionItem>
          ))}
        </QuestionsList>

        <FormContainer>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="transcript">Voice Transcript</Label>
              <TextArea
                id="transcript"
                name="transcript"
                rows={6}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your voice transcript here or record directly..."
              />
            </FormGroup>
            
            <ButtonGroup style={{ marginTop: '2rem' }}>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Collaboration"}
              </Button>
              <SecondaryButton type="button" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </SecondaryButton>
            </ButtonGroup>
          </Form>
        </FormContainer>
      </Main>
    </Container>
  );
};

export default TemplateCreatePage;
