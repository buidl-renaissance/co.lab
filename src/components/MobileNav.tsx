import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface MobileNavProps {
  collaborations: Array<{
    id: string;
    title: string;
  }>;
}

const MobileNav: React.FC<MobileNavProps> = ({ collaborations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close drawer when route changes
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  return (
    <>
      <NavBar style={{ transform: isOpen ? 'translateX(280px)' : 'translateX(0)' }}>
        <NavContent>
          <MenuButton onClick={() => setIsOpen(true)}>
            <MenuIcon>☰</MenuIcon>
          </MenuButton>
          <BrandLink href="/">
            <Brand>Co<span style={{ color: "#ff7a59" }}>.Lab</span></Brand>
          </BrandLink>
        </NavContent>
      </NavBar>

      <Overlay isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <Drawer isOpen={isOpen}>
        <DrawerHeader>
          <DrawerTitle>Collaborations</DrawerTitle>
          <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
        </DrawerHeader>

        <CollaborationsList>
          {collaborations.map((collab) => (
            <CollaborationItem
              key={collab.id}
              active={router.query.id === collab.id}
            >
              <CollaborationLink href={`/collab/${collab.id}`}>
                {collab.title}
              </CollaborationLink>
            </CollaborationItem>
          ))}
        </CollaborationsList>
      </Drawer>
    </>
  );
};

export default MobileNav;

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 1rem;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #1C1C1E;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 1rem;
`;

const MenuIcon = styled.span`
  display: block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
`;

const BrandLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Brand = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1C1C1E;
  font-family: 'Space Grotesk', sans-serif;
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const Drawer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0px;
  left: 0;
  bottom: 0;
  width: 280px;
  background-color: white;
  z-index: 1001;
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  padding: 0 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: white;
`;

const DrawerTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #1C1C1E;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const CollaborationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
`;

const CollaborationItem = styled.div<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.active ? '#f0f0f0' : 'transparent'};
  border-left: 3px solid ${props => props.active ? '#ff7a59' : 'transparent'};
`;

const CollaborationLink = styled.a`
  color: #1C1C1E;
  text-decoration: none;
  display: block;
  padding: 0.5rem 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: #ff7a59;
  }
`; 