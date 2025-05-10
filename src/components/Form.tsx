import styled from "styled-components";

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  margin-bottom: 0.75rem;
  display: inline-block;
  color: ${({ theme }) => theme.text};
`;

export const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;
  background-color: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  
  &:focus {
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.accent}33`};
    outline: none;
  }
`;

export const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  width: 100%;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;
  background-color: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};

  &:focus {
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.accent}33`};
    outline: none;
  }
`;