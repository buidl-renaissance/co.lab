import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CoLabTitle = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 4rem;
  margin-bottom: 1rem;
  text-align: center;
  
  span {
    color: ${({ theme }) => theme.accent};
  }
`;

const TypingContainer = styled.span`
  display: inline-block;
  color: ${({ theme }) => theme.accent};
`;

const texts = ['.Create', '.Build', '.Lab'];

const CoLab: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseTime = 1000;
  
  useEffect(() => {
    const currentText = texts[textIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        setDisplayText(currentText.substring(0, displayText.length + 1));
        
        // If we've completed typing the word
        if (displayText.length === currentText.length) {
          // Pause before starting to delete
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting
        setDisplayText(currentText.substring(0, displayText.length - 1));
        
        // If we've deleted the word
        if (displayText.length === 0) {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);
    
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, texts]);
  
  return (
    <CoLabTitle>
      Co<TypingContainer>{displayText}</TypingContainer>
    </CoLabTitle>
  );
};

export default CoLab;
