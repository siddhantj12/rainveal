'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Bot, 
  User,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DetectiveChatbotProps {
  className?: string;
}

export function DetectiveChatbot({ className = '' }: DetectiveChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'investigation' | 'submission'>('investigation');
  const [hasSeenCallSheet, setHasSeenCallSheet] = useState(false);
  const [caseSolved, setCaseSolved] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Get current location and clues based on pathname
  const getCurrentLocation = () => {
    if (pathname.includes('/piano-closeup')) {
      return {
        location: 'piano-closeup',
        locationClues: ['grand piano keys', 'cracked E-flat key', 'piano bench', 'stage lighting']
      };
    } else if (pathname.includes('/security-room')) {
      return {
        location: 'security-room',
        locationClues: ['security monitors', 'working camera feed', 'surveillance equipment', 'control panel']
      };
    } else if (pathname.includes('/security-camera')) {
      return {
        location: 'security-camera',
        locationClues: ['woman leaving building', 'broken nail', 'exit door', 'nighttime footage', 'hurried departure']
      };
    } else if (pathname.includes('/theatre')) {
      return {
        location: 'theatre',
        locationClues: ['grand piano', 'stage lights', 'audience seats', 'curtains', 'microphone stand']
      };
    }
    return {
      location: 'unknown',
      locationClues: []
    };
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Check if player has seen the call sheet
  useEffect(() => {
    try {
      setHasSeenCallSheet(localStorage.getItem('rainveal:call-sheet-viewed') === '1');
    } catch {}
  }, [isOpen]); // Check when chat opens

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Get current location context
    const currentLocation = getCurrentLocation();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          caseId: 'theatre-case',
          mode: chatMode === 'submission' ? 'case-submission' : 'chat',
          conversationHistory: messages.slice(-10),
          scene: 'Theatre Performance Hall',
          phase: 'Initial exploration',
          context: 'Player is exploring the theatre.',
          discoveredClues: [],
          inferenceLog: [],
          location: currentLocation.location,
          locationClues: currentLocation.locationClues
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 500 && errorData.error?.includes('GEMINI_API_KEY')) {
          throw new Error('CHATBOT_OFFLINE');
        }
        throw new Error('Failed to get response from AI detective');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if Captain Claude declares the case solved
      const responseText = data.response.toLowerCase();
      const solvedPhrases = [
        "you've solved it completely",
        "you've solved it",
        "case solved",
        "correct. you've solved",
        "you solved it",
        "you saw through every layer",
        "well done, detective",
        "congratulations, detective"
      ];
      
      const isSolved = chatMode === 'submission' && solvedPhrases.some(phrase => responseText.includes(phrase));
      
      console.log('Captain Claude response:', data.response);
      console.log('Is case solved?', isSolved);
      
      if (isSolved) {
        console.log('🎉 CASE SOLVED! Showing end screen...');
        setCaseSolved(true);
      }
    } catch (error) {
      let errorContent = 'Sorry, I encountered an error. Please try again.';

      if (error instanceof Error && error.message === 'CHATBOT_OFFLINE') {
        errorContent = '🔧 Inspector Gemini is currently offline. The AI service needs to be configured with a valid API key. Please contact the system administrator or try again later.';
      }

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleSubmitCase = () => {
    setChatMode('submission');
    setMessages([]);
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '🎖️ **Captain Claude here.**\n\nInspector Gemini has forwarded your case file to me for review. I understand you have a theory regarding the Aurelia Moreau investigation.\n\nPlease present your findings:\n• Your theory about what occurred\n• Key evidence you uncovered\n• Any suspects or motives\n• Your conclusions\n\nI will evaluate your work carefully. Proceed when ready.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleBackToInvestigation = () => {
    setChatMode('investigation');
    setMessages([]);
  };

  return (
    <>
      {/* Game End Screen */}
      {caseSolved && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md">
          <div className="relative max-w-4xl w-[95vw] animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-6">
              {/* Success Badge Image */}
              <div className="relative w-full max-w-3xl mx-auto">
                <Image 
                  src="/success-badge.PNG" 
                  alt="Congrats on Solving the Mystery Case" 
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
              
              <button
                onClick={() => {
                  setCaseSolved(false);
                  setIsOpen(false);
                  setChatMode('investigation');
                  setMessages([]);
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
        {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
        >
          <img 
            src="/detective.png" 
            alt="Detective Chat" 
            className="w-35 h-35 object-contain hover:scale-110 transition-transform duration-200"
            onError={(e) => {
              // Fallback to emoji if image doesn't exist
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="w-35 h-35 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-2xl">🕵️</div>';
            }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`w-96 shadow-2xl transition-all duration-200 bg-black rounded-lg border border-gray-600 ${
          isMinimized ? 'h-16' : 'h-[500px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-black text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-gray-300" />
              <span className="font-semibold text-white">
                {chatMode === 'submission' ? 'Captain Claude' : 'Inspector Gemini'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              <div className="p-3 border-b border-gray-600 bg-gray-900">
                <div className="flex gap-2 flex-wrap">
                  {chatMode === 'investigation' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage("Tell me about this theatre case")}
                        disabled={isLoading}
                        className="text-xs text-gray-300 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Case Info
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage("Give me a hint about the mystery")}
                        disabled={isLoading}
                        className="text-xs text-gray-300 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                      >
                        <Bot className="w-3 h-3 mr-1" />
                        Hint
                      </Button>
                      {hasSeenCallSheet && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSubmitCase}
                          className="text-xs text-yellow-300 border-yellow-600 bg-yellow-900/30 hover:bg-yellow-800/50 hover:text-yellow-200 hover:border-yellow-500 font-semibold"
                        >
                          📋 Submit Case
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearChat}
                        className="text-xs text-gray-300 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                      >
                        Clear
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackToInvestigation}
                        className="text-xs text-gray-300 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                      >
                        ← Back to Investigation
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearChat}
                        className="text-xs text-gray-300 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                      >
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 h-[280px] overflow-y-auto bg-black">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-300 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-200">Welcome! I'm Inspector Gemini, your AI detective assistant.</p>
                    <p className="text-xs mt-2 text-gray-400">Ask me about the theatre mystery!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-gray-800 text-white border border-gray-600'
                              : 'bg-gray-900 text-gray-100 border border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-2 border border-gray-700">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          <span className="text-sm text-gray-200">Inspector Gemini is thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-600 bg-gray-900">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={chatMode === 'submission' ? "Present your case to Captain Claude..." : "Ask Inspector Gemini about the mystery..."}
                    disabled={isLoading}
                    className="flex-1 bg-gray-800 text-white placeholder-gray-400 border-gray-600 focus:border-gray-500 focus:ring-gray-500"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
      </div>
    </>
  );
}
