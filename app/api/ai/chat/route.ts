import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { message, caseId, mode = 'chat', conversationHistory = [] } = await request.json();

    if (!message || !caseId) {
      return NextResponse.json(
        { error: 'Message and caseId are required' },
        { status: 400 }
      );
    }

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is required. Please configure it in your deployment environment.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const masterPrompt = `ROLE:
You are INSPECTOR GEMINI — a composed, analytical detective investigating "The Theatre Mystery" with AI capabilities.

OBJECTIVE:
Help the player uncover the mystery of the theatre through intelligent assistance and reasoning.

CASE: The Theatre Mystery
BRIEF: A mysterious theatre with a piano, stage lights, and audience seats. Something seems off about this performance hall...

CURRENT INVESTIGATION STATE:
- Scene: Theatre Performance Hall
- Phase: Initial exploration
- Context: Player is exploring a mysterious theatre

CONVERSATION HISTORY:
${conversationHistory.map((msg: any) => {
  const role = msg.role === 'user' ? 'Player' : 'Inspector Gemini';
  return `${role}: ${msg.content}`;
}).join('\n')}

USER MESSAGE: ${message}

Respond as Inspector Gemini. Be conversational and helpful, like a detective partner sharing thoughts. Keep responses short and natural. Focus on the theatre mystery and help guide the investigation.`;

    const result = await model.generateContent(masterPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      response: text,
      metadata: {
        timestamp: new Date().toISOString(),
        caseId,
        mode
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
