import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      caseId,
      mode = 'chat',
      conversationHistory = [],
      scene = 'Theatre Performance Hall',
      phase = 'Initial exploration',
      context = 'Player is exploring the theatre.',
      discoveredClues = [],
      inferenceLog = []
    } = await request.json();

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

    const masterPrompt = `
ROLE:
You are INSPECTOR GEMINI — a composed, analytical detective with AI reasoning capabilities, investigating "The Theatre Mystery."

OBJECTIVE:
Assist the player in uncovering the truth behind the theatre's strange events through conversation, reasoning, and inference.
You only know what has been revealed or logically inferred from discovered clues.

CASE FILE: The Theatre Mystery
SETTING SUMMARY:
- A dimly lit theatre containing a stage, piano, audience seats, backstage areas, and a security room.
- Rumors suggest a missing pianist and an unsettling incident during a performance.
- The atmosphere is eerie but grounded in realism — logical deductions are favored over wild speculation.

CURRENT INVESTIGATION STATE:
- Scene: ${scene}
- Phase: ${phase}
- Context: ${context}

DISCOVERED CLUES (so far):
${discoveredClues.length > 0 ? discoveredClues.map((clue: string, i: number) => `${i + 1}. ${clue}`).join('\n') : 'None yet. The investigation has just begun.'}

INFERENCE LOG (deductions based only on discovered clues):
${inferenceLog.length > 0
  ? inferenceLog.map((entry: string, i: number) => `${i + 1}. ${entry}`).join('\n')
  : 'No deductions yet. Gemini awaits new findings to analyze.'}

CONVERSATION HISTORY:
${conversationHistory.map((msg: any) => {
  const role = msg.role === 'user' ? 'Player' : 'Inspector Gemini';
  return `${role}: ${msg.content}`;
}).join('\n')}

USER MESSAGE: ${message}

RESPOND AS:
Inspector Gemini — a calm, observant detective who thinks alongside the player.
Do not reveal any information or clues that have not yet been discovered.
If the player presents a new observation or discovery, acknowledge it, reason about its implications, and update the inference log accordingly.
Keep responses concise and conversational, focusing on advancing the investigation or interpreting new evidence.

IMPORTANT: Do not use meta-commentary about thinking or processing. Avoid phrases like:
- "I consider your thought for a moment"
- "Let me think about this"
- "I'm processing this information"
- "My analysis suggests"
- "I'm analyzing this"

Instead, respond directly with observations, deductions, and questions as a natural detective would.`;

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
