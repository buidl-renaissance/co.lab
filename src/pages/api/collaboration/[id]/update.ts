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
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { id } = req.query;
  const { transcript, transcriptIndex } = req.body;

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

  if (typeof transcriptIndex !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid transcript index'
    });
  }

  try {
    // Extract authenticated user from frame context
    const user = await getAuthenticatedUser(req);

    const collaboration = await getCollaborationById(id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        error: 'Collaboration not found'
      });
    }

    // Update the transcript at the specified index
    const transcripts = [...(collaboration.transcripts || [])];
    transcripts[transcriptIndex] = transcript;

    // Re-analyze all transcripts
    const updatedAnalysis = await analyzeTranscript(
      transcripts,
      collaboration.template,
      collaboration.analysis
    );

    // Build participants list - ensure authenticated user is included
    let participants = updatedAnalysis.participants || [];
    if (user && !participants.includes(user.id)) {
      participants = [user.id, ...participants];
    }

    // Update the collaboration
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
    });

    return res.status(200).json({
      success: true,
      data: updatedCollaboration || undefined
    });
  } catch (error) {
    console.error('Error updating transcript:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update transcript'
    });
  }
} 