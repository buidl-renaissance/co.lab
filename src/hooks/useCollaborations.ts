import { useState, useEffect, useCallback } from 'react';
import { Collaboration } from '@/data/collaboration';

/**
 * Hook to manage collaborations
 * @param username - Optional username to fetch collaborations for
 * @returns Object containing collaborations and methods to manage them
 */
export const useCollaborations = (username?: string | null) => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load collaborations from API or localStorage
  const loadCollaborations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (username) {
        // Fetch from API when username is available
        const response = await fetch(`/api/collaborations?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch collaborations from server');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setCollaborations(data.data);
          // Also cache to localStorage for offline fallback
          localStorage.setItem('collaborations', JSON.stringify(data.data));
        } else {
          throw new Error(data.error || 'Failed to load collaborations');
        }
      } else {
        // Fall back to localStorage when no username
        const storedCollabs = localStorage.getItem('collaborations');
        const localCollabs = storedCollabs ? JSON.parse(storedCollabs) : [];
        setCollaborations(localCollabs);
      }
    } catch (err) {
      console.error('Error loading collaborations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Fall back to localStorage on error
      try {
        const storedCollabs = localStorage.getItem('collaborations');
        const localCollabs = storedCollabs ? JSON.parse(storedCollabs) : [];
        setCollaborations(localCollabs);
      } catch {
        setCollaborations([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  // Load collaborations on mount and when userId changes
  useEffect(() => {
    loadCollaborations();
  }, [loadCollaborations]);

  // Add a new collaboration
  const addCollaboration = (collaboration: Collaboration) => {
    const updatedCollabs = [...collaborations, collaboration];
    setCollaborations(updatedCollabs);
    localStorage.setItem('collaborations', JSON.stringify(updatedCollabs));
    return collaboration;
  };

  // Update an existing collaboration
  const updateCollaboration = (updatedCollab: Collaboration) => {
    const updatedCollabs = collaborations.map(collab => 
      collab.id === updatedCollab.id ? updatedCollab : collab
    );
    setCollaborations(updatedCollabs);
    localStorage.setItem('collaborations', JSON.stringify(updatedCollabs));
    return updatedCollab;
  };

  // Refresh collaborations from the server
  const refreshCollaborations = () => {
    loadCollaborations();
  };

  return {
    collaborations,
    isLoading,
    error,
    addCollaboration,
    updateCollaboration,
    refreshCollaborations
  };
};
