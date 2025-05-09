import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Head from 'next/head';
import { Container, Main, Title, Description } from '@/components/Layout';
import Footer from '@/components/Footer';

const PrivacySection = styled.section`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const PrivacyContent = styled.div`
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    margin: 1.5rem 0 0.75rem;
    font-size: 1.5rem;
    
    @media (min-width: 768px) {
      margin: 2rem 0 1rem;
      font-size: 1.8rem;
    }
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
    font-size: 0.95rem;
    
    @media (min-width: 768px) {
      font-size: 1rem;
    }
  }

  ul {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
    
    @media (min-width: 768px) {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    li {
      margin-bottom: 0.5rem;
      line-height: 1.5;
      font-size: 0.95rem;
      
      @media (min-width: 768px) {
        line-height: 1.6;
        font-size: 1rem;
      }
    }
  }
`;

const PrivacyPage = () => {
  return (
    <Container>
      <Head>
        <title>Privacy Policy - Co.Lab</title>
        <meta name="description" content="Privacy Policy for Co.Lab" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Main>
        <PrivacySection>
          <Title>Privacy Policy</Title>
          <Description>
            Last updated: {new Date().toLocaleDateString()}
          </Description>

          <PrivacyContent>
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul>
              <li>Account information (name, email address)</li>
              <li>Collaboration content and transcripts</li>
              <li>Usage data and preferences</li>
              <li>Communication preferences</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not share your personal information with third parties except in the following
              circumstances:
            </p>
            <ul>
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>

            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              john@builddetroit.xyz
            </p>
          </PrivacyContent>
        </PrivacySection>
      </Main>
      <Footer />
    </Container>
  );
};

export default PrivacyPage; 