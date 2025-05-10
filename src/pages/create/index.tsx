import React from "react";
import Head from "next/head";
import styled from "styled-components";
import { useRouter } from "next/router";
import { defaultTemplates } from "@/data/template";
import {
  Container,
  Main,
  Title,
  Description,
} from "@/components/Layout";
import { PrimaryButton } from "@/components/Buttons";
import EnhancedNav from "@/components/EnhancedNav";

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const TemplateTitle = styled.h3`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: #333;
`;

const TemplateDescription = styled.p`
  color: #666;
  margin: 0;
  line-height: 1.6;
`;

const CreatePage = () => {
  const router = useRouter();

  return (
    <Container>
      <Head>
        <title>Create New Collaboration | Co.Lab</title>
        <meta name="description" content="Choose a template to create a new collaboration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <EnhancedNav />

      <Main style={{ paddingTop: "88px" }}>
        <Title>Create New Collaboration</Title>
        <Description>
          Choose a template to get started with your new collaboration
        </Description>

        <TemplateGrid>
          {defaultTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              onClick={() => router.push(`/create/${template.id}`)}
            >
              <TemplateTitle>{template.name}</TemplateTitle>
              <TemplateDescription>{template.description}</TemplateDescription>
            </TemplateCard>
          ))}
        </TemplateGrid>
      </Main>
    </Container>
  );
};

export default CreatePage;
