import React from 'react';
import { Home, PlusCircle, FileText, Download, Sparkles, MessageSquare } from 'lucide-react';
import { getTranslation } from '../../utils/translations';

/**
 * Universal NavBar component for VyapaarSathi
 * Brand-accent Aqua Blue styling, semantic chat/sparkle icon for AI Assistant,
 * zero gold/yellow caution color misuse.
 */
export function NavBar({
  currentPage = 'home',
  onNavigate,
  onDownloadPdf,
  onOpenAiChat,
  selectedLang = 'en'
}) {
  const t = getTranslation(selectedLang);

  return (
    <nav className="bg-[#006B7A] px-2 sm:px-6 py-1 text-white border-t border-[#00525E] w-full overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 w-max sm:w-full">
        {/* Main Navigation Links */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[34px] sm:min-h-[38px] ${
              currentPage === 'home'
                ? 'bg-white/25 text-white shadow-xs'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.navHome}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('assess')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[34px] sm:min-h-[38px] ${
              currentPage === 'assess'
                ? 'bg-white/25 text-white shadow-xs'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t.navAssess}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('report')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[34px] sm:min-h-[38px] ${
              currentPage === 'report'
                ? 'bg-white/25 text-white shadow-xs'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.navReport}</span>
          </button>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 shrink-0">
          {currentPage === 'report' && onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
            >
              <Download className="w-3.5 h-3.5 text-[#A8EFF9]" />
              <span className="hidden sm:inline">{t.navDownloadPdf}</span>
            </button>
          )}

          {/* AI Assistant Button: Semantic Sparkles/Chat icon, Brand-accent Wintergreen/Powder Blue background */}
          <button
            type="button"
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#009DB3] hover:bg-[#02C6E1] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer border border-[#79E4F3]/40 min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A8EFF9]" />
            <span>{t.navAiSahayak}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
