import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";

interface DesktopSidebarProps {
  collaborations: Array<{
    id: string;
    title: string;
  }>;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ collaborations }) => {
  const router = useRouter();

  return (
    <Sidebar>
      <BrandLink href="/">
        <Brand>
          Co<span style={{ color: "#ff7a59" }}>.Lab</span>
        </Brand>
      </BrandLink>
      <CollaborationsList>
        {collaborations.map((collab) => (
          <CollaborationLink key={collab.id} href={`/collab/${collab.id}`}>
            <CollaborationItem active={router.query.id === collab.id}>
              <CollaborationTitle>{collab.title}</CollaborationTitle>
            </CollaborationItem>
          </CollaborationLink>
        ))}
      </CollaborationsList>
    </Sidebar>
  );
};

export default DesktopSidebar;

const Sidebar = styled.aside`
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: none;
  flex-direction: column;
  z-index: 100;

  @media (min-width: 769px) {
    display: flex;
  }
`;

const BrandLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const Brand = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1c1c1e;
  font-family: "Space Grotesk", sans-serif;
`;

const CollaborationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
`;

const CollaborationItem = styled.div<{ active: boolean }>`
  padding: 1rem;
  background-color: ${(props) => (props.active ? "#f0f0f0" : "transparent")};
  border-left: 3px solid
    ${(props) => (props.active ? "#ff7a59" : "transparent")};
  &:hover {
    background-color: #f4f4f4;
  }
`;

const CollaborationTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
`;

const CollaborationLink = styled.a`
  color: #1c1c1e;
  text-decoration: none;
  display: block;
  font-size: 1rem;

  &:hover {
    color: #ff7a59;
  }
`;
