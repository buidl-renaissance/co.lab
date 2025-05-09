import { NextApiRequest, NextApiResponse } from 'next';
import { defaultTemplates, templateQuestions } from '@/data/template';
import { Collaboration } from '@/data/collaboration';
import { createCollaboration } from '@/db/collaboration';
import { analyzeTranscript } from '@/lib/analyze';

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

    // Find the template
    const template = defaultTemplates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ 
        success: false, 
        error: 'Template not found' 
      });
    }

    const analysis = await analyzeTranscript(transcript, template);
    console.log(analysis);

    // Get questions for this template
    const questions = templateQuestions[templateId as keyof typeof templateQuestions] || [];
    
    // Create initial answers object
    const answers: { [key: string]: string } = {};
    questions.forEach((question: string, index: number) => {
      answers[`question_${index}`] = '';
    });

    const collaboration = await createCollaboration({
      title: analysis.title,
      description: analysis.description,
      template,
      participants: analysis.participants,
      answers,
      status: 'active',
      analysis
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
