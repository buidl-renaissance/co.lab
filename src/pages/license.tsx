import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { Container, Main, Title, Description } from '@/components/Layout';
import Footer from '@/components/Footer';

const LicenseSection = styled.section`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const LicenseContent = styled.div`
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

const LicensePage = () => {
  return (
    <Container>
      <Head>
        <title>License | Co.Lab</title>
        <meta name="description" content="License information for Co.Lab" />
      </Head>
      <Main>
        <LicenseSection>
          <Title>License</Title>
          <Description>
            Co.Lab is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
          </Description>
          <LicenseContent>
            <p>
              This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
            </p>
            
            <p>
              To view a copy of this license, visit:
              <br />
              <a href="http://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer">
                http://creativecommons.org/licenses/by-nc/4.0/
              </a>
            </p>
            
            <h2>You are free to:</h2>
            <ul>
              <li><strong>Share</strong> — copy and redistribute the material in any medium or format</li>
              <li><strong>Adapt</strong> — remix, transform, and build upon the material</li>
            </ul>
            
            <h2>Under the following terms:</h2>
            <ul>
              <li><strong>Attribution</strong> — You must give appropriate credit, provide a link to the license, and indicate if changes were made.</li>
              <li><strong>NonCommercial</strong> — You may not use the material for commercial purposes.</li>
            </ul>
            
            <h2>Additional Information</h2>
            <p>
              No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.
            </p>
            
            <h2>Notices</h2>
            <p>
              You do not have to comply with the license for elements of the material in the public domain or where your use is permitted by an applicable exception or limitation.
            </p>
            
            <p>
              No warranties are given. The license may not give you all of the permissions necessary for your intended use. For example, other rights such as publicity, privacy, or moral rights may limit how you use the material.
            </p>
          </LicenseContent>
        </LicenseSection>
      </Main>
      <Footer />
    </Container>
  );
};

export default LicensePage;
