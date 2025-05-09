import { NextApiRequest, NextApiResponse } from 'next';
import { getCollaborationById, updateCollaboration } from '@/db/collaboration';
import { analyzeTranscript } from '@/lib/analyze';
import { Collaboration } from '@/data/collaboration';

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

    // Update the collaboration with the new transcript and analysis
    const updatedCollaboration = await updateCollaboration(id, {
      title: updatedAnalysis.title,
      description: updatedAnalysis.description,
      template: collaboration.template,
      participants: updatedAnalysis.participants,
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
    console.error('Error adding transcript:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add transcript'
    });
  }
}
