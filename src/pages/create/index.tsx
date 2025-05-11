import React from "react";
import Head from "next/head";
import { Main as LayoutMain, Title, Description, Hero } from "@/components/Layout";
import MobileNav from "@/components/MobileNav";
import Templates from "@/components/Templates";
import styled from "styled-components";
import { useCollaborations } from "@/hooks/useCollaborations";

const Main = styled(LayoutMain)`
  background-color: ${({ theme }) => theme.surface};
`;

const CreatePage = () => {
  const { collaborations } = useCollaborations(); 
  return (
    <>
      <Head>
        <title>Create New Collaboration | Co.Lab</title>
        <meta
          name="description"
          content="Choose a template to create a new collaboration"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MobileNav collaborations={collaborations} />

      <Main full style={{ paddingTop: "88px" }}>
        <Hero>          
          <Title>Create New Collaboration</Title>
          <Description>
            Choose a template to get started with your new collaboration
        </Description>
        </Hero>

        <Templates />
      </Main>
    </>
  );
};

export default CreatePage;
