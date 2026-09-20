import React from 'react';
import { Sparkles, Heart, Type, Eye, Volume2, Sun, Moon, RotateCcw } from 'lucide-react';

interface HeaderProps {
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  fontFamily: 'hyperlegible' | 'lexend' | 'sans';
  setFontFamily: (font: 'hyperlegible' | 'lexend' | 'sans') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  onResetAccessibility: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  highContrast,
  setHighContrast,
  onResetAccessibility,
}) => {
  return (
    <header
      id="app-header"
      className={`border-b transition-colors duration-200 ${
        highContrast
          ? 'bg-neutral-900 border-neutral-700 text-white'
          : 'bg-white/90 backdrop-blur-md border-stone-200 text-stone-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                highContrast
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Clear-Speak</h1>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium tracking-wide ${
                    highContrast
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  Accessibility for Social Good
                </span>
              </div>
              <p
                className={`text-sm mt-0.5 ${
                  highContrast ? 'text-neutral-300' : 'text-stone-500'
                }`}
              >
                Translating legal, medical, government, and financial jargon into easy-to-read, compassionate language.
              </p>
            </div>
          </div>

          {/* Accessibility Control Toolbar */}
          <div
            className={`flex flex-wrap items-center gap-2 p-1.5 rounded-xl border ${
              highContrast
                ? 'bg-neutral-800 border-neutral-700'
                : 'bg-stone-100/80 border-stone-200'
            }`}
            role="toolbar"
            aria-label="Reading and accessibility options"
          >
            {/* Font Family Selector */}
            <div className="flex items-center gap-1">
              <span className={`text-xs px-2 font-medium ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
                Font:
              </span>
              <button
                id="font-hyperlegible-btn"
                onClick={() => setFontFamily('hyperlegible')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  fontFamily === 'hyperlegible'
                    ? highContrast
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-white shadow-xs text-stone-900 font-semibold'
                    : highContrast
                    ? 'text-neutral-300 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Atkinson Hyperlegible: Designed for maximum reading accessibility"
              >
                Hyperlegible
              </button>
              <button
                id="font-lexend-btn"
                onClick={() => setFontFamily('lexend')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  fontFamily === 'lexend'
                    ? highContrast
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-white shadow-xs text-stone-900 font-semibold'
                    : highContrast
                    ? 'text-neutral-300 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Lexend: Empirically proven to improve reading fluency"
              >
                Lexend
              </button>
            </div>

            <div className={`h-4 w-px ${highContrast ? 'bg-neutral-700' : 'bg-stone-300'}`} />

            {/* Font Size Toggle */}
            <div className="flex items-center gap-1">
              <span className={`text-xs px-1.5 font-medium ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
                Size:
              </span>
              <button
                id="font-size-normal-btn"
                onClick={() => setFontSize('normal')}
                className={`text-xs px-2 py-1 rounded-md font-medium ${
                  fontSize === 'normal'
                    ? highContrast
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-white shadow-xs text-stone-900'
                    : highContrast
                    ? 'text-neutral-300'
                    : 'text-stone-600'
                }`}
                aria-label="Standard font size"
              >
                A
              </button>
              <button
                id="font-size-large-btn"
                onClick={() => setFontSize('large')}
                className={`text-sm px-2 py-1 rounded-md font-semibold ${
                  fontSize === 'large'
                    ? highContrast
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-white shadow-xs text-stone-900'
                    : highContrast
                    ? 'text-neutral-300'
                    : 'text-stone-600'
                }`}
                aria-label="Large font size"
              >
                A+
              </button>
              <button
                id="font-size-xlarge-btn"
                onClick={() => setFontSize('xlarge')}
                className={`text-base px-2 py-1 rounded-md font-bold ${
                  fontSize === 'xlarge'
                    ? highContrast
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-white shadow-xs text-stone-900'
                    : highContrast
                    ? 'text-neutral-300'
                    : 'text-stone-600'
                }`}
                aria-label="Extra large font size"
              >
                A++
              </button>
            </div>

            <div className={`h-4 w-px ${highContrast ? 'bg-neutral-700' : 'bg-stone-300'}`} />

            {/* High Contrast Toggle */}
            <button
              id="toggle-high-contrast-btn"
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                highContrast
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-white text-stone-700 shadow-xs hover:bg-stone-50'
              }`}
              title="Toggle high-contrast theme for enhanced visual clarity"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{highContrast ? 'High Contrast: On' : 'High Contrast'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
