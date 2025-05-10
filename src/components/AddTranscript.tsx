import React, { useState, useRef } from "react";
import styled from "styled-components";
import {
  Modal,
  ModalBody,
  ModalFooter,
  SubmitButton,
  CancelButton,
} from "./Modal";
import { Label, TextArea } from "./Form";

interface AddTranscriptProps {
  onSubmit?: (transcript: string) => void;
}

type Tabs = "text" | "audio";

const AddTranscript: React.FC<AddTranscriptProps> = ({ onSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [activeTab, setActiveTab] = useState<Tabs>("audio");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTranscript("");
    setActiveTab("audio");
    setIsRecording(false);
    setRecordingTime(0);
    setAudioUrl(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      if (onSubmit) {
        onSubmit(transcript);
      }
      handleCloseModal();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true, // Simplified audio constraints for better compatibility
      });

      // Check for Safari
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );

      // Use different MIME types based on browser
      let mimeType = "audio/webm;codecs=opus";
      if (isSafari) {
        mimeType = "audio/mp4";
      }

      // Check if the browser supports the requested MIME type
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback to default MIME type
        mimeType = "";
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // Increased bitrate for better quality
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/mp4", // Fallback type for Safari
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      // Start recording with smaller chunks for better memory management
      mediaRecorder.start(500);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Error accessing microphone. Please ensure you have granted microphone permissions."
      );
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Ensure we're in a recording state
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }

        // Stop all tracks
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach((track) => {
          track.stop();
          track.enabled = false;
        });

        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } catch (error) {
        console.error("Error stopping recording:", error);
        alert("Error stopping recording. Please try again.");
      }
    }
  };

  const handleAudioSubmit = async () => {
    if (audioChunksRef.current.length > 0) {
      setIsTranscribing(true);
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/mp4", // Use MP4 format for Safari compatibility
      });

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          const data = await response.json();

          if (data.success && data.transcript) {
            setTranscript(data.transcript);
            setActiveTab("text"); // Switch to text tab to show transcribed text
          } else {
            console.error("Error transcribing audio:", data.error);
            alert("Error transcribing audio. Please try again.");
          }
        } catch (error) {
          console.error("Error sending audio for transcription:", error);
          alert("Error sending audio for transcription. Please try again.");
        } finally {
          setIsTranscribing(false);
        }
      };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      <StickyRecordButton onClick={handleOpenModal}>🎙️</StickyRecordButton>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <TabContainer>
              <TabButton
                active={activeTab === "audio"}
                onClick={() => setActiveTab("audio")}
              >
                Record Audio
              </TabButton>
              <TabButton
                active={activeTab === "text"}
                onClick={() => setActiveTab("text")}
              >
                Text Input
              </TabButton>
            </TabContainer>

            {activeTab === "text" ? (
              <>
                <Label htmlFor="transcript">Paste your transcript below:</Label>
                <TextArea
                  id="transcript"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your conversation transcript here..."
                  rows={10}
                  required
                />
              </>
            ) : (
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
                      {isTranscribing ? "Transcribing..." : "Transcribe Audio"}
                    </SubmitButton>
                  </>
                )}
              </RecordingContainer>
            )}
          </ModalBody>

          <ModalFooter>
            <CancelButton type="button" onClick={handleCloseModal}>
              Cancel
            </CancelButton>
            <SubmitButton
              type="submit"
              disabled={!transcript.trim() || isTranscribing}
            >
              Submit
            </SubmitButton>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default AddTranscript;

const StickyRecordButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ff7a59;
  color: white;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 100;

  &:hover {
    transform: scale(1.1);
    background-color: #ff6a45;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  background-color: ${(props) => (props.active ? "#ff7a59" : "#f0f0f0")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.active ? "#ff6a45" : "#e0e0e0")};
  }
`;

const RecordingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
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
