import React from 'react';
import { Clock, Trash2, ArrowUpRight, History } from 'lucide-react';
import { SavedTranslation } from '../types';

interface HistoryListProps {
  history: SavedTranslation[];
  onSelect: (item: SavedTranslation) => void;
  onClear: () => void;
  highContrast: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelect,
  onClear,
  highContrast,
}) => {
  if (history.length === 0) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(timestamp));
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'medical':
        return { label: 'Medical', bg: 'bg-rose-100 text-rose-800' };
      case 'legal':
        return { label: 'Legal', bg: 'bg-indigo-100 text-indigo-800' };
      case 'government':
        return { label: 'Government', bg: 'bg-blue-100 text-blue-800' };
      case 'financial':
        return { label: 'Financial', bg: 'bg-emerald-100 text-emerald-800' };
      default:
        return { label: 'General', bg: 'bg-stone-100 text-stone-700' };
    }
  };

  return (
    <div
      id="recent-simplifications-card"
      className={`rounded-2xl border p-5 transition-colors ${
        highContrast
          ? 'bg-neutral-900 border-neutral-700 text-white'
          : 'bg-white border-stone-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className={`w-4 h-4 ${highContrast ? 'text-amber-400' : 'text-emerald-600'}`} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Recent Translations</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              highContrast ? 'bg-neutral-800 text-neutral-300' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {history.length}
          </span>
        </div>
        <button
          id="clear-all-history-btn"
          type="button"
          onClick={onClear}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
            highContrast
              ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
              : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-600'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item) => {
          const badge = getCategoryBadge(item.category);
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 group cursor-pointer ${
                highContrast
                  ? 'bg-neutral-800/60 border-neutral-700 hover:border-amber-400 hover:bg-neutral-800'
                  : 'bg-stone-50/70 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
              onClick={() => onSelect(item)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded-md ${
                      highContrast ? 'bg-neutral-700 text-neutral-200' : badge.bg
                    }`}
                  >
                    {badge.label}
                  </span>
                  <span className={`text-xs ${highContrast ? 'text-neutral-400' : 'text-stone-400'}`}>
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                <p className={`text-sm font-medium line-clamp-1 ${highContrast ? 'text-white' : 'text-stone-900'}`}>
                  {item.result.shortVersion}
                </p>
                <p className={`text-xs line-clamp-1 mt-0.5 ${highContrast ? 'text-neutral-400' : 'text-stone-500'}`}>
                  Original: {item.originalText.slice(0, 100)}...
                </p>
              </div>

              <div
                className={`p-1.5 rounded-lg border shrink-0 transition-colors ${
                  highContrast
                    ? 'bg-neutral-700 border-neutral-600 group-hover:text-amber-400'
                    : 'bg-white border-stone-200 group-hover:text-emerald-600'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
