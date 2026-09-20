import React, { useState } from 'react';
import { Send, HelpCircle, Loader, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface DocumentQASectionProps {
  originalText: string;
  category: 'legal' | 'medical' | 'government' | 'financial' | 'general';
  highContrast: boolean;
  dynamicQuestions?: string[];
  language?: string;
}

export const DocumentQASection: React.FC<DocumentQASectionProps> = ({
  originalText,
  category,
  highContrast,
  dynamicQuestions = [],
  language = 'en',
}) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested questions based on domain category to guide the user
  const suggestedQuestionsMap: Record<string, string[]> = {
    legal: [
      'What are my main obligations under this agreement?',
      'Are there any penalties, fees, or fines mentioned?',
      'How and when does this contract or lease end?',
    ],
    medical: [
      'Is there an exact copay, coinsurance, or balance due?',
      'Who do I contact to dispute this medical bill or report?',
      'What is the deadline to submit files or pay?',
    ],
    government: [
      'What specific benefits, payments, or actions is this notice about?',
      'What documents or files do I need to submit?',
      'What is the hard deadline for responding to this notice?',
    ],
    financial: [
      'What is the interest rate (APR) or fee structure?',
      'When is my next payment due and are there late fees?',
      'How do I cancel, dispute, or contact support about this fee?',
    ],
    general: [
      'Who is the sender of this notice and what do they want?',
      'What is the exact next step I must take right now?',
      'Is there a phone number or email to contact support?',
    ],
  };

  const suggestions = dynamicQuestions && dynamicQuestions.length > 0
    ? dynamicQuestions.slice(0, 3)
    : (suggestedQuestionsMap[category] || suggestedQuestionsMap.general);

  const handleSendQuestion = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message to list
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText,
          question: trimmed,
          category,
          language,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get an answer. Please try again.');
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Error asking question:', err);
      setError(err.message || 'Could not connect to Q&A system. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion(question);
    }
  };

  return (
    <section
      id="document-qa-section"
      className={`rounded-2xl border transition-all p-6 space-y-6 ${
        highContrast
          ? 'bg-neutral-900 border-neutral-700'
          : 'bg-white border-stone-200/90 shadow-xs'
      }`}
    >
      {/* Header section */}
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${highContrast ? 'bg-amber-400/15 text-amber-300' : 'bg-emerald-50 text-emerald-700'}`}>
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight">
            💬 Ask Clear-Speak Assistant
          </h3>
          <p className={`text-xs ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
            Ask specific questions about dates, numbers, requirements, or terms in this document.
          </p>
        </div>
      </div>



      {/* Conversation Area */}
      {messages.length > 0 && (
        <div
          className={`space-y-4 p-4 rounded-xl max-h-96 overflow-y-auto border ${
            highContrast ? 'bg-neutral-950 border-neutral-800' : 'bg-stone-50/50 border-stone-100'
          }`}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isUser
                      ? highContrast
                        ? 'bg-amber-400 text-neutral-950'
                        : 'bg-emerald-600 text-white'
                      : highContrast
                      ? 'bg-neutral-800 text-amber-300 border border-neutral-700'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {isUser ? 'U' : 'AI'}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? highContrast
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'bg-emerald-50 text-emerald-950 border border-emerald-100/50'
                      : highContrast
                      ? 'bg-neutral-900 text-neutral-100 border border-neutral-800'
                      : 'bg-white text-stone-800 border border-stone-200 shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${highContrast ? 'bg-neutral-800 text-amber-300 border border-neutral-700' : 'bg-stone-200 text-stone-800'}`}>
                AI
              </div>
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 font-medium ${highContrast ? 'bg-neutral-900 text-amber-300/80' : 'bg-stone-100 text-stone-500'}`}>
                <Loader className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-amber-400" />
                Finding details in notice...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input box */}
      <div className="space-y-3.5">
        {/* Suggested quick-click questions */}
        <div className="space-y-2">
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${highContrast ? 'text-amber-400' : 'text-stone-500'}`}>
            Suggested Questions (based on document content)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendQuestion(sug)}
                className={`text-left text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  highContrast
                    ? 'bg-neutral-800/60 border-neutral-700 hover:border-amber-400 hover:bg-neutral-800 text-neutral-300 disabled:opacity-50'
                    : 'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/20 text-stone-700 disabled:opacity-50'
                }`}
              >
                ❓ {sug}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            id="qa-input-field"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your specific question about this document here..."
            disabled={isLoading}
            className={`flex-1 text-sm px-4 py-3 rounded-xl border outline-none transition-all ${
              highContrast
                ? 'bg-neutral-950 border-neutral-700 focus:border-amber-400 text-white placeholder-neutral-500'
                : 'bg-stone-50 border-stone-200 focus:border-emerald-500 focus:bg-white text-stone-900 placeholder-stone-400'
            }`}
          />
          <button
            type="button"
            onClick={() => handleSendQuestion(question)}
            disabled={isLoading || !question.trim()}
            className={`px-4 rounded-xl flex items-center justify-center transition-all ${
              highContrast
                ? 'bg-amber-400 text-neutral-950 font-bold hover:bg-amber-300 disabled:opacity-40'
                : 'bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-2xs disabled:bg-stone-100 disabled:text-stone-400 disabled:shadow-none'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
};
