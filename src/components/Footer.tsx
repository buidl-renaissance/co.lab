import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  width: 100%;
  padding: 2rem 1rem;
  background-color: #1C1C1E;
  color: #FAF9F6;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
  
  p {
    font-size: 0.9rem;
    margin: 1rem 0;
    text-align: center;
    @media (min-width: 768px) {
      text-align: left;
    }
  }
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    align-items: self-start;
    flex-direction: row;
    justify-content: space-around;
    max-width: 1200px;
    margin: 0 auto 2rem;
  }
`;

const FooterColumn = styled.div`
  width: 100%;
  margin: 0.5rem 0;
  text-align: center;

  @media (min-width: 768px) {
    width: auto;
    flex: 1;
    max-width: 250px;
    margin: 0 1.5rem;
    text-align: left;
  }

  h3 {
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #ffe169;
  }

  a {
    display: block;
    color: #faf9f6;
    margin-bottom: 0.5rem;
    text-decoration: none;

    &:hover {
      color: #6d9dc5;
    }
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContent>
        <FooterColumn>
          <h3>Co.Lab</h3>
          <p>Built for Creators by Creators</p>
        </FooterColumn>
        <FooterColumn>
          <h3>COMPANY</h3>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </FooterColumn>
        <FooterColumn>
          <h3>LEGAL</h3>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </FooterColumn>
      </FooterContent>
      <p>Concept by John Gulbronson, Nick Rob, and AJ</p>
    </FooterWrapper>
  );
};

export default Footer; 