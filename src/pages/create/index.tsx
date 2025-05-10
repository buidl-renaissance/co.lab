import React from "react";
import Head from "next/head";
import { Main as LayoutMain, Title, Description } from "@/components/Layout";
import MobileNav from "@/components/MobileNav";
import Templates from "@/components/Templates";
import styled from "styled-components";

const Main = styled(LayoutMain)`
  background-color: ${({ theme }) => theme.surface};
`;

const CreatePage = () => {
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

      <MobileNav collaborations={[]} />

      <Main full style={{ paddingTop: "88px" }}>
        <Title>Create New Collaboration</Title>
        <Description>
          Choose a template to get started with your new collaboration
        </Description>

        <Templates />
      </Main>
    </>
  );
};

export default CreatePage;
