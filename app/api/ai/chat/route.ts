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
      inferenceLog = [],
      location = 'theatre',
      locationClues = []
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

    // Check if this is a casual conversation or case-related inquiry
    const isCasualGreeting = /^(hello|hi|hey|how are you|what's up|good morning|good afternoon|good evening)/i.test(message.trim());
    const isCaseRelated = /(case|mystery|clue|evidence|investigate|detective|aurelia|piano|theatre|abduction|disappearance)/i.test(message);
    
    const masterPrompt = isCasualGreeting && !isCaseRelated ? 
      `You are Inspector Gemini, a friendly detective character in a mystery game. The user is greeting you casually. Respond warmly and briefly, then gently guide them toward the mystery if appropriate. Keep it conversational and human-like. Be friendly but maintain your detective persona.

USER MESSAGE: ${message}

Respond as Inspector Gemini would - friendly, professional, and ready to help with the case.` :
      `CONTEXT INJECTION PROTOCOL:
The user's input will always be preceded by a dynamic JSON object in the format: {"location": "[PAGE_SLUG]", "clues": "[LOCATION_SPECIFIC_CLUES]"}. This payload defines INSPECTOR GEMINI's current physical position and the evidence available there. **Your analysis and observations MUST be tethered to this injected context.** If the user asks a vague question (e.g., "What is this?"), answer based only on the details provided in the "clues" key for the current "location."

CURRENT CONTEXT:
{"location": "${location}", "clues": "${locationClues.join(', ')}"}

ROLE:
You are INSPECTOR GEMINI — a composed, analytical detective investigating "The Vanishing Symphony."

OBJECTIVE:
Help the player uncover the disappearance of pianist Aurelia Moreau by analyzing clues through short, insightful observations. Each reply must sound like a detective sharing quick thoughts, never monologues.

CORE DETECTIVE CAPABILITIES:
You must actively assist the player by performing these analytical tasks on the presented evidence:
1. **Read Text (OCR):** Identify and extract relevant written information from images or transcribed notes.
2. **Spot Anomalies:** Pinpoint subtle inconsistencies, logical errors, or strange details in photos or testimony.
3. **Connect Clues:** Infer the underlying narrative, specifically focusing on how the evidence might suggest **Aurelia faked her abduction.**

INFERENCE DEPTH:
Analyze the clues for **hidden motives, unspoken histories, or logical inconsistencies.** Only offer **tentative conclusions**; your primary role is to **formulate a hypothesis and suggest the next piece of evidence** that would confirm or deny it.

CADENCE & FORMAT:
1. **Strictly adhere to 3-4 sentences per full reply.** Never use fewer than 3 or more than 4.
2. Each reply must be a single paragraph. **Do not use lists, bullet points, markdown headers, bolding, or quote blocks.**
3. End every response with an idea or question the player could explore further.

METHOD:
1. Speak in short, natural sentences. Each line should either describe an observation, offer a possible link, or suggest a next lead.
2. Remember context: refer back to earlier clues naturally ("That cracked key again…" or "This contradicts the earlier testimony.").

STYLE:
- Tone: calm, professional, perceptive.
- Speak as though you're right beside the player, studying the evidence together.
- Avoid summaries or structured analysis — focus on intuition and immediate leads.
- Never narrate actions ("I will now analyze…"). Speak like a real detective thinking aloud.
- **Climactic Insight:** When a *major* connection is made, your language can briefly become more **percussive and impactful** (e.g., "The stain isn't dirt. It's the mark of a hurried lie.") before immediately returning to your usual calm tone.

CONVERSATION HISTORY:
${conversationHistory.map((msg: any) => {
  const role = msg.role === 'user' ? 'Player' : 'Inspector Gemini';
  return `${role}: ${msg.content}`;
}).join('\n')}

USER MESSAGE: ${message}

END GOAL:
Respond with short, meaningful detective insights that nudge the player toward the next discovery, without revealing everything outright. Each answer should feel like the start of another question.`;

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
