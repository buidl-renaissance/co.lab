import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import { Container, Main, Title, Description } from "@/components/Layout";
import { Collaboration } from "@/data/collaboration";

const CollabsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-top: 2rem;
`;

const CollabCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CollabTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const CollabDescription = styled.p`
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1rem;
`;

const ViewButton = styled.a`
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #0069d9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  width: 100%;
`;

const CollabsPage = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);

  useEffect(() => {
    // Load collaborations from localStorage
    const storedCollabs = JSON.parse(localStorage.getItem('collaborations') || '[]');
    setCollaborations(storedCollabs);
  }, []);

  return (
    <Container>
      <Head>
        <title>My Collaborations | Collaborative Platform</title>
        <meta name="description" content="View your saved collaborations" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <Title>
          <span>My Collaborations</span>
        </Title>
        
        <Description>
          View and manage your saved collaborations
        </Description>

        {collaborations.length > 0 ? (
          <CollabsList>
            {collaborations.map((collab) => (
              <CollabCard key={collab.id}>
                <CollabTitle>{collab.title}</CollabTitle>
                <CollabDescription>
                  {collab.description.length > 100
                    ? `${collab.description.substring(0, 100)}...`
                    : collab.description}
                </CollabDescription>
                <Link href={`/collab/${collab.id}`} passHref>
                  <ViewButton>View Collaboration</ViewButton>
                </Link>
              </CollabCard>
            ))}
          </CollabsList>
        ) : (
          <EmptyState>
            <h3>No collaborations found</h3>
            <p>You haven&apos;t saved any collaborations yet.</p>
          </EmptyState>
        )}
      </Main>
    </Container>
  );
};

export default CollabsPage;
