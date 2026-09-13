import React, { useEffect, useState } from 'react';
import { Brain, Database, Coins, Sparkles, CheckCircle2, Loader2, AlertCircle, MapPin } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Analyzing Village Demographics & Market Size', desc: 'Fetching population, household density and purchasing power', icon: Database },
  { id: 2, title: 'Assessing Local Competition (10 km Zone)', desc: 'Measuring competitor saturation and unmet customer demand', icon: MapPin },
  { id: 3, title: 'Structuring Concessional Loan & Repayments', desc: 'Calculating 90% debt at 8% p.a. with 6-month grace period', icon: Coins },
  { id: 4, title: 'Synthesizing Business SWOT & Pricing Guidance', desc: 'Personalizing strengths, local opportunities, and cashflow safeguards', icon: Sparkles },
  { id: 5, title: 'Finalizing Bank-Ready Project Report', desc: 'Preparing official credit dossier for government scheme submission', icon: CheckCircle2 }
];

export function ProcessingScreen({ payload, onSuccess, onError }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);

    const runAssessment = async () => {
      try {
        const token = localStorage.getItem('vyapaarsathi_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/assess/complete', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server responded with status ${res.status}`);
        }

        const data = await res.json();
        setCurrentStep(STEPS.length);
        setTimeout(() => {
          onSuccess(data);
        }, 1000);
      } catch (err) {
        console.error('Assessment execution failed:', err);
        setErrorMsg(err.message || 'Failed to synthesize assessment. Please check network connectivity or try again.');
      } finally {
        clearInterval(interval);
      }
    };

    runAssessment();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-slate-50 min-h-[600px]">
      <div className="max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl text-center">
        {/* Animated Medallion */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-50" />
          <div className="relative w-16 h-16 rounded-2xl bg-[#0B2545] flex items-center justify-center text-white shadow-lg">
            <Brain className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Generating Project Report
        </h3>
        <p className="text-xs text-slate-500 mb-8 leading-relaxed">
          Evaluating enterprise feasibility and concessional loan eligibility for{' '}
          <strong className="text-slate-800">{payload?.ownerName || 'Applicant'}</strong>
        </p>

        {/* Steps progression with generous spacing */}
        <div className="space-y-4 text-left mb-8">
          {STEPS.map((step, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isCurrent
                    ? 'bg-blue-50 border-blue-300 shadow-xs ring-2 ring-blue-100'
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-blue-700 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isCurrent ? 'text-blue-900' : isDone ? 'text-emerald-900' : 'text-slate-600'}`}>
                    {step.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="text-xs text-slate-400 font-medium">
          Automated analysis under Ministry of Social Justice and Empowerment guidelines
        </div>
      </div>
    </div>
  );
}
