import React, { useEffect } from "react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";
import { Container, Main, Section, SectionTitle } from "@/components/Layout";
import MobileNav from "@/components/MobileNav";
import Templates from "@/components/Templates";
import { useUser } from "@/contexts/UserContext";
import { useCollaborations } from "@/hooks/useCollaborations";
import { Loading } from "@/components/Loading";

const DashboardHeader = styled.div`
  width: 100%;
  padding: 1rem 1rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    padding-top: calc(60px + 0.75rem);
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProfileImageContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.accent};
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  font-size: 1.5rem;
  font-weight: bold;
  font-family: 'Space Grotesk', sans-serif;
`;

const WelcomeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Greeting = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.text};
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const SubGreeting = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const TemplatesSection = styled(Section)`
  background: ${({ theme }) => theme.surface};
  padding: 1rem 0;
`;

const CollaborationsSection = styled(Section)`
  background: ${({ theme }) => theme.background};
  padding: 1rem 1rem;
  align-items: flex-start;
`;

const CollabsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0;
  padding: 0;
`;

const CollabCard = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 1rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid ${({ theme }) => theme.border};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px ${({ theme }) => theme.shadow};
    border-color: ${({ theme }) => theme.accent};
  }
`;

const CollabTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const CollabDescription = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const ViewButton = styled.a`
  display: inline-block;
  background-color: ${({ theme }) => theme.accent};
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.accent}dd;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${({ theme }) => theme.surface};
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border: 2px dashed ${({ theme }) => theme.border};

  h3 {
    font-family: 'Space Grotesk', sans-serif;
    color: ${({ theme }) => theme.text};
    margin: 0 0 0.5rem 0;
  }

  p {
    color: ${({ theme }) => theme.textSecondary};
    margin: 0;
  }
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 1rem;
  text-align: left;
  white-space: nowrap;
  
  &::after {
    left: 0;
    transform: none;
  }
`;

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { collaborations, isLoading: isCollabsLoading } = useCollaborations(user?.username);
  const [imageError, setImageError] = React.useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  // Signal to Farcaster that the app is ready
  useEffect(() => {
    const callReady = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          await sdk.actions.ready();
        }
      } catch (error) {
        console.error('Error calling sdk.actions.ready():', error);
      }
    };

    callReady();
  }, []);

  const isLoading = isUserLoading || isCollabsLoading;

  // Show loading while checking auth
  if (isUserLoading) {
    return <Loading text="Loading..." />;
  }

  // Don't render anything while redirecting
  if (!user) {
    return null;
  }

  const displayName = user.username || user.displayName || `User ${user.fid}`;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Container>
      <Head>
        <title>Dashboard | Co.Lab</title>
        <meta name="description" content="Your Co.Lab dashboard - create and manage collaborations" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <MobileNav collaborations={collaborations} />

      <Main full>
        <DashboardHeader>
          <UserSection>
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
            <WelcomeText>
              <Greeting>Welcome, {displayName}!</Greeting>
              <SubGreeting>Ready to collaborate?</SubGreeting>
            </WelcomeText>
          </UserSection>
        </DashboardHeader>

        <TemplatesSection>
          <Templates />
        </TemplatesSection>

        <CollaborationsSection>
          <StyledSectionTitle>My Collaborations</StyledSectionTitle>
          
          {isLoading ? (
            <Loading text="Loading collaborations..." />
          ) : collaborations.length > 0 ? (
            <CollabsList>
              {collaborations.map((collab) => (
                <CollabCard key={collab.id}>
                  <CollabTitle>{collab.title}</CollabTitle>
                  <CollabDescription>
                    {collab.description.length > 120
                      ? `${collab.description.substring(0, 120)}...`
                      : collab.description}
                  </CollabDescription>
                  <Link href={`/collab/${collab.id}`} passHref legacyBehavior>
                    <ViewButton>View Collaboration</ViewButton>
                  </Link>
                </CollabCard>
              ))}
            </CollabsList>
          ) : (
            <EmptyState>
              <h3>No collaborations yet</h3>
              <p>Select a template above to start your first collaboration!</p>
            </EmptyState>
          )}
        </CollaborationsSection>
      </Main>
    </Container>
  );
};

export default DashboardPage;
