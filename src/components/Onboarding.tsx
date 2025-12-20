import React from 'react';
import styled from 'styled-components';
import { useUser } from '@/contexts/UserContext';

const OnboardingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
`;

const ProfileImageContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.accent};
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accent}dd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: bold;
`;

const Username = styled.h2`
  font-family: "Space Grotesk", sans-serif;
  font-size: 2rem;
  margin: 0;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
`;

const WelcomeMessage = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  max-width: 600px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.border};
  border-top-color: ${({ theme }) => theme.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.error || '#ff4444'};
  font-size: 0.9rem;
`;

const Onboarding: React.FC = () => {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading your profile...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <OnboardingContainer>
        <ErrorMessage>Error loading profile: {error}</ErrorMessage>
      </OnboardingContainer>
    );
  }

  if (!user) {
    return null; // Don't show anything if user is not authenticated
  }

  const displayName = user.username || user.displayName || `User ${user.fid}`;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const [imageError, setImageError] = React.useState(false);

  return (
    <OnboardingContainer>
      <ProfileImageContainer>
        {user.pfpUrl && !imageError ? (
          <ProfileImage
            src={user.pfpUrl}
            alt={displayName}
            onError={() => setImageError(true)}
          />
        ) : (
          <DefaultAvatar>{initials}</DefaultAvatar>
        )}
      </ProfileImageContainer>
      <Username>Welcome, {displayName}!</Username>
      <WelcomeMessage>
        You're all set to start collaborating. Let's turn your conversations into structured projects.
      </WelcomeMessage>
    </OnboardingContainer>
  );
};

export default Onboarding;

