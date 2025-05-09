import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Head from 'next/head';
import { Container, Main, Title, Description, Footer, FooterContent, FooterColumn } from '@/components/Layout';

const TermsSection = styled.section`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const TermsContent = styled.div`
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    margin: 2rem 0 1rem;
    font-size: 1.5rem;
    
    @media (min-width: 768px) {
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
    margin: 1rem 0;
    padding-left: 1.5rem;
    
    @media (min-width: 768px) {
      padding-left: 2rem;
    }
    
    li {
      margin-bottom: 0.5rem;
      line-height: 1.6;
      font-size: 0.95rem;
      
      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }
  }
`;

const TermsPage = () => {
  return (
    <Container>
      <Head>
        <title>Terms of Service - CollabFlow</title>
        <meta name="description" content="Terms of Service for CollabFlow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Main>
        <TermsSection>
          <Title>Terms of Service</Title>
          <Description>
            Last updated: {new Date().toLocaleDateString()}
          </Description>

          <TermsContent>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using CollabFlow, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using or accessing this site.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily use CollabFlow for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title,
              and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained on CollabFlow</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>

            <h2>3. User Content</h2>
            <p>
              Users retain all rights to their content. By using CollabFlow, you grant us a
              worldwide, non-exclusive license to use, reproduce, and display your content
              solely for the purpose of providing and improving our services.
            </p>

            <h2>4. Privacy</h2>
            <p>
              Your use of CollabFlow is also governed by our Privacy Policy. Please review our
              Privacy Policy, which also governs the site and informs users of our data
              collection practices.
            </p>

            <h2>5. Disclaimer</h2>
            <p>
              The materials on CollabFlow are provided on an &apos;as is&apos; basis. CollabFlow
              makes no warranties, expressed or implied, and hereby disclaims and negates all
              other warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </TermsContent>
        </TermsSection>
      </Main>

      <Footer>
        <FooterContent>
          <FooterColumn>
            <h3>COLLABFLOW</h3>
            <p>Built for Creators by Creators</p>
          </FooterColumn>
          <FooterColumn>
            <h3>COMPANY</h3>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
          </FooterColumn>
          <FooterColumn>
            <h3>LEGAL</h3>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/cookies">Cookies</Link>
          </FooterColumn>
        </FooterContent>
        <p>Concept by John Gulbronson, Nick Robb, and AJ</p>
      </Footer>
    </Container>
  );
};

export default TermsPage; 