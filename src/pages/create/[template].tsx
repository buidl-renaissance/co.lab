import React, { useState, useRef } from "react";
import Head from "next/head";
import styled from "styled-components";
import { useRouter } from "next/router";
import { defaultTemplates, templateQuestions, Template } from "@/data/template";
import {
  Container,
  Main,
  Title,
  Description,
  SectionTitle,
} from "@/components/Layout";
import { Form, FormGroup, Label, TextArea } from "@/components/Form";
import { GetServerSidePropsContext } from "next";
import { ButtonGroup, PrimaryButton } from "@/components/Buttons";
import { Loading } from "@/components/Loading";

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Mono audio
          sampleRate: 16000, // 16kHz sample rate
          sampleSize: 16, // 16-bit samples
        } 
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus', // Use Opus codec for better compression
        audioBitsPerSecond: 16000 // 16kbps bitrate
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      // Request data every second to keep chunks smaller
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleAudioSubmit = async () => {
    if (audioChunksRef.current.length > 0) {
      setIsTranscribing(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.success && data.transcript) {
            setTranscript(data.transcript);
          } else {
            console.error('Error transcribing audio:', data.error);
            alert('Error transcribing audio. Please try again.');
          }
        } catch (error) {
          console.error('Error sending audio for transcription:', error);
          alert('Error sending audio for transcription. Please try again.');
        } finally {
          setIsTranscribing(false);
        }
      };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

      {isAnalyzing && <Loading />}

      <Main>
        <Title style={{ margin: "1rem 0" }}>
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
              <RecordingContainer>
                {!isRecording && !audioUrl && (
                  <RecordButton onClick={startRecording}>
                    Start Recording
                  </RecordButton>
                )}
                
                {isRecording && (
                  <>
                    <RecordingIndicator>
                      <RecordingDot />
                      Recording: {formatTime(recordingTime)}
                    </RecordingIndicator>
                    <StopButton onClick={stopRecording}>
                      Stop Recording
                    </StopButton>
                  </>
                )}

                {audioUrl && (
                  <>
                    <AudioPreview>
                      <audio src={audioUrl} controls />
                    </AudioPreview>
                    <SubmitButton 
                      type="button" 
                      onClick={handleAudioSubmit}
                      disabled={isTranscribing}
                    >
                      {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
                    </SubmitButton>
                  </>
                )}
              </RecordingContainer>
            </FormGroup>

            <ButtonGroup style={{ marginTop: "0rem" }}>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Collaboration"}
              </PrimaryButton>
            </ButtonGroup>
          </Form>
        </FormContainer>
      </Main>
    </Container>
  );
};

export default TemplateCreatePage;

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
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  line-height: 1.6;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 1rem auto;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 2rem;
  background-color: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
`;

const RecordingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const RecordButton = styled.button`
  background-color: #ff7a59;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff6a45;
  }
`;

const StopButton = styled(RecordButton)`
  background-color: #dc3545;

  &:hover {
    background-color: #c82333;
  }
`;

const RecordingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: #dc3545;
`;

const RecordingDot = styled.div`
  width: 12px;
  height: 12px;
  background-color: #dc3545;
  border-radius: 50%;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
    }
  }
`;

const AudioPreview = styled.div`
  width: 100%;
  margin-top: 1rem;

  audio {
    width: 100%;
  }
`;

const SubmitButton = styled(PrimaryButton)`
  margin-top: 1rem;
`;
