import React, { useState } from 'react';
import styled from 'styled-components';
import { Section } from '@/components/Layout';

interface Action {
  action: string;
  description: string;
  completed: boolean;
}

interface NextStepsProps {
  actions?: Action[];
}

const NextSteps: React.FC<NextStepsProps> = ({ actions = [] }) => {
  const [showCompleted, setShowCompleted] = useState(true);
  
  const filteredActions = showCompleted 
    ? actions 
    : actions.filter(action => !action.completed);
  
  const completedCount = actions.filter(action => action.completed).length;
  
  return (
    <NextStepsSection>
      <HeaderContainer>
        <NextStepsTitle>Next Action Steps</NextStepsTitle>
        {actions.length > 0 && completedCount > 0 && (
          <ToggleButton onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </ToggleButton>
        )}
      </HeaderContainer>
      <StepsList>
        {filteredActions && filteredActions.length > 0 ? (
          filteredActions.map((action, index) => (
            <StepItem key={index} completed={action.completed}>
              <strong>{action.action}</strong>: {action.description}
            </StepItem>
          ))
        ) : (
          <StepItem completed={false}>
            {actions.length > 0 ? 'No incomplete steps remaining' : 'No action steps found'}
          </StepItem>
        )}
      </StepsList>
    </NextStepsSection>
  );
};

export default NextSteps;

const NextStepsSection = styled(Section)`
  background: ${({ theme }) => theme.surface};
  border-left: 4px solid ${({ theme }) => theme.accent};
  text-align: left;
  align-items: flex-start;
  padding: 1rem;
  width: 100%;
  max-width: 900px;
  margin: 1.5rem auto;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
`;

const NextStepsTitle = styled.h3`
  margin-bottom: 0;
  word-break: break-word;
  color: ${({ theme }) => theme.accent};
`;

const ToggleButton = styled.button`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  
  &:hover {
    background-color: ${({ theme }) => theme.backgroundAlt};
    color: ${({ theme }) => theme.text};
  }
`;

const StepsList = styled.ul`
  padding-left: 1.5rem;
  margin-right: 1rem;
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

const StepItem = styled.li<{ completed: boolean }>`
  margin-bottom: 0.5rem;
  word-break: break-word;
  text-decoration: ${({ completed }) => completed ? 'line-through' : 'none'};
`; 