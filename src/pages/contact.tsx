import React, { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { Container, Main, Title, Description } from '@/components/Layout';
import { Form, FormGroup, Label, Input, TextArea } from '@/components/Form';
import { ButtonGroup, PrimaryButton } from '@/components/Buttons';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! We will get back to you soon.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'There was an error sending your message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        type: 'error',
        message: 'There was an error sending your message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Head>
        <title>Contact Us | Co.Lab</title>
        <meta name="description" content="Get in touch with the Co.Lab team" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <Title>Contact <span>Us</span></Title>
        <Description>
          Have questions or feedback? We&apos;d love to hear from you.
        </Description>

        <ContactContainer>
          <ContactInfo>
            <InfoSection>
              <InfoTitle>Email</InfoTitle>
              <InfoText>hello@collabflow.com</InfoText>
            </InfoSection>
            <InfoSection>
              <InfoTitle>Location</InfoTitle>
              <InfoText>San Francisco, CA</InfoText>
            </InfoSection>
            <InfoSection>
              <InfoTitle>Follow Us</InfoTitle>
              <SocialLinks>
                <SocialLink href="https://twitter.com/collabflow" target="_blank" rel="noopener noreferrer">
                  Twitter
                </SocialLink>
                <SocialLink href="https://linkedin.com/company/collabflow" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </SocialLink>
                <SocialLink href="https://github.com/collabflow" target="_blank" rel="noopener noreferrer">
                  GitHub
                </SocialLink>
              </SocialLinks>
            </InfoSection>
          </ContactInfo>

          <ContactForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What&apos;s this about?"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="message">Message</Label>
              <TextArea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                rows={6}
                required
              />
            </FormGroup>

            {submitStatus.type && (
              <StatusMessage type={submitStatus.type}>
                {submitStatus.message}
              </StatusMessage>
            )}

            <ButtonGroup>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </PrimaryButton>
            </ButtonGroup>
          </ContactForm>
        </ContactContainer>
      </Main>
    </Container>
  );
};

export default ContactPage;

const ContactContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled.div`
  background-color: #f5f4f0;
  padding: 2rem;
  border-radius: 12px;
  height: fit-content;
`;

const InfoSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #1C1C1E;
`;

const InfoText = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  color: #ff7a59;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.2s;

  &:hover {
    color: #ff6a45;
  }
`;

const ContactForm = styled(Form)`
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' }>`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`; 