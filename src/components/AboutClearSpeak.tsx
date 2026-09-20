import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles, Smile, BookCheck, Check } from 'lucide-react';

interface AboutClearSpeakProps {
  highContrast: boolean;
}

export const AboutClearSpeak: React.FC<AboutClearSpeakProps> = ({ highContrast }) => {
  return (
    <div
      id="about-clearspeak-card"
      className={`rounded-2xl border p-6 transition-all ${
        highContrast
          ? 'bg-neutral-900 border-neutral-700 text-white'
          : 'bg-white border-stone-200 shadow-2xs'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            highContrast ? 'bg-amber-400 text-black' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold">About Clear-Speak</h3>
          <p className={`text-xs ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
            Social Good Accessibility Initiative
          </p>
        </div>
      </div>

      <p className={`text-sm leading-relaxed mb-4 ${highContrast ? 'text-neutral-300' : 'text-stone-600'}`}>
        Official medical bills, insurance letters, court summons, and government benefit notices are often written in confusing, intimidating legal and technical jargon.
        <strong className="text-stone-900 dark:text-white font-semibold"> Clear-Speak</strong> exists to
        remove fear and confusion by translating intimidating paperwork into gentle, clear, and easy-to-understand language.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div
          className={`p-3 rounded-xl border ${
            highContrast ? 'bg-neutral-800/80 border-neutral-700' : 'bg-stone-50/70 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <Check className="w-3.5 h-3.5" />
            <span>1. The Short Version</span>
          </div>
          <p className={`text-xs leading-normal ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
            Quick 1-2 sentence core message so you immediately understand what happened.
          </p>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            highContrast ? 'bg-neutral-800/80 border-neutral-700' : 'bg-stone-50/70 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <Check className="w-3.5 h-3.5" />
            <span>2. What This Means</span>
          </div>
          <p className={`text-xs leading-normal ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
            2-3 simple bullet points explaining how this affects your money, rights, or health.
          </p>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            highContrast ? 'bg-neutral-800/80 border-neutral-700' : 'bg-stone-50/70 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <Check className="w-3.5 h-3.5" />
            <span>3. Next Steps</span>
          </div>
          <p className={`text-xs leading-normal ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
            Clear guidance on what you need to do, or peace of mind knowing no action is needed.
          </p>
        </div>
      </div>
    </div>
  );
};
