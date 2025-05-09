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
`;

export const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;
  background-color: #f5f4f0;
  
  &:focus {
    border-color: #6D9DC5;
    box-shadow: 0 0 0 2px rgba(109, 157, 197, 0.2);
    outline: none;
  }
`;

export const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;
  background-color: #f5f4f0;
  color: #1c1c1e;

  &:focus {
    border-color: #6D9DC5;
    box-shadow: 0 0 0 2px rgba(109, 157, 197, 0.2);
    outline: none;
  }
`;