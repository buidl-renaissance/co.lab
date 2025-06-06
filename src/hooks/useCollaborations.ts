import { useState, useEffect } from 'react';
import { Collaboration } from '@/data/collaboration';

/**
 * Hook to manage collaborations from localStorage
 * @returns Object containing collaborations and methods to manage them
 */
export const useCollaborations = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load collaborations from localStorage on initial render
  useEffect(() => {
    try {
      setIsLoading(true);
      const storedCollabs = localStorage.getItem('collaborations');
      const localCollabs = storedCollabs ? JSON.parse(storedCollabs) : [];
      setCollaborations(localCollabs);
      setError(null);
    } catch (err) {
      console.error('Error loading collaborations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return {
    collaborations,
    isLoading,
    error,
    addCollaboration,
    updateCollaboration
  };
};
