import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Share2,
  HeartHandshake,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { SimplificationResult } from '../types';

interface TranslationResultProps {
  result: SimplificationResult;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const TranslationResult: React.FC<TranslationResultProps> = ({
  result,
  highContrast,
  fontSize,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [activeSpeechSection, setActiveSpeechSection] = useState<number | null>(null);
  const [showPrintHint, setShowPrintHint] = useState(false);
  const [highlightTermsEnabled, setHighlightTermsEnabled] = useState(true);

  // Web Speech API text-to-speech
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.fullFormattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    setShowPrintHint(true);
    // Give brief delay to show print hint on UI before invoking blocking browser print dialog
    setTimeout(() => {
      window.print();
    }, 400);
    // Dismiss print hint after 8 seconds
    setTimeout(() => {
      setShowPrintHint(false);
    }, 8000);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveSpeechSection(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare speech text
    const textToSpeak = `Here is your plain English explanation. 
First, the short version: ${result.shortVersion}. 
Second, what this means for you: ${result.whatThisMeans.join('. ')}. 
Third, next steps: ${result.nextSteps}. 
${result.disclaimer}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setActiveSpeechSection(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setActiveSpeechSection(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Helper function to safely escape regex characters
  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Dynamic helper to highlight jargon terms inside simplified texts
  const renderTextWithHighlights = (text: string) => {
    if (!highlightTermsEnabled || !result.keyTermsExplained || result.keyTermsExplained.length === 0) {
      return <span>{text}</span>;
    }

    const validTerms = result.keyTermsExplained.filter(
      (t) => t.term && t.term.trim().length > 0
    );
    if (validTerms.length === 0) {
      return <span>{text}</span>;
    }

    // Sort by descending length so longer terms are matched first (to prevent sub-word matching bugs)
    const sortedTerms = [...validTerms].sort((a, b) => b.term.length - a.term.length);
    const pattern = `\\b(${sortedTerms.map((t) => escapeRegExp(t.term)).join('|')})\\b`;

    let regex;
    try {
      regex = new RegExp(pattern, 'gi');
    } catch (e) {
      return <span>{text}</span>;
    }

    const parts = text.split(regex);
    if (parts.length === 1) {
      return <span>{text}</span>;
    }

    return (
      <>
        {parts.map((part, index) => {
          // Odd elements correspond to regex matches in a captured split
          if (index % 2 === 1) {
            const matchText = part;
            const termItem =
              sortedTerms.find((t) => t.term.toLowerCase() === matchText.toLowerCase()) ||
              sortedTerms[0];

            return (
              <span
                key={index}
                className="relative group inline-block font-semibold bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100 px-1 py-0.5 rounded cursor-help border-b-2 border-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-all print:bg-transparent print:border-none print:p-0 print:font-normal print:text-inherit"
              >
                {matchText}
                {/* Visual hovering tooltip details */}
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-stone-900 text-white text-[11px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-50 font-normal">
                  <span className="font-bold text-emerald-400 block mb-0.5">
                    "{termItem.term}" means:
                  </span>
                  {termItem.simpleMeaning}
                  {/* Tooltip pointer arrow */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-stone-900"></span>
                </span>
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  // Font size classes
  const bodyTextClass =
    fontSize === 'xlarge'
      ? 'text-xl leading-relaxed'
      : fontSize === 'large'
      ? 'text-lg leading-relaxed'
      : 'text-base leading-normal';

  const headingTextClass =
    fontSize === 'xlarge'
      ? 'text-2xl'
      : fontSize === 'large'
      ? 'text-xl'
      : 'text-lg';

  return (
    <div
      id="translation-result-card"
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        highContrast
          ? 'bg-neutral-900 border-neutral-700 text-white'
          : 'bg-white border-stone-200 shadow-sm'
      }`}
    >
      {/* Top Banner / Toolbar */}
      <div
        className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          highContrast
            ? 'bg-neutral-800/80 border-neutral-700'
            : 'bg-emerald-50/70 border-emerald-100'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              highContrast ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <span>Plain English Translation</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  highContrast
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Easy to Understand
              </span>
            </h2>
            {result.originalGradeLevel && (
              <p className={`text-xs ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
                Simplified from: <span className="font-medium">{result.originalGradeLevel}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Read Aloud */}
          <button
            id="read-aloud-btn"
            type="button"
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
              isPlaying
                ? highContrast
                  ? 'bg-amber-400 text-black border-amber-400'
                  : 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                : highContrast
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 shadow-2xs'
            }`}
            title="Listen to the text read aloud"
          >
            {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            <span>{isPlaying ? 'Stop Listening' : 'Listen Aloud'}</span>
          </button>

          {/* Copy Text */}
          <button
            id="copy-translation-btn"
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : highContrast
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 shadow-2xs'
            }`}
            title="Copy structured response"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-stone-500" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Print */}
          <button
            id="print-btn"
            type="button"
            onClick={handlePrint}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
              highContrast
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 shadow-2xs'
            }`}
            title="Save as PDF or print this explanation"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Save PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Helpful Hint on How to Save as PDF */}
      {showPrintHint && (
        <div
          id="print-pdf-hint"
          className="mx-6 sm:mx-8 mt-4 p-4 rounded-xl text-xs flex items-start gap-3 bg-teal-50/90 border border-teal-200 text-teal-900 animate-fadeIn print:hidden"
        >
          <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 text-teal-800 text-xs font-bold">
            i
          </div>
          <div className="flex-1">
            <p className="font-semibold">How to download as PDF:</p>
            <p className="mt-0.5 text-stone-700 leading-relaxed">
              The print options menu is opening now. In the <strong>"Destination"</strong> or <strong>"Printer"</strong> dropdown, select <strong>"Save as PDF"</strong> (or <strong>"Microsoft Print to PDF"</strong>) and click Save!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPrintHint(false)}
            className="text-stone-400 hover:text-stone-600 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 3-Section Output */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Printable Document Header (Only visible on paper / PDF export) */}
        <div className="hidden print:block border-b-2 border-stone-800 pb-5 mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Clear-Speak</h1>
              <p className="text-sm font-medium text-stone-600 mt-1">Plain, Compassionate English Translation</p>
            </div>
            <div className="text-right text-xs text-stone-500">
              <p className="font-semibold text-stone-700">Simplified Document Report</p>
              <p className="mt-1">Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              {result.category && (
                <p className="mt-0.5 font-medium text-emerald-800 capitalize">Domain: {result.category}</p>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Highlighting Toggle */}
        {result.keyTermsExplained && result.keyTermsExplained.length > 0 && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden transition-all ${
            highContrast
              ? 'bg-neutral-800/50 border-neutral-700'
              : 'bg-stone-50 border-stone-200 shadow-2xs'
          }`}>
            <div className="flex items-start sm:items-center gap-2.5">
              <span className={`flex h-2 w-2 rounded-full mt-1.5 sm:mt-0 ${
                highlightTermsEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
              }`}></span>
              <div>
                <p className="font-bold text-stone-800 dark:text-neutral-200">
                  Highlight Difficult Words:
                </p>
                <p className={`text-stone-500 dark:text-neutral-400 mt-0.5 ${
                  fontSize === 'xlarge' ? 'text-sm' : fontSize === 'large' ? 'text-xs' : 'text-[11px]'
                }`}>
                  Spot complex legal, medical, or financial terms in the translation and hover to view definitions.
                </p>
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setHighlightTermsEnabled(!highlightTermsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  highlightTermsEnabled ? 'bg-emerald-600' : 'bg-stone-200'
                }`}
                role="switch"
                aria-checked={highlightTermsEnabled}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    highlightTermsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="ml-2 font-semibold text-stone-700 dark:text-neutral-200">
                {highlightTermsEnabled ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        )}

        {/* Key Document Highlights Section */}
        {result.highlights && result.highlights.length > 0 && (
          <div
            id="document-key-highlights"
            className={`p-5 sm:p-6 rounded-2xl border transition-all ${
              highContrast
                ? 'bg-neutral-800/90 border-amber-400/40 text-white'
                : 'bg-amber-50/20 border-amber-200/60 text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center text-sm font-bold shadow-3xs ${
                highContrast ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                ★
              </span>
              <div>
                <h3 className={`font-bold tracking-tight ${headingTextClass} ${
                  highContrast ? 'text-amber-300' : 'text-amber-900'
                }`}>
                  Key Document Highlights
                </h3>
                <p className={`text-xs mt-0.5 ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
                  Critical figures, hard deadlines, actions, or crucial details found in the text.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {result.highlights.map((highlight, hIdx) => (
                <div
                  key={hIdx}
                  className={`p-4 rounded-xl border text-sm leading-relaxed flex items-start gap-3 transition-all ${
                    highContrast
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                      : 'bg-white border-amber-100/60 text-stone-700 hover:border-amber-200 shadow-3xs'
                  }`}
                >
                  <span className={`text-base select-none mt-0.5 shrink-0`}>
                    📌
                  </span>
                  <p className={`${bodyTextClass} font-medium`}>{renderTextWithHighlights(highlight)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: The Short Version */}
        <section
          id="section-short-version"
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            highContrast
              ? 'bg-neutral-800/90 border-amber-400/40 text-white'
              : 'bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border-emerald-200/80 text-stone-900'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                highContrast ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <h3 className={`font-bold tracking-tight ${headingTextClass} ${
              highContrast ? 'text-amber-300' : 'text-emerald-950'
            }`}>
              1. The Short Version:
            </h3>
          </div>
          <p className={`${bodyTextClass} font-medium text-stone-800 dark:text-neutral-100 leading-relaxed`}>
            {renderTextWithHighlights(result.shortVersion)}
          </p>
        </section>

        {/* Section 2: What This Means for You */}
        <section
          id="section-what-this-means"
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            highContrast
              ? 'bg-neutral-800/90 border-neutral-700'
              : 'bg-stone-50/70 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                highContrast ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
              }`}
            >
              2
            </span>
            <h3 className={`font-bold tracking-tight ${headingTextClass} ${
              highContrast ? 'text-white' : 'text-stone-900'
            }`}>
              2. What This Means for You:
            </h3>
          </div>

          <ul className="space-y-3">
            {result.whatThisMeans.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-stone-800 dark:text-neutral-200"
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                    highContrast
                      ? 'bg-amber-400/20 text-amber-400'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className={`${bodyTextClass} leading-relaxed`}>{renderTextWithHighlights(item)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 3: Next Steps */}
        <section
          id="section-next-steps"
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            highContrast
              ? 'bg-neutral-800/90 border-amber-400/60'
              : 'bg-amber-50/50 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                highContrast ? 'bg-amber-400 text-black' : 'bg-amber-600 text-white'
              }`}
            >
              3
            </span>
            <h3 className={`font-bold tracking-tight ${headingTextClass} ${
              highContrast ? 'text-amber-300' : 'text-amber-950'
            }`}>
              3. Next Steps:
            </h3>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                highContrast
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-amber-200 text-amber-900'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </div>
            <p className={`${bodyTextClass} font-medium text-stone-900 dark:text-neutral-100 leading-relaxed`}>
              {renderTextWithHighlights(result.nextSteps)}
            </p>
          </div>
        </section>

        {/* Bottom Interactive Toolbar for Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={toggleSpeech}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3.5 rounded-xl border transition-all shadow-2xs cursor-pointer ${
              isPlaying
                ? highContrast
                  ? 'bg-amber-400 text-black border-amber-400'
                  : 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                : highContrast
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Listen to Explanation (Read Aloud)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3.5 rounded-xl border transition-all shadow-2xs cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : highContrast
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span>Copy Explanation</span>
              </>
            )}
          </button>
        </div>

        {/* Optional Jargon Breakdown if terms are present */}
        {result.keyTermsExplained && result.keyTermsExplained.length > 0 && (
          <section
            id="section-jargon-breakdown"
            className={`p-5 rounded-2xl border transition-all ${
              highContrast
                ? 'bg-neutral-800/60 border-neutral-700'
                : 'bg-stone-50/80 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className={`w-4 h-4 ${highContrast ? 'text-amber-400' : 'text-emerald-600'}`} />
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Difficult Words Explained:
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.keyTermsExplained.map((termItem, tIdx) => (
                <div
                  key={tIdx}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    highContrast
                      ? 'bg-neutral-900/80 border-neutral-700 text-neutral-300'
                      : 'bg-white border-stone-200 text-stone-700'
                  }`}
                >
                  <p className="font-semibold text-stone-900 dark:text-white">
                    "{termItem.term}"
                  </p>
                  <p className={`mt-0.5 ${highContrast ? 'text-amber-300' : 'text-emerald-700 font-medium'}`}>
                    → {termItem.simpleMeaning}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mandatory Disclaimer */}
        <div
          id="disclaimer-notice"
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
            highContrast
              ? 'bg-neutral-950 border-neutral-700 text-neutral-400'
              : 'bg-stone-100/90 border-stone-200 text-stone-600'
          }`}
          role="note"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-stone-400 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-stone-700 dark:text-neutral-300">Important Note: </span>
            {result.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
