import styled from "styled-components";

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  
  @media (min-width: 768px) {
    gap: 1rem;
  }
`;

const Button = styled.button`
  padding: 0.6rem 1.4rem;
  background-color: #ff7a59;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 122, 89, 0.2);
  align-self: center;
  width: 100%;
  max-width: 250px;

  @media (min-width: 768px) {
    padding: 0.9rem 2.2rem;
    font-size: 1.1rem;
    width: auto;
    max-width: 300px;
  }

  &:hover {
    background-color: #ff6a45;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(255, 122, 89, 0.3);
  }
`;

const PrimaryButton = styled.button`
  padding: 0.8rem 1.6rem;
  background-color: #FF7A59;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 122, 89, 0.2);
  width: 100%;
  
  @media (min-width: 768px) {
    padding: 0.9rem 2.2rem;
    font-size: 1.1rem;
    width: auto;
  }
  
  &:hover {
    background-color: #ff6a45;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(255, 122, 89, 0.3);
  }
`;

const SecondaryButton = styled.button`
  padding: 0.8rem 1.6rem;
  background-color: transparent;
  color: #6d9dc5;
  border: 2px solid #6d9dc5;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  @media (min-width: 768px) {
    padding: 0.9rem 2.2rem;
    font-size: 1.1rem;
    width: auto;
  }

  &:hover {
    background-color: rgba(109, 157, 197, 0.1);
    transform: translateY(-2px);
  }
`;

export { ButtonGroup, Button, PrimaryButton, SecondaryButton };
