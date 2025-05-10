import React from 'react';
import styled from 'styled-components';
import { Container as LayoutContainer, Main, Section, SectionTitle } from '@/components/Layout';
import Footer from '@/components/Footer';

const Container = styled(LayoutContainer)`
  padding: 0px;
`;

const AboutSection = styled(Section)`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const TeamSection = styled(Section)`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem;
  margin-top: 2rem;
  
  @media (min-width: 768px) {
    gap: 2rem;
    margin-top: 3rem;
  }
`;

const TeamMember = styled.div`
  text-align: center;
  padding: 1rem;
  
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    margin: 1rem 0 0.5rem;
    font-size: 1.2rem;
    
    @media (min-width: 768px) {
      font-size: 1.4rem;
    }
  }
  
  p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
    
    @media (min-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const MissionSection = styled(Section)`
  text-align: center;
`;

const MissionContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  
  p {
    font-size: 0.95rem;
    line-height: 1.6;
    
    @media (min-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

export const getServerSideProps = async () => {
  return {
    props: {
      metadata: {
        title: "About Co.Lab",
        description: "Learn about Co.Lab and our mission to transform collaborative work",
      },
    },
  };
};

const AboutPage = () => {
  return (
    <Container>
      <Main>
        <AboutSection>
          <SectionTitle>About Co.Lab</SectionTitle>
          <p>
            We&apos;re building the future of collaborative work, one conversation at a time.
          </p>
        </AboutSection>

        <MissionSection>
          <MissionContent>
            <SectionTitle>Our Mission</SectionTitle>
            <p>
              At Co.Lab, we believe that the best ideas come from natural conversations.
              Our mission is to bridge the gap between free-flowing discussions and structured
              project management, making it easier for teams to capture, organize, and act on
              their collaborative ideas.
            </p>
          </MissionContent>
        </MissionSection>

        <TeamSection alt>
          <SectionTitle>Meet the Team</SectionTitle>
          <TeamGrid>
            <TeamMember>
              <h3>John Gulbronson</h3>
              <p>Builder & Co-Creator</p>
            </TeamMember>
            <TeamMember>
              <h3>Nick Robinson</h3>
              <p>Co-Creator</p>
            </TeamMember>
            <TeamMember>
              <h3>AJ Nichols</h3>
              <p>Co-Creator</p>
            </TeamMember>
          </TeamGrid>
        </TeamSection>
      </Main>
      <Footer />
    </Container>
  );
};

export default AboutPage;