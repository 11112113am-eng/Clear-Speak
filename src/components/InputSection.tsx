import React, { useState, useEffect } from 'react';
import { Sparkles, Clipboard, Trash2, BookOpen, AlertCircle, FileText, UploadCloud, CheckCircle2, Loader } from 'lucide-react';
import { SAMPLE_DOCUMENTS, SampleDocument } from '../data/samples';

interface InputSectionProps {
  text: string;
  setText: (val: string) => void;
  category: 'legal' | 'medical' | 'government' | 'financial' | 'general';
  setCategory: (val: 'legal' | 'medical' | 'government' | 'financial' | 'general') => void;
  targetLanguage: string;
  setTargetLanguage: (val: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onSelectSample: (sample: SampleDocument) => void;
  error: string | null;
  highContrast: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  text,
  setText,
  category,
  setCategory,
  targetLanguage,
  setTargetLanguage,
  isLoading,
  onSubmit,
  onSelectSample,
  error,
  highContrast,
}) => {
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
      }
    } catch (err) {
      console.warn('Could not read from clipboard directly:', err);
    }
  };

  // State for multimodal document file uploading
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate MIME type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Please upload a PDF, PNG, or JPG document.');
      return;
    }

    // Validate file size (under 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size is too large. Please upload a file smaller than 10MB.');
      return;
    }

    setFileLoading(true);
    setFileError(null);
    setFileSuccess(false);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const rawBase64 = base64String.split(',')[1];

        try {
          const response = await fetch('/api/read-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: rawBase64,
              mimeType: file.type,
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to extract text from document.');
          }

          const data = await response.json();
          if (data.extractedText) {
            setText(data.extractedText);
            if (data.category) {
              setCategory(data.category);
            }
            setFileSuccess(true);
            setTimeout(() => setFileSuccess(false), 4000);
          } else {
            throw new Error('No readable text could be extracted from this document.');
          }
        } catch (apiErr: any) {
          setFileError(apiErr.message || 'Error occurred while analyzing the file.');
        } finally {
          setFileLoading(false);
        }
      };

      reader.onerror = () => {
        setFileError('Error occurred while reading the local file.');
        setFileLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setFileError('Failed to read the file.');
      setFileLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  // Auto-detect category from pasted/typed text
  const [isDetectingCategory, setIsDetectingCategory] = useState(false);

  useEffect(() => {
    if (!text || text.trim().length < 35) {
      return;
    }

    // Delay calling the API for 1200ms after the user finishes typing or pasting
    const timer = setTimeout(async () => {
      setIsDetectingCategory(true);
      try {
        const response = await fetch('/api/detect-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (response.ok) {
          const data = await response.json();
          const allowedCategories = ['legal', 'medical', 'government', 'financial', 'general'];
          if (data.category && allowedCategories.includes(data.category) && data.category !== category) {
            setCategory(data.category as any);
          }
        }
      } catch (err) {
        console.warn('Silent failure in category detection:', err);
      } finally {
        setIsDetectingCategory(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [text, setCategory]);

  const categories = [
    { id: 'general', label: 'All / General', icon: '📝' },
    { id: 'medical', label: 'Medical & Health', icon: '🏥' },
    { id: 'legal', label: 'Legal & Leases', icon: '⚖️' },
    { id: 'government', label: 'Government & Benefits', icon: '🏛️' },
    { id: 'financial', label: 'Financial & Banking', icon: '💳' },
  ] as const;

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div
      id="input-container-card"
      className={`rounded-2xl border transition-all duration-200 p-6 ${
        highContrast
          ? 'bg-neutral-900 border-neutral-700 text-white'
          : 'bg-white border-stone-200/90 shadow-xs'
      }`}
    >
      {/* Category selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="domain-category-pills"
            className={`text-xs font-semibold uppercase tracking-wider ${
              highContrast ? 'text-amber-400' : 'text-stone-500'
            }`}
          >
            1. Select Document Type
          </label>
          {isDetectingCategory ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 animate-pulse font-semibold shrink-0">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping"></span>
              Auto-detecting category...
            </span>
          ) : (
            <span className={`text-xs ${highContrast ? 'text-neutral-400' : 'text-stone-400'}`}>
              Helps Clear-Speak tailor specialized terms
            </span>
          )}
        </div>
        <div id="domain-category-pills" className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                type="button"
                onClick={() => setCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? highContrast
                      ? 'bg-amber-400 text-black font-bold shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                    : highContrast
                    ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 border border-stone-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Language Selection */}
      <div className="mb-4 pt-3 border-t border-dashed border-stone-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="target-language-pills"
            className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              highContrast ? 'text-amber-400' : 'text-stone-500'
            }`}
          >
            🇮🇳 Select Explanation Language
          </label>
          <span className={`text-xs ${highContrast ? 'text-neutral-400' : 'text-stone-400'}`}>
            Translates the document into your preferred language
          </span>
        </div>
        <div id="target-language-pills" className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {[
            { code: 'en', label: 'English', native: 'English' },
            { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
            { code: 'bn', label: 'Bengali', native: 'বাংলা' },
            { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
            { code: 'te', label: 'Telugu', native: 'తెలుగు' },
            { code: 'mr', label: 'Marathi', native: 'मराठी' },
            { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
            { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
            { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
            { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
            { code: 'ur', label: 'Urdu', native: 'اردو' },
          ].map((lang) => {
            const isSelected = targetLanguage === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-btn-${lang.code}`}
                type="button"
                onClick={() => setTargetLanguage(lang.code)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border min-h-[48px] ${
                  isSelected
                    ? highContrast
                      ? 'bg-amber-400 border-amber-500 text-black shadow-2xs font-bold'
                      : 'bg-emerald-600 border-emerald-700 text-white shadow-2xs'
                    : highContrast
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                    : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                <span className="font-bold">{lang.label}</span>
                <span className={`text-[10px] font-normal mt-0.5 ${
                  isSelected ? 'text-emerald-100/90 dark:text-amber-950/80' : 'text-stone-400'
                }`}>
                  {lang.native}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset sample documents buttons */}
      <div className="mb-4 pt-3 border-t border-dashed border-stone-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
            highContrast ? 'text-amber-400' : 'text-stone-500'
          }`}>
            <BookOpen className="w-3.5 h-3.5" />
            Quick Example Notices
          </span>
          <span className={`text-xs ${highContrast ? 'text-neutral-400' : 'text-stone-400'}`}>
            Click any to test Clear-Speak immediately
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              id={`sample-preset-${sample.id}`}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                highContrast
                  ? 'bg-neutral-800/80 border-neutral-700 hover:border-amber-400 hover:bg-neutral-800 text-neutral-200'
                  : 'bg-stone-50/80 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-stone-700'
              }`}
            >
              <div className="font-semibold truncate flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{sample.label}</span>
              </div>
              <p className={`mt-1 line-clamp-1 ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
                {sample.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic File Uploader (PDF, PNG, JPG) */}
      <div className="mb-4 pt-3 border-t border-dashed border-stone-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
            highContrast ? 'text-amber-400' : 'text-stone-500'
          }`}>
            <UploadCloud className="w-3.5 h-3.5" />
            Upload PDF or Scanned Document
          </span>
          <span className={`text-[11px] ${highContrast ? 'text-neutral-400' : 'text-stone-400'}`}>
            Supports PDF, JPG, PNG up to 10MB
          </span>
        </div>

        <div
          id="file-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? highContrast
                ? 'border-amber-400 bg-neutral-800/80'
                : 'border-emerald-500 bg-emerald-50/50'
              : highContrast
              ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800/40 hover:border-neutral-500'
              : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
          }`}
          onClick={() => document.getElementById('file-input-trigger')?.click()}
        >
          <input
            id="file-input-trigger"
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {fileLoading ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <Loader className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs font-medium text-stone-700 dark:text-stone-300 animate-pulse">
                Analyzing document and extracting text with AI...
              </div>
            </div>
          ) : fileSuccess ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
              <div className="text-xs font-bold">
                Text extracted successfully & category auto-selected!
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <UploadCloud className={`w-5 h-5 ${highContrast ? 'text-neutral-400' : 'text-stone-400'}`} />
              <div className="text-left">
                <span className="text-xs font-semibold text-emerald-600 dark:text-amber-400">
                  Click to upload
                </span>{' '}
                <span className={`text-xs ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
                  or drag and drop here
                </span>
              </div>
            </div>
          )}
        </div>

        {fileError && (
          <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{fileError}</span>
          </div>
        )}
      </div>

      {/* Textarea Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="complex-text-input"
            className={`text-xs font-semibold uppercase tracking-wider ${
              highContrast ? 'text-amber-400' : 'text-stone-500'
            }`}
          >
            2. Paste or Type the Complex Text
          </label>
          <div className="flex items-center gap-2">
            <button
              id="paste-clipboard-btn"
              type="button"
              onClick={handlePaste}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                highContrast
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                  : 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
            {text && (
              <button
                id="clear-input-btn"
                type="button"
                onClick={() => setText('')}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  highContrast
                    ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                    : 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            id="complex-text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a confusing letter, insurance notice, rental lease clause, government letter, or medical bill here..."
            rows={7}
            className={`w-full p-4 rounded-xl border font-normal text-base leading-relaxed transition-colors resize-y focus:outline-none focus:ring-2 ${
              highContrast
                ? 'bg-neutral-950 border-neutral-700 text-white placeholder-neutral-500 focus:ring-amber-400 focus:border-amber-400'
                : 'bg-stone-50/50 border-stone-300 text-stone-900 placeholder-stone-400 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className={highContrast ? 'text-neutral-400' : 'text-stone-500'}>
            {wordCount} words &bull; {charCount} characters
          </span>
          <span className={highContrast ? 'text-neutral-400' : 'text-stone-400'}>
            Protected & Private &bull; Easy to Read & Understand
          </span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div
          id="error-banner"
          className="mt-4 p-3.5 rounded-xl flex items-start gap-2.5 text-sm bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to simplify text</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-5 flex justify-end">
        <button
          id="translate-btn"
          type="button"
          disabled={isLoading || !text.trim()}
          onClick={onSubmit}
          className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-150 ${
            isLoading || !text.trim()
              ? 'opacity-50 cursor-not-allowed bg-stone-300 text-stone-500'
              : highContrast
              ? 'bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-md active:scale-98'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-98'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Translating into Friendly Words...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Translate to Plain English</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
