import React from "react";
import styled from "styled-components";
import { Template, defaultTemplates } from "@/data/template";

interface TemplatesProps {
    templates?: Template[];
    selectedTemplate?: string;
    setSelectedTemplate?: (id: string) => void;
  }  

const Templates: React.FC<TemplatesProps> = ({
  templates = defaultTemplates,
  selectedTemplate,
  setSelectedTemplate,
}) => {
  return (
    <TemplatesSection>
      <SectionTitle>Choose Your Template</SectionTitle>
      <TemplateGrid>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            selected={selectedTemplate === template.id}
            onClick={() => setSelectedTemplate?.(template.id)}
          >
            <TemplateTag>{template.tag}</TemplateTag>
            <h3>{template.name}</h3>
            <p>
              Pre-configured structure and prompts designed specifically for{" "}
              {template.name.toLowerCase()} collaborations.
            </p>
          </TemplateCard>
        ))}
      </TemplateGrid>
    </TemplatesSection>
  );
};

export default Templates;

const TemplatesSection = styled.section`
  width: 100%;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f4f0;
`;

const SectionTitle = styled.h2`
  font-family: "Space Grotesk", sans-serif;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: #ffe169;
  }
`;

const TemplateGrid = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1.5rem;
  padding: 1rem 0;
  width: 100%;
  max-width: 1200px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #6d9dc5;
    border-radius: 6px;
  }
`;

const TemplateCard = styled.div<{ selected: boolean }>`
  min-width: 280px;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${(props) => (props.selected ? "#FF7A59" : "#e0e0e0")};
  background-color: white;
  box-shadow: ${(props) =>
    props.selected
      ? "0 8px 20px rgba(255, 122, 89, 0.15)"
      : "0 4px 12px rgba(0, 0, 0, 0.05)"};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: ${(props) => (props.selected ? "#FF7A59" : "#6D9DC5")};
  }

  h3 {
    font-family: "Space Grotesk", sans-serif;
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
    color: ${(props) => (props.selected ? "#FF7A59" : "#1C1C1E")};
  }

  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const TemplateTag = styled.span`
  display: inline-block;
  background-color: #ffe169;
  color: #1c1c1e;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
