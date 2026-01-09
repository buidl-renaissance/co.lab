import { NextApiRequest, NextApiResponse } from 'next';
import { getCollaborationById, updateCollaboration } from '@/db/collaboration';
import { analyzeTranscript } from '@/lib/analyze';
import { Collaboration } from '@/data/collaboration';
import { getAuthenticatedUser } from '@/lib/middleware/farcasterUser';

type ResponseData = {
  success: boolean;
  data?: Collaboration;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { id } = req.query;
  const { transcript } = req.body;

  console.log('id', id);
  console.log('transcript', transcript);
  console.log('req.body', req.body);

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing or invalid collaboration ID' 
    });
  }

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid transcript'
    });
  }

  try {
    // Extract authenticated user from frame context
    const user = await getAuthenticatedUser(req);

    // Get the existing collaboration
    const collaboration = await getCollaborationById(id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        error: 'Collaboration not found'
      });
    }

    // Analyze the new transcript
    const updatedAnalysis = await analyzeTranscript(
      [...(collaboration.transcripts || []), transcript], 
      collaboration.template,
      collaboration.analysis
    );

    // Add the new transcript to the existing ones
    const transcripts = [...(collaboration.transcripts || []), transcript];

    // Build participants list - merge existing participants with new ones from analysis
    // Start with existing participants to maintain them
    const existingParticipants = collaboration.participants || [];
    const newParticipants = updatedAnalysis.participants || [];
    
    // Merge: keep all existing, add new ones that aren't already included
    let participants = [...existingParticipants];
    for (const participant of newParticipants) {
      if (!participants.includes(participant)) {
        participants.push(participant);
      }
    }
    
    // Ensure authenticated user's username is included
    if (user?.username && !participants.includes(user.username)) {
      participants = [user.username, ...participants];
    }

    // Update the collaboration with the new transcript and analysis
    const updatedCollaboration = await updateCollaboration(id, {
      title: updatedAnalysis.title,
      description: updatedAnalysis.description,
      template: collaboration.template,
      participants,
      answers: updatedAnalysis.answers.reduce((acc, answer) => {
        acc[answer.question] = answer.answer;
        return acc;
      }, {} as { [key: string]: string }),
      status: collaboration.status,
      analysis: updatedAnalysis,
      transcripts,
      summary: updatedAnalysis.summary,
      // Update eventDetails for event templates (merge with existing to preserve flyerUrl)
      eventDetails: collaboration.template.id === 'event' && updatedAnalysis.eventDetails
        ? {
            ...collaboration.eventDetails,
            ...updatedAnalysis.eventDetails,
            // Preserve existing flyerUrl if not provided in new analysis
            flyerUrl: updatedAnalysis.eventDetails.flyerUrl || collaboration.eventDetails?.flyerUrl,
          }
        : collaboration.eventDetails,
    });

    return res.status(200).json({
      success: true,
      data: updatedCollaboration || undefined
    });
  } catch (error) {
    console.error('Error adding transcript:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add transcript'
    });
  }
}
