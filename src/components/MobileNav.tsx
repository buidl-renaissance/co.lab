import React, { useState, useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { PrimaryButton } from "./Buttons";
import { useTheme } from "@/contexts/ThemeContext";
import { lightTheme, darkTheme } from "@/styles/theme";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: all 0.2s ease;
  }
`;

interface MobileNavProps {
  collaborations: Array<{
    id: string;
    title: string;
  }>;
}

const MobileNav: React.FC<MobileNavProps> = ({ collaborations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState<"left" | "right">("left");
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [sortedCollaborations, setSortedCollaborations] = useState(collaborations);

  // Sort collaborations by last opened
  useEffect(() => {
    try {
      const openedTimestamps = JSON.parse(localStorage.getItem('collaborationOpenedTimestamps') || '{}');
      
      const sorted = [...collaborations].sort((a, b) => {
        const timeA = openedTimestamps[a.id] || 0;
        const timeB = openedTimestamps[b.id] || 0;
        return timeB - timeA; // Sort in descending order (most recent first)
      });
      
      setSortedCollaborations(sorted);
    } catch (error) {
      console.error('Error sorting collaborations:', error);
      // If localStorage is not available (SSR), just use the original order
      setSortedCollaborations(collaborations);
    }
  }, [collaborations]);

  // Load preferences from localStorage on component mount
  useEffect(() => {
    try {
      const savedPosition = localStorage.getItem("drawerPosition");
      if (savedPosition === "left" || savedPosition === "right") {
        setDrawerPosition(savedPosition);
      }
      const savedShowManual = localStorage.getItem("showManualTranscriptButton");
      setShowManualTranscript(savedShowManual === "true");
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }
  }, []);

  // Handle body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close drawer when route changes
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router]);

  const toggleDrawerPosition = () => {
    try {
      const newPosition = drawerPosition === "left" ? "right" : "left";
      setDrawerPosition(newPosition);
      localStorage.setItem("drawerPosition", newPosition);
    } catch (error) {
      console.error("Error saving drawer position to localStorage:", error);
    }
  };

  const toggleManualTranscript = () => {
    try {
      const newValue = !showManualTranscript;
      setShowManualTranscript(newValue);
      localStorage.setItem("showManualTranscriptButton", String(newValue));
      // Dispatch custom event for same-window updates
      window.dispatchEvent(new CustomEvent('manualTranscriptSettingChanged', { detail: newValue }));
    } catch (error) {
      console.error("Error saving manual transcript setting to localStorage:", error);
    }
  };

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyle />
      <NavBar>
        <NavContent>
          <BrandLink href="/">
            <Brand>
              Co<span style={{ color: "#ff7a59" }}>.Lab</span>
            </Brand>
          </BrandLink>
        </NavContent>
      </NavBar>

      <FloatingMenuButton onClick={() => setIsOpen(true)}>
        <MenuIcon>☰</MenuIcon>
      </FloatingMenuButton>

      <Overlay isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <Drawer isOpen={isOpen} position={drawerPosition}>
        <DrawerHeader>
          <DrawerTitle>Collaborations</DrawerTitle>
          <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
        </DrawerHeader>

        <DrawerContent>
          <DrawerSection>
            {sortedCollaborations.map((collab) => (
              <DrawerLink
                key={collab.id}
                href={`/collab/${collab.id}`}
                onClick={() => setIsOpen(false)}
                isActive={router.query.id === collab.id}
              >
                {collab.title}
              </DrawerLink>
            ))}
          </DrawerSection>

          <DrawerActions>
            <ActionButtonsContainer>
              <CreateButton
                onClick={() => {
                  setIsOpen(false);
                  router.push("/create");
                }}
              >
                New Collaboration
              </CreateButton>
              <SettingsButton
                onClick={() => setIsSettingsOpen(true)}
                title="Settings"
              >
                <SettingsIcon>⚙️</SettingsIcon>
              </SettingsButton>
            </ActionButtonsContainer>
          </DrawerActions>
        </DrawerContent>
      </Drawer>

      <SettingsModal isOpen={isSettingsOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Settings</ModalTitle>
            <CloseButton onClick={() => setIsSettingsOpen(false)}>×</CloseButton>
          </ModalHeader>
          
          <SettingsSection>
            <SettingItem>
              <SettingLabel>Theme</SettingLabel>
              <SegmentedControl>
                <SegmentButton 
                  isActive={theme === "light"} 
                  onClick={toggleTheme}
                >
                  Light
                </SegmentButton>
                <SegmentButton 
                  isActive={theme === "dark"} 
                  onClick={toggleTheme}
                >
                  Dark
                </SegmentButton>
              </SegmentedControl>
            </SettingItem>

            <SettingItem>
              <SettingLabel>Drawer Position</SettingLabel>
              <SegmentedControl>
                <SegmentButton 
                  isActive={drawerPosition === "left"} 
                  onClick={toggleDrawerPosition}
                >
                  Left
                </SegmentButton>
                <SegmentButton 
                  isActive={drawerPosition === "right"} 
                  onClick={toggleDrawerPosition}
                >
                  Right
                </SegmentButton>
              </SegmentedControl>
            </SettingItem>

            <SettingItem>
              <SettingLabel>Manual Transcript Button</SettingLabel>
              <SegmentedControl>
                <SegmentButton 
                  isActive={showManualTranscript} 
                  onClick={toggleManualTranscript}
                >
                  Show
                </SegmentButton>
                <SegmentButton 
                  isActive={!showManualTranscript} 
                  onClick={toggleManualTranscript}
                >
                  Hide
                </SegmentButton>
              </SegmentedControl>
            </SettingItem>
          </SettingsSection>
        </ModalContent>
      </SettingsModal>
    </ThemeProvider>
  );
};

export default MobileNav;

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${({ theme }) => theme.background};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  z-index: 100;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
`;

const BrandLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Brand = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const FloatingMenuButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.backgroundAlt};
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadow};
  z-index: 10;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const MenuIcon = styled.span`
  line-height: 1;
  font-size: 1.8rem;
  margin-bottom: 0.2rem;
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.overlay};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s, visibility 0.3s;
  z-index: 100;
`;

const Drawer = styled.div<{ isOpen: boolean; position: "left" | "right" }>`
  position: fixed;
  top: 0;
  ${({ position }) => position}: 0;
  bottom: 0;
  width: 280px;
  background: ${({ theme }) => theme.background};
  transform: translateX(${({ isOpen, position }) =>
    isOpen ? "0" : position === "left" ? "-100%" : "100%"});
  transition: transform 0.3s ease-in-out;
  z-index: 101;
  box-shadow: ${({ theme }) => theme.shadow};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  touch-action: none;
`;

const DrawerHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const DrawerTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${({ theme }) => theme.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const DrawerSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.border} transparent`};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 3px;
  }

  /* Prevent scroll chaining */
  overscroll-behavior-y: contain;
  -ms-overflow-style: none;
`;

const DrawerLink = styled(Link)<{ isActive: boolean }>`
  display: block;
  padding: 12px 0;
  color: ${({ theme, isActive }) => isActive ? theme.accent : theme.text};
  text-decoration: none;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: all 0.2s;
  background: ${({ theme, isActive }) => isActive ? theme.surface : 'transparent'};
  padding-left: 1rem;
  border-left: 3px solid ${({ theme, isActive }) => isActive ? theme.accent : 'transparent'};

  &:hover {
    color: ${({ theme }) => theme.accent};
    background: ${({ theme }) => theme.surface};
  }
`;

const DrawerActions = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.border};
  flex-shrink: 0;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const CreateButton = styled(PrimaryButton)`
  flex: 1;
  font-size: 1rem;
  padding: 0.8rem 0.6rem;
`;

const SettingsButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.accent};
    color: white;
    border-color: ${({ theme }) => theme.accent};
  }
`;

const SettingsIcon = styled.span`
  font-size: 18px;
`;

const SettingsModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s, visibility 0.3s;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${({ theme }) => theme.text};
`;

const SettingsSection = styled.div`
  padding: 20px;
`;

const SettingItem = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 8px;
`;

const SegmentedControl = styled.div`
  display: flex;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
`;

const SegmentButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: ${({ isActive, theme }) => isActive ? theme.accent : "transparent"};
  color: ${({ isActive, theme }) => isActive ? "white" : theme.textSecondary};
  cursor: pointer;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: ${({ isActive, theme }) => isActive ? "white" : theme.accent};
  }
`;
