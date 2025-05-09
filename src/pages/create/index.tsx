import React, { useState, useRef } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Templates from '@/components/Templates';
import { Container, Main, Title } from '@/components/Layout';
import { Form, FormGroup, Label, Input, TextArea } from '@/components/Form';
import { ButtonGroup, Button, SecondaryButton } from '@/components/Buttons';

const FileUploadContainer = styled.div`
  width: 100%;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  
  &:hover {
    border-color: #FF7A59;
    background-color: rgba(255, 122, 89, 0.05);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #FF7A59;
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
`;

const FileName = styled.p`
  margin: 1rem 0 0 0;
  font-weight: 600;
  color: #1C1C1E;
  padding: 0.5rem 1rem;
  background-color: #f5f4f0;
  border-radius: 4px;
  display: inline-block;
`;

export const getServerSideProps = async () => {
  return {
    props: {
      metadata: {
        title: 'Create Conversation Template',
        description: 'Create a new conversation template',
      },
    },
  };
};

const CreatePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [transcript, setTranscript] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTranscript(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setTranscript(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the conversation template and transcript
    // For now, we'll just redirect back to home
    router.push('/');
  };

  return (
    <Container>
      <Head>
        <title>Create Conversation Template</title>
        <meta name="description" content="Create a new conversation template" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <Title>Create <span>Conversation</span> Template</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your conversation template"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea 
              id="description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this conversation template"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Upload Transcript</Label>
            <FileUploadContainer 
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <UploadIcon>📄</UploadIcon>
              <UploadText>
                Drag and drop your transcript file here, or click to browse
              </UploadText>
              <UploadText>
                Supported formats: .txt, .doc, .docx, .pdf
              </UploadText>
              {transcript && (
                <FileName>Selected file: {transcript.name}</FileName>
              )}
              <HiddenInput 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.doc,.docx,.pdf"
              />
            </FileUploadContainer>
          </FormGroup>
          
          <Templates
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
          
          <ButtonGroup>
            <Button type="submit">Create Template</Button>
            <SecondaryButton type="button" onClick={() => router.push('/')}>Cancel</SecondaryButton>
          </ButtonGroup>
        </Form>
      </Main>
    </Container>
  );
};

export default CreatePage;
