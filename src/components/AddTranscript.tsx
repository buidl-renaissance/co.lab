import React, { useState } from "react";
import styled from "styled-components";
import { Modal, ModalBody, ModalFooter, SubmitButton, CancelButton } from "./Modal";
import { Label, TextArea } from "./Form";

interface AddTranscriptProps {
  onSubmit?: (transcript: string) => void;
}

const AddTranscript: React.FC<AddTranscriptProps> = ({ onSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTranscript("");
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

  return (
    <>
      <StickyRecordButton onClick={handleOpenModal}>🎙️</StickyRecordButton>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Label htmlFor="transcript">Paste your transcript below:</Label>
            <TextArea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your conversation transcript here..."
              rows={10}
              required
            />
          </ModalBody>
          <ModalFooter>
            <CancelButton type="button" onClick={handleCloseModal}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit">Submit</SubmitButton>
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
