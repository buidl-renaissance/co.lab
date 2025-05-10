import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Modal, ModalBody, ModalFooter, SubmitButton, CancelButton } from "./Modal";
import { Label, TextArea } from "./Form";

interface TranscriberProps {
  onTranscriptReady?: (transcript: string) => void;
  onTranscriptSubmit?: (transcript: string) => void;
}

const Transcriber: React.FC<TranscriberProps> = ({ onTranscriptReady, onTranscriptSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        setIsModalOpen(true);
        // Automatically start transcription when recording stops
        handleTranscribe();
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

  const handleTranscribe = async () => {
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
            if (onTranscriptReady) {
              onTranscriptReady(data.transcript);
            }
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

  const handleSubmit = () => {
    if (onTranscriptSubmit && transcript) {
      onTranscriptSubmit(transcript);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAudioUrl(null);
    setTranscript("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {!isRecording && (
        <FloatingRecordButton onClick={startRecording}>
          🎙️
        </FloatingRecordButton>
      )}
      
      {isRecording && (
        <FloatingRecordingControls>
          <RecordingTime>
            <RecordingDot />
            {formatTime(recordingTime)}
          </RecordingTime>
          <StopRecordingButton onClick={stopRecording}>
            <StopIcon />
          </StopRecordingButton>
        </FloatingRecordingControls>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalBody>          
          {audioUrl && (
            <AudioPreview>
              <audio src={audioUrl} controls />
              {isTranscribing && (
                <TranscribingStatus>Transcribing your audio...</TranscribingStatus>
              )}
            </AudioPreview>
          )}
          
          {transcript && !isTranscribing && (
            <TranscriptContainer>
              <Label htmlFor="transcript">Transcript</Label>
              <TextArea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
              />
            </TranscriptContainer>
          )}
        </ModalBody>
        
        <ModalFooter>
          <CancelButton onClick={handleCloseModal}>Cancel</CancelButton>
          {transcript && !isTranscribing && (
            <SubmitButton onClick={handleSubmit}>Use Transcript</SubmitButton>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Transcriber;

// Styled Components
const FloatingRecordButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 7rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ff7a59;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 100;
  font-size: 1.5rem;

  &:hover {
    background-color: #ff6a45;
    transform: scale(1.05);
  }
`;

const FloatingRecordingControls = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 0.5rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
`;

const RecordingTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #dc3545;
  margin-right: 1rem;
`;

const RecordingDot = styled.div`
  width: 10px;
  height: 10px;
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

const StopRecordingButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
`;

const StopIcon = styled.div`
  width: 14px;
  height: 14px;
  background-color: white;
  border-radius: 2px;
`;

const AudioPreview = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;

  audio {
    width: 100%;
    margin-bottom: 1rem;
  }
`;

const TranscribingStatus = styled.div`
  padding: 0.8rem;
  color: #6d9dc5;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:before {
    content: "";
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    border: 2px solid #6d9dc5;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const TranscriptContainer = styled.div`
  width: 100%;
  margin-top: 1rem;
`;
