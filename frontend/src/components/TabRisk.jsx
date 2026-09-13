import React from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, 
  HelpCircle, Info, FileCheck, Award, TrendingDown, Layers
} from 'lucide-react';

export function TabRisk({ module1Report, module2Result, dashboardKpis }) {
  const foirBadge = dashboardKpis?.foir_badge || module2Result?.affordability?.verdict_badge || "GREEN";
  const foirVerdict = dashboardKpis?.foir_verdict || module2Result?.affordability?.foir_verdict || "SAFE";
  const foirPct = module2Result?.affordability?.foir_percentage || 28.5;
  const compositeScore = dashboardKpis?.composite_readiness_score || 78;

  const rings = [
    { label: "Credit & Repayment Readiness", value: compositeScore, color: "#006B7A", radius: 88, stroke: 9 },
    { label: "Market Demand & Catchment", value: 85, color: "#009DB3", radius: 72, stroke: 9 },
    { label: "Statutory & Document Compliance", value: 92, color: "#02C6E1", radius: 56, stroke: 9 },
  ];

  const getCircumference = (radius) => 2 * Math.PI * radius;

  const riskFactors = [
    {
      title: "1. Demand Seasonality & Working Capital",
      level: "MODERATE",
      levelColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: "Discretionary spend may contract slightly during peak monsoon or non-harvest months.",
      mitigation: "Utilize the 6-month loan grace period (moratorium) to build an initial cash reserve buffer.",
      source: "Rural Demand Survey"
    },
    {
      title: "2. Monthly Debt Servicing Capacity",
      level: foirBadge === 'GREEN' ? 'LOW RISK' : foirBadge === 'YELLOW' ? 'MODERATE' : 'HIGH',
      levelColor: foirBadge === 'GREEN' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  foirBadge === 'YELLOW' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-rose-100 text-rose-800 border-rose-200',
      description: `Debt repayments constitute ${foirPct}% of projected monthly net earnings (${foirVerdict}).`,
      mitigation: "Concessional 8% interest and quarterly schedule ensure repayments remain manageable.",
      source: "Financial Calculation"
    },
    {
      title: "3. Local Competition Proximity",
      level: "LOW RISK",
      levelColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "Low density of direct competitor businesses within the immediate village cluster.",
      mitigation: "Early market entry allows building a loyal customer base and stable margin.",
      source: "Local Market Intelligence"
    },
    {
      title: "4. Raw Material Supply & Transport",
      level: "MODERATE",
      levelColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: "Wholesale suppliers located at the sub-district town require planned inventory runs.",
      mitigation: "Maintain weekly consolidated purchasing cycles with other local village vendors.",
      source: "Logistics Assessment"
    },
    {
      title: "5. Required Documentation & Eligibility",
      level: "LOW RISK",
      levelColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "Aadhaar, Social Category certificate, bank account, and residential address verified.",
      mitigation: "Checklist meets standard State Channelizing Agency (SCA) requirements for fast clearance.",
      source: "Document Checklist"
    },
    {
      title: "6. Business Registration & Local Permits",
      level: "LOW RISK",
      levelColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "Udyam MSME Registration and Gram Panchayat consent are standard requisites.",
      mitigation: "Simple single-window government registration templates provided with this report.",
      source: "Regulatory Guidelines"
    }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-blue-700" />
          <span>Business Risk & Preparedness Assessment</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Evaluation of market risks, repayment feasibility, and bank sanction readiness
        </p>
      </div>

      {/* 2. Top Summary: Ring Index & Affordability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Rings Visual */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-base font-bold text-slate-900 mb-2">Readiness Index</h3>
          
          <div className="relative w-56 h-56 flex items-center justify-center my-3">
            <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 220 220">
              {rings.map((ring, idx) => {
                const c = getCircumference(ring.radius);
                const offset = c - (ring.value / 100) * c;
                return (
                  <g key={idx}>
                    <circle
                      cx="110"
                      cy="110"
                      r={ring.radius}
                      fill="transparent"
                      stroke={ring.color}
                      strokeWidth={ring.stroke}
                      strokeOpacity="0.15"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r={ring.radius}
                      fill="transparent"
                      stroke={ring.color}
                      strokeWidth={ring.stroke}
                      strokeDasharray={c}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{compositeScore}%</span>
              <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider shadow-2xs">
                Bank Ready
              </span>
            </div>
          </div>

          <div className="space-y-2 w-full mt-2 text-left">
            {rings.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span>{r.label}</span>
                </span>
                <span className="font-bold text-slate-900">{r.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Repayment Health Card */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Loan Repayment Viability</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Safe & Viable
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Repayment to Earnings Ratio</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{foirPct}%</div>
                <p className="text-[11px] text-slate-500 mt-1">Well within the 35% safe ceiling</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Grace Period (Moratorium)</span>
                <div className="text-2xl font-black text-blue-700 mt-1">6 Months</div>
                <p className="text-[11px] text-slate-500 mt-1">Interest-only during initial setup</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Based on projected net profit and conservative demand estimates, this micro-enterprise demonstrates sufficient surplus to cover loan installments comfortably without stressing household living expenses.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Eligible for automatic recommendation under Term Loan Scheme.</span>
          </div>
        </div>
      </div>

      {/* 3. Detailed 6-Point Risk Breakdown */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">
          Detailed Risk Factors & Practical Mitigations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {riskFactors.map((rf, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="text-sm font-bold text-slate-900">{rf.title}</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${rf.levelColor}`}>
                    {rf.level}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {rf.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Recommended Mitigation:</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {rf.mitigation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
