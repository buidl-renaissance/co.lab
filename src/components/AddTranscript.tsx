import React, { useState } from 'react';
import styled from 'styled-components';

interface AddTranscriptProps {
  onSubmit?: (transcript: string) => void;
}

const AddTranscript: React.FC<AddTranscriptProps> = ({ onSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTranscript('');
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
      <AddButton onClick={handleOpenModal}>
        <PlusIcon>+</PlusIcon>
        Add Transcript
      </AddButton>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>Add Transcript</h3>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>
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
                <SubmitButton type="submit">
                  Submit
                </SubmitButton>
              </ModalFooter>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default AddTranscript;

// Styled Components
const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FF7A59;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #E86C4D;
  }
`;

const PlusIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  
  h3 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    color: #1C1C1E;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #1C1C1E;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1C1C1E;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #FF7A59;
    box-shadow: 0 0 0 2px rgba(255, 122, 89, 0.2);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #FF7A59;
  color: white;
  border: none;
  
  &:hover {
    background-color: #E86C4D;
  }
`;
