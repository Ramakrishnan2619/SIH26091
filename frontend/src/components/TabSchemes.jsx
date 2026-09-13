import React from 'react';
import { 
  Building2, CheckCircle, ExternalLink, ArrowRight, 
  FileText, Landmark, ShieldCheck, Sparkles, AlertCircle
} from 'lucide-react';

export function TabSchemes({ module2Result, onOpenSchemeSearch, selectedLang = 'en' }) {
  const schemeName = module2Result?.financial_summary?.scheme_name || module2Result?.schemeName || "Term Loan Scheme";
  const isMicro = schemeName.includes("Micro");

  const corporations = [
    {
      code: "NBCFDC",
      name: "National Backward Classes Finance & Development Corporation",
      eligible: true,
      interestRate: isMicro ? "6.5% p.a." : "8.0% p.a.",
      maxAmount: "₹50.00 Lakh",
      description: "Concessional credit for Other Backward Classes (OBC) entrepreneurs with annual family income under ₹3.00 Lakh."
    },
    {
      code: "NSFDC",
      name: "National Scheduled Castes Finance & Development Corporation",
      eligible: true,
      interestRate: isMicro ? "6.0% p.a." : "7.5% p.a.",
      maxAmount: "₹50.00 Lakh",
      description: "Dedicated credit facilitation and capital subsidy for Scheduled Caste beneficiaries with priority for women."
    },
    {
      code: "NSKFDC",
      name: "National Safai Karamcharis Finance & Development Corporation",
      eligible: false,
      interestRate: "6.0% p.a.",
      maxAmount: "₹15.00 Lakh",
      description: "Specialized rehabilitation credit for sanitation workers, manual scavengers, and their dependents."
    },
    {
      code: "NDFDC",
      name: "National Divyangjan Finance & Development Corporation",
      eligible: false,
      interestRate: "5.0% - 6.0% p.a.",
      maxAmount: "₹25.00 Lakh",
      description: "Concessional loans for self-employment ventures initiated by Persons with Disabilities (PwD)."
    }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-700" />
            <span>Government Credit Schemes & Corporations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Eligible schemes under the Ministry of Social Justice and Empowerment (MoSJE)
          </p>
        </div>

        <button
          onClick={onOpenSchemeSearch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133E68] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Explore More Schemes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Primary Recommended Scheme Card */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm border-l-4 border-l-blue-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Primary Recommended Scheme
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-3">
              {schemeName}
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              {isMicro ? (
                "Tailored for micro-scale rural enterprises requiring up to ₹1.40 Lakh project outlay. Collateral-free lending with 6.5% interest rate, 36-month tenure, and 3-month grace period."
              ) : (
                "Structured for small enterprise outlays between ₹1.40 Lakh and ₹50.00 Lakh. Offers 8.0% interest rate p.a., 84-month tenure (7 years), and 6-month grace period for stable enterprise ramp-up."
              )}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Interest Rate</div>
            <div className="text-3xl font-black text-emerald-700 mt-1">
              {isMicro ? '6.5%' : '8.0%'} <span className="text-xs font-normal text-slate-500">p.a.</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Subsidized Concessional Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500">Government Loan Share</div>
            <div className="text-lg font-black text-slate-900 mt-1">90% of Project Cost</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Beneficiary Contribution</div>
            <div className="text-lg font-black text-blue-700 mt-1">10% Margin Money</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Repayment Tenure</div>
            <div className="text-lg font-black text-slate-900 mt-1">{isMicro ? '36' : '84'} Months</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Setup Grace Period</div>
            <div className="text-lg font-black text-emerald-700 mt-1">{isMicro ? '3' : '6'} Months Moratorium</div>
          </div>
        </div>
      </div>

      {/* 3. Apex Corporations Grid */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">
          National Apex Corporations Alignment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {corporations.map((corp) => (
            <div 
              key={corp.code} 
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                corp.eligible 
                  ? 'bg-blue-50/40 border-blue-200 shadow-xs' 
                  : 'bg-slate-50/60 border-slate-200 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-black text-blue-900">{corp.code}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{corp.name}</h4>
                  </div>
                  {corp.eligible ? (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Eligible
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-600">
                      Target Group Specific
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {corp.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Interest: </span>
                  <span className="font-bold text-slate-900">{corp.interestRate}</span>
                </div>
                <div>
                  <span className="text-slate-500">Max Loan: </span>
                  <span className="font-bold text-slate-900">{corp.maxAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
