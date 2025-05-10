import React from 'react';
import styled from 'styled-components';

interface SectionHeaderProps {
  children: React.ReactNode;
  compact?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ children, compact = false }) => {
  return <StyledSectionHeader compact={compact}>{children}</StyledSectionHeader>;
};

export default SectionHeader;

const StyledSectionHeader = styled.h4<{ compact?: boolean }>`
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  margin-bottom: ${({ compact }) => compact ? '0.5rem' : '1rem'};
  font-size: ${({ compact }) => compact ? '1.1rem' : '1.1rem'};
  border-bottom: 2px solid ${({ theme }) => theme.border};
  padding-bottom: ${({ compact }) => compact ? '0.25rem' : '0.5rem'};
  margin-bottom: ${({ compact }) => compact ? '0' : '0.5rem'};
`; 