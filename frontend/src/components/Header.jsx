import React, { useState } from 'react';
import { Download, Bot, Globe, User, LogIn, LogOut, FileText, PlusCircle, Home, ShieldCheck } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { NavBar } from './common/NavBar';

export function Header({ 
  currentUser,
  currentPage,
  onNavigate,
  selectedLang = 'en', 
  onLangChange, 
  onDownloadPdf, 
  onOpenAiChat,
  onLogout
}) {
  const [fontSize, setFontSize] = useState('normal');
  const t = getTranslation(selectedLang);

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    if (size === 'small') root.style.fontSize = '14px';
    else if (size === 'large') root.style.fontSize = '18px';
    else root.style.fontSize = '16px';
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white w-full overflow-hidden">
      {/* 1. National Tricolor Accent Strip */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* 2. Top Sovereign & Accessibility Utility Bar (UX4G Standard) */}
      <div className="bg-[#00525E] text-slate-100 px-4 sm:px-6 py-1.5 text-xs border-b border-[#00414B] w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide text-slate-200">
            <span className="font-bold text-xs">{t.govIndia}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-300 text-[11px] hidden md:inline">{t.apexNotice}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Font Size Accessibility */}
            <div className="flex items-center gap-1 border-r border-[#006B7A] pr-3">
              <span className="text-slate-300 text-[11px] hidden sm:inline">{t.fontSize}</span>
              <button
                type="button"
                onClick={() => handleFontSizeChange('small')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  fontSize === 'small' ? 'bg-white/25 text-white underline underline-offset-2 ring-1 ring-white/60' : 'hover:bg-[#006B7A] text-slate-200'
                }`}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange('normal')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  fontSize === 'normal' ? 'bg-white/25 text-white underline underline-offset-2 ring-1 ring-white/60' : 'hover:bg-[#006B7A] text-slate-200'
                }`}
                title="Default font size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange('large')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  fontSize === 'large' ? 'bg-white/25 text-white underline underline-offset-2 ring-1 ring-white/60' : 'hover:bg-[#006B7A] text-slate-200'
                }`}
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Global Language Switcher */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Globe className="w-3.5 h-3.5 text-[#A8EFF9] shrink-0" />
              <select
                value={selectedLang}
                onChange={(e) => onLangChange(e.target.value)}
                className="bg-[#003B44] hover:bg-[#004752] text-slate-100 px-2 py-0.5 rounded text-xs font-semibold border border-[#006B7A] focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
                <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
                <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official Government Portal Masthead */}
      <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Official Emblem & Portal Title */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3.5 sm:gap-4 cursor-pointer group shrink min-w-0"
          >
            {/* Favicon SVG Logo */}
            <img 
              src="/favicon.svg" 
              alt="VyapaarSathi Emblem" 
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-full shadow-sm group-hover:scale-105 transition-transform shrink-0"
            />

            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-semibold text-slate-600 tracking-wide uppercase truncate">
                {t.ministryName}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#006B7A] tracking-tight group-hover:text-[#00525E] transition-colors truncate">
                  {t.portalTitle}
                </h1>
                <span className="text-xs font-bold text-slate-400 hidden lg:inline">|</span>
                <span className="text-xs font-semibold text-slate-500 hidden lg:inline">
                  {t.portalSubtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header: Badges & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 no-print">
            {currentUser && (
              <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#CBF9FF]/30 border border-[#79E4F3] text-xs">
                <ShieldCheck className="w-4 h-4 text-[#006B7A] shrink-0" />
                <div>
                  <div className="font-bold text-[#006B7A] leading-none">Institutional Apex Alignment</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">NSFDC • NBCFDC • NSKFDC • NDFDC</div>
                </div>
              </div>
            )}

            {/* User Session or Sign In */}
            {currentUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-medium text-slate-800">
                <div className="w-5 h-5 rounded-full bg-[#006B7A] text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-bold text-slate-900 truncate max-w-[100px]">{currentUser.name || 'Applicant'}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  title={t.navSignOut}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#006B7A] hover:bg-[#00525E] text-white text-xs font-bold shadow-xs transition-all cursor-pointer min-h-[38px] sm:min-h-[48px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.navSignIn}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Deep Aqua-Green Navigation Bar (Only visible when user signs/logs in) */}
      {currentUser && (
        <NavBar
          currentPage={currentPage}
          onNavigate={onNavigate}
          onDownloadPdf={onDownloadPdf}
          onOpenAiChat={onOpenAiChat}
          selectedLang={selectedLang}
        />
      )}
    </header>
  );
}
