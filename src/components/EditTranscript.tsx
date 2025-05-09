import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, SubmitButton, CancelButton } from "./Modal";
import { Label, TextArea } from "./Form";

interface EditTranscriptProps {
  transcript: string;
  onSubmit?: (transcript: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const EditTranscript: React.FC<EditTranscriptProps> = ({
  transcript,
  onSubmit,
  onClose,
  isOpen,
}) => {
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTranscript.trim() && onSubmit) {
      onSubmit(editedTranscript);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Label htmlFor="transcript">Edit transcript:</Label>
          <TextArea
            id="transcript"
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            placeholder="Edit your transcript here..."
            rows={10}
            required
          />
        </ModalBody>
        <ModalFooter>
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit">Save Changes</SubmitButton>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default EditTranscript; 