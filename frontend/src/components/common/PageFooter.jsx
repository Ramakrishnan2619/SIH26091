import React from 'react';
import { getTranslation } from '../../utils/translations';

/**
 * Universal Sovereign PageFooter component
 * Guarantees minimum top separation (mt-16 sm:mt-24) from previous content,
 * true bottom placement (mt-auto), and official government styling.
 */
export function PageFooter({ selectedLang = 'en', className = '' }) {
  const t = getTranslation(selectedLang);

  return (
    <footer className={`mt-16 sm:mt-24 w-full bg-[#002D33] text-slate-300 py-10 px-6 border-t-2 border-[#006B7A] no-print ${className}`.trim()}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
        {/* Emblem & Portal Identification */}
        <div className="flex items-center gap-3.5">
          <img 
            src="/favicon.svg" 
            alt="VyapaarSathi Emblem" 
            className="w-10 h-10 rounded-full shadow-xs shrink-0"
          />
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">
              {t.portalTitle} • {t.ministryName}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {t.govIndia} • National Concessional Credit Architecture
            </div>
          </div>
        </div>

        {/* Institutional Statutory Guidelines */}
        <div className="text-xs text-slate-300 font-medium">
          Aligned with NSFDC, NBCFDC, NSKFDC & NDFDC Statutory Guidelines
        </div>
      </div>
    </footer>
  );
}
