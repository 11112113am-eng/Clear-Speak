/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { TranslationResult } from './components/TranslationResult';
import { DocumentQASection } from './components/DocumentQASection';
import { HistoryList } from './components/HistoryList';
import { AboutClearSpeak } from './components/AboutClearSpeak';
import { SimplificationResult, SavedTranslation } from './types';
import { SampleDocument } from './data/samples';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'clearspeak_history_v1';
const STORAGE_KEY_FONT_SIZE = 'clearspeak_font_size';
const STORAGE_KEY_FONT_FAMILY = 'clearspeak_font_family';
const STORAGE_KEY_HIGH_CONTRAST = 'clearspeak_high_contrast';

export default function App() {
  const [text, setText] = useState<string>('');
  const [category, setCategory] = useState<'legal' | 'medical' | 'government' | 'financial' | 'general'>('general');
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimplificationResult | null>(null);

  // Accessibility state
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem(STORAGE_KEY_FONT_SIZE) as any) || 'normal';
  });

  const [fontFamily, setFontFamily] = useState<'hyperlegible' | 'lexend' | 'sans'>(() => {
    return (localStorage.getItem(STORAGE_KEY_FONT_FAMILY) as any) || 'hyperlegible';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_HIGH_CONTRAST) === 'true';
  });

  // History state
  const [history, setHistory] = useState<SavedTranslation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save accessibility preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FONT_FAMILY, fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HIGH_CONTRAST, String(highContrast));
  }, [highContrast]);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  const handleSelectSample = (sample: SampleDocument) => {
    setText(sample.text);
    setCategory(sample.category);
    setError(null);
    // Smooth scroll to input area if needed
    const inputEl = document.getElementById('complex-text-input');
    if (inputEl) {
      inputEl.focus();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please paste or type text to simplify.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category, language: targetLanguage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to simplify text. Please try again.');
      }

      setResult(data);

      // Save to recent history (up to 10 items)
      const newItem: SavedTranslation = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalText: text,
        category,
        result: data,
      };

      setHistory((prev) => [newItem, ...prev.filter((i) => i.originalText !== text).slice(0, 9)]);

      // Scroll to result smoothly
      setTimeout(() => {
        const resultEl = document.getElementById('translation-result-card');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Error submitting simplification:', err);
      setError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: SavedTranslation) => {
    setText(item.originalText);
    setCategory(item.category as any);
    setResult(item.result);
    setError(null);
    setTimeout(() => {
      const resultEl = document.getElementById('translation-result-card');
      if (resultEl) {
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {}
  };

  const handleResetAccessibility = () => {
    setFontSize('normal');
    setFontFamily('hyperlegible');
    setHighContrast(false);
  };

  // Font family css class
  const fontClass =
    fontFamily === 'lexend'
      ? 'font-lexend'
      : fontFamily === 'sans'
      ? 'font-sans-custom'
      : 'font-hyperlegible';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${fontClass} ${
        highContrast ? 'bg-neutral-950 text-neutral-100' : 'bg-stone-50 text-stone-900'
      }`}
    >
      <Header
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        onResetAccessibility={handleResetAccessibility}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome / Mission Statement Bar */}
        <section
          id="hero-banner"
          className={`p-6 rounded-2xl border transition-all ${
            highContrast
              ? 'bg-neutral-900 border-neutral-700'
              : 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-stone-50 border-emerald-200/70'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  highContrast ? 'text-amber-400' : 'text-emerald-700'
                }`}
              >
                Accessibility Assistant for Social Good
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                Complex Notices Translated into Plain, Easy-to-Understand Language
              </h2>
              <p
                className={`text-sm max-w-3xl leading-relaxed ${
                  highContrast ? 'text-neutral-300' : 'text-stone-600'
                }`}
              >
                No confusing jargon. No legal maze. Get a clear summary, what it means for your life,
                and your exact next steps.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                  highContrast
                    ? 'bg-neutral-800 border-neutral-700 text-amber-300'
                    : 'bg-white border-emerald-200 text-emerald-800 shadow-2xs'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Free &amp; Compassionate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <InputSection
          text={text}
          setText={setText}
          category={category}
          setCategory={setCategory}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onSelectSample={handleSelectSample}
          error={error}
          highContrast={highContrast}
        />

        {/* Loading State Animation */}
        {isLoading && (
          <div
            id="loading-skeleton"
            className={`p-8 rounded-2xl border text-center space-y-4 animate-pulse ${
              highContrast ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-stone-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                Translating into compassionate, 5th-grade language...
              </h3>
              <p className="text-sm text-stone-500 dark:text-neutral-400 max-w-md mx-auto">
                Carefully breaking down complex terms into simple sentences, bullet points, and actionable next steps.
              </p>
            </div>
            <div className="max-w-md mx-auto h-2 bg-stone-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 w-2/3 animate-[pulse_1.5s_infinite]" />
            </div>
          </div>
        )}

        {/* Translation Output Result */}
        {result && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            <TranslationResult
              result={result}
              highContrast={highContrast}
              fontSize={fontSize}
            />
            <DocumentQASection
              originalText={text}
              category={category}
              highContrast={highContrast}
              dynamicQuestions={result.suggestedQuestions}
              language={targetLanguage}
            />
          </div>
        )}

        {/* History List */}
        <HistoryList
          history={history}
          onSelect={handleSelectHistory}
          onClear={handleClearHistory}
          highContrast={highContrast}
        />

        {/* About / Social Good Mission */}
        <AboutClearSpeak highContrast={highContrast} />
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-8 mt-12 transition-colors ${
          highContrast
            ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
            : 'bg-white border-stone-200 text-stone-500'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 dark:text-neutral-200">Clear-Speak</span>
            <span>&bull;</span>
            <span>Accessibility Assistant for Social Good</span>
          </div>
          <p className="text-center sm:text-right">
            Disclaimer: AI explanation assistant designed to clarify complex text, not a doctor or lawyer.
          </p>
        </div>
      </footer>
    </div>
  );
}
