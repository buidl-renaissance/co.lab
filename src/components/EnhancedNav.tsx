import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PrimaryButton } from './Buttons';

interface EnhancedNavProps {
  templates?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  collaborations?: Array<{
    id: string;
    title: string;
  }>;
  clients?: Array<{
    id: string;
    name: string;
  }>;
}

const EnhancedNav: React.FC<EnhancedNavProps> = ({ templates, collaborations }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <NavContainer>
      <NavBar>
        <BrandLink href="/">
          <Brand>Co<span style={{ color: "#ff7a59" }}>.Lab</span></Brand>
        </BrandLink>
        
        <MenuSection>
          {templates && (
            <MenuButton 
              active={activeMenu === 'templates'}
              onClick={() => toggleMenu('templates')}
            >
              Templates
              {activeMenu === 'templates' && (
                <DropdownMenu>
                  {templates.map(template => (
                    <MenuItem key={template.id}>
                      <MenuLink href={`/template/${template.id}`}>
                        <MenuTitle>{template.name}</MenuTitle>
                        <MenuDescription>{template.description}</MenuDescription>
                      </MenuLink>
                    </MenuItem>
                  ))}
                </DropdownMenu>
              )}
            </MenuButton>
          )}

          {collaborations && (
            <MenuButton 
              active={activeMenu === 'collaborations'}
              onClick={() => toggleMenu('collaborations')}
            >
              Collaborations
              {activeMenu === 'collaborations' && (
                <DropdownMenu>
                  {collaborations.map(collab => (
                    <MenuItem key={collab.id}>
                      <MenuLink href={`/collab/${collab.id}`}>
                        <MenuTitle>{collab.title}</MenuTitle>
                      </MenuLink>
                    </MenuItem>
                  ))}
                </DropdownMenu>
              )}
            </MenuButton>
          )}

          <CreateButton onClick={() => router.push('/create')}>
            Create New
          </CreateButton>
        </MenuSection>
      </NavBar>
    </NavContainer>
  );
};

export default EnhancedNav;

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const NavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
`;

const BrandLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Brand = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
`;

const MenuSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const MenuButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: ${props => props.active ? '#ff7a59' : '#1C1C1E'};
  cursor: pointer;
  position: relative;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;

  &:hover {
    color: #ff7a59;
  }
`;

const CreateButton = styled(PrimaryButton)`
  margin-left: 1rem;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  min-width: 250px;
  margin-top: 0.5rem;
  z-index: 1000;
`;

const MenuItem = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

const MenuLink = styled.a`
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const MenuTitle = styled.div`
  font-weight: 500;
  color: #1C1C1E;
`;

const MenuDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
`; 