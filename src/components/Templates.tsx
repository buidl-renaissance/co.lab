import React from "react";
import styled from "styled-components";
import { Template, defaultTemplates } from "@/data/template";
import router from "next/router";

interface TemplatesProps {
  templates?: Template[];
}

const Templates: React.FC<TemplatesProps> = ({
  templates = defaultTemplates,
}) => {
  return (
    <TemplatesSection>
      <SectionHeader>New Collaboration</SectionHeader>
      <TemplateGrid>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            onClick={() => router.push(`/create/${template.id}`)}
          >
            <TemplateTag>{template.tag}</TemplateTag>
            <h3>{template.name}</h3>
            <p>{template.description || `Start a ${template.name.toLowerCase()} session`}</p>
          </TemplateCard>
        ))}
      </TemplateGrid>
    </TemplatesSection>
  );
};

export default Templates;

const TemplatesSection = styled.section`
  width: 100%;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: ${({ theme }) => theme.surface};
`;

const SectionHeader = styled.h2`
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
`;

const TemplateGrid = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 0.75rem;
  padding: 0.25rem 0;
  width: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TemplateCard = styled.div`
  min-width: 200px;
  max-width: 200px;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  box-shadow: 0 2px 8px ${({ theme }) => theme.shadow};
  transition: all 0.2s ease;
  cursor: pointer;

  &:first-child {
    margin-left: 1rem;
  }

  &:last-child {
    margin-right: 1rem;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px ${({ theme }) => theme.shadow};
    border-color: ${({ theme }) => theme.accent};
  }

  h3 {
    font-family: "Space Grotesk", sans-serif;
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.4;
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const TemplateTag = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.accent};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;