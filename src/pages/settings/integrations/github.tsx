import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { Container, Main, Section, SectionTitle, Description } from '@/components/Layout';
import { PrimaryButton } from '@/components/Buttons';
import Footer from '@/components/Footer';

const PageContainer = styled(Container)`
  padding: 0rem;
`;

const ContentSection = styled(Section)`
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 2px 8px ${({ theme }) => theme.shadow};
`;

const StatusCard = styled(Card)<{ variant?: 'success' | 'error' | 'default' }>`
  border-left: 4px solid ${({ theme, variant }) => {
    if (variant === 'success') return '#4caf50';
    if (variant === 'error') return '#f44336';
    return theme.accent;
  }};
`;

const StatusTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

const StatusMessage = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 1.5rem;
`;

const GitHubInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-top: 1rem;
`;

const GitHubIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const GitHubDetails = styled.div`
  flex: 1;
`;

const GitHubUsername = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.25rem;
`;

const GitHubMeta = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const ErrorList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const ErrorItem = styled.li`
  padding: 0.5rem 0;
  color: ${({ theme }) => theme.textSecondary};
  &::before {
    content: '⚠️ ';
    margin-right: 0.5rem;
  }
`;

const ConnectButton = styled(PrimaryButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

interface GitHubIntegrationPageProps {
  connected?: boolean;
  error?: string;
  githubAccount?: {
    githubLogin: string;
    createdAt: Date;
  } | null;
}

const GitHubIntegrationPage: React.FC<GitHubIntegrationPageProps> = ({
  connected: initialConnected,
  error: initialError,
  githubAccount,
}) => {
  const router = useRouter();
  const [connected, setConnected] = useState(initialConnected || false);
  const [error, setError] = useState<string | null>(initialError || null);

  useEffect(() => {
    // Check query params for connection status
    const { connected: queryConnected, error: queryError } = router.query;
    
    if (queryConnected === '1') {
      setConnected(true);
      setError(null);
      // Clean up URL after showing success
      router.replace('/settings/integrations/github', undefined, { shallow: true });
    }
    
    if (queryError) {
      setError(queryError as string);
      setConnected(false);
      // Clean up URL after showing error
      router.replace('/settings/integrations/github', undefined, { shallow: true });
    }
  }, [router.query, router]);

  const handleConnect = () => {
    window.location.href = '/api/github/oauth/start';
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'token_exchange_failed':
        return 'Failed to exchange authorization code for access token. Please try again.';
      case 'oauth_failed':
        return 'GitHub OAuth authorization failed. Please try again.';
      case 'user_fetch_failed':
        return 'Failed to fetch your GitHub user information. Please try again.';
      case 'oauth_exception':
        return 'An unexpected error occurred during the OAuth process. Please try again.';
      default:
        return 'An error occurred while connecting your GitHub account. Please try again.';
    }
  };

  return (
    <PageContainer>
      <Main>
        <ContentSection>
          <SectionTitle size="small">GitHub Integration</SectionTitle>
          <Description>
            Connect your GitHub account to link issues and pull requests to your collaborations.
          </Description>

          {connected || githubAccount ? (
            <StatusCard variant="success">
              <StatusTitle>✓ Connected</StatusTitle>
              <StatusMessage>
                Your GitHub account has been successfully connected. You can now link GitHub issues
                and pull requests to your collaborations.
              </StatusMessage>
              {githubAccount && (
                <GitHubInfo>
                  <GitHubIcon>🐙</GitHubIcon>
                  <GitHubDetails>
                    <GitHubUsername>@{githubAccount.githubLogin}</GitHubUsername>
                    <GitHubMeta>
                      Connected on {new Date(githubAccount.createdAt).toLocaleDateString()}
                    </GitHubMeta>
                  </GitHubDetails>
                </GitHubInfo>
              )}
              <ButtonContainer>
                <PrimaryButton onClick={handleConnect}>
                  Reconnect Account
                </PrimaryButton>
              </ButtonContainer>
            </StatusCard>
          ) : error ? (
            <StatusCard variant="error">
              <StatusTitle>Connection Failed</StatusTitle>
              <StatusMessage>{getErrorMessage(error)}</StatusMessage>
              <ErrorList>
                <ErrorItem>Make sure you authorized the application</ErrorItem>
                <ErrorItem>Check your internet connection</ErrorItem>
                <ErrorItem>Try again in a few moments</ErrorItem>
              </ErrorList>
              <ButtonContainer>
                <ConnectButton onClick={handleConnect}>
                  <span>🔗</span>
                  Try Again
                </ConnectButton>
              </ButtonContainer>
            </StatusCard>
          ) : (
            <Card>
              <StatusTitle>Connect Your GitHub Account</StatusTitle>
              <StatusMessage>
                By connecting your GitHub account, you'll be able to:
              </StatusMessage>
              <ul style={{ marginLeft: '1.5rem', color: 'inherit' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  Link GitHub issues to your collaborations
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Create and manage pull requests
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Sync collaboration status with GitHub
                </li>
              </ul>
              <ButtonContainer>
                <ConnectButton onClick={handleConnect}>
                  <span>🔗</span>
                  Connect GitHub Account
                </ConnectButton>
              </ButtonContainer>
            </Card>
          )}
        </ContentSection>
      </Main>
      <Footer />
    </PageContainer>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { connected, error } = context.query;

  // For now, we'll check connection status via query params
  // In the future, when proper auth is added, we can check the database
  // using the authenticated user's ID
  
  // TODO: When auth is implemented, fetch GitHub account like this:
  // const userId = getUserIdFromSession(context.req);
  // const githubAccount = await getGitHubAccountByUserId(userId);
  
  return {
    props: {
      connected: connected === '1' || false,
      error: (error as string) || null,
      githubAccount: null, // Will be populated when auth is added
    },
  };
};

export default GitHubIntegrationPage;

