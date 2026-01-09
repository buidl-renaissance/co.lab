import { NextApiRequest, NextApiResponse } from 'next';
import { defaultTemplates, templateQuestions } from '@/data/template';
import { Collaboration } from '@/data/collaboration';
import { createCollaboration } from '@/db/collaboration';
import { analyzeTranscript } from '@/lib/analyze';
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
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { transcript, templateId } = req.body;

    if (!transcript || !templateId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: transcript and templateId' 
      });
    }

    // Extract authenticated user from frame context
    const user = await getAuthenticatedUser(req);
    
    // Find the template
    const template = defaultTemplates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ 
        success: false, 
        error: 'Template not found' 
      });
    }

    const analysis = await analyzeTranscript([transcript], template);
    console.log(analysis);

    // Get questions for this template
    const questions = templateQuestions[templateId as keyof typeof templateQuestions] || [];
    
    // Create initial answers object
    const answers: { [key: string]: string } = {};
    questions.forEach((question: string, index: number) => {
      answers[`question_${index}`] = '';
    });

    // Build participants list - include authenticated user if available
    let participants = analysis.participants || [];
    if (user && !participants.includes(user.id)) {
      participants = [user.id, ...participants];
    }

    const collaboration = await createCollaboration({
      title: analysis.title,
      description: analysis.description,
      template,
      participants,
      answers,
      status: 'active',
      analysis,
      transcripts: [transcript],
      summary: analysis.summary,
      createdByUserId: user?.id || null,
      // Include eventDetails for event templates
      eventDetails: templateId === 'event' && analysis.eventDetails ? analysis.eventDetails : undefined,
    });

    return res.status(200).json({
      success: true,
      data: collaboration
    });
    
  } catch (error) {
    console.error('Error creating collaboration:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create collaboration'
    });
  }
}
