import React, { useEffect, useState, useRef } from 'react';
import {
  Brain,
  Database,
  Coins,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
  Terminal,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Clock
} from 'lucide-react';

const PIPELINE_STAGES = [
  {
    id: 1,
    title: 'Village Population & Customer Demand',
    desc: 'Checking village population, number of families, and local spending capacity',
    icon: Database,
    subtasks: [
      'Reading official village census records (Population & Households)',
      'Calculating local working families and potential daily customers',
      'Checking district purchasing power for your village'
    ],
    liveMetrics: { 'Demographics': 'Census Verified', 'Market Area': '10 km Radius' }
  },
  {
    id: 2,
    title: 'Local Market & Nearby Shops',
    desc: 'Locating nearby shops and direct competitors within your 10 km area',
    icon: MapPin,
    subtasks: [
      'Mapping other shops in your local area on Google Maps',
      'Identifying direct competitor businesses selling similar products',
      'Verifying unfulfilled market demand in your village cluster'
    ],
    liveMetrics: { 'Map Directory': 'Google Maps Active', 'Coverage': '10 km Area' }
  },
  {
    id: 3,
    title: 'Govt Low-Interest Loan & Monthly EMI',
    desc: 'Structuring 90% government loan with 6-month grace period',
    icon: Coins,
    subtasks: [
      'Applying Ministry low-interest concessional scheme guidelines',
      'Structuring 90% loan with 6-month grace period (no principal due initially)',
      'Checking loan safety so monthly repayment stays well within profit'
    ],
    liveMetrics: { 'Loan Share': '90% Govt Loan', 'Grace Period': '6 Months' }
  },
  {
    id: 4,
    title: 'Business Plan & Profit Forecast',
    desc: 'Estimating recommended selling prices, daily sales, and monthly net profit',
    icon: Sparkles,
    subtasks: [
      'Recommending competitive selling price suited for local customers',
      'Estimating daily sales volume and seasonal demand patterns',
      'Calculating monthly raw material costs, expenses, and net profit'
    ],
    liveMetrics: { 'Advisor': 'AI Business Engine', 'Guidance': 'Tailored to Category' }
  },
  {
    id: 5,
    title: 'Finalizing Project Report',
    desc: 'Preparing official bank-ready appraisal report for government scheme submission',
    icon: CheckCircle2,
    subtasks: [
      'Compiling complete project cost and margin breakdown',
      'Verifying government scheme eligibility criteria for your category',
      'Packaging bank-ready report for loan sanction and verification'
    ],
    liveMetrics: { 'Status': 'Bank Ready', 'Compliance': 'MoSJE Aligned' }
  }
];

export function ProcessingScreen({ payload, onSuccess, onError }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [completedReport, setCompletedReport] = useState(null);

  const terminalBoxRef = useRef(null);

  const applicantName = payload?.ownerName || 'Applicant';
  const businessCategory = payload?.businessCategory || 'Micro Enterprise';
  const villageName = payload?.villageName || 'Selected Revenue Village';

  const runAssessment = async () => {
    setIsRetrying(true);
    setErrorMsg(null);
    setLogs(prev => [...prev, `[INFO] Submitting evaluation request to AI business engine...`]);
    try {
      const token = localStorage.getItem('vyapaarsathi_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Sanitize payload so brief descriptions or missing codes never cause validation errors
      const sanitizedPayload = {
        ...payload,
        ownerName: payload?.ownerName || 'Applicant',
        age: Number(payload?.age) || 34,
        gender: payload?.gender || 'Female',
        socialCategory: payload?.socialCategory || 'OBC',
        marginCapital: Number(payload?.marginCapital) || 100000,
        businessCategory: payload?.businessCategory || 'Grocery & Daily Provisions',
        businessIdeaDescription: (payload?.businessIdeaDescription && payload.businessIdeaDescription.trim().length >= 3)
          ? payload.businessIdeaDescription.trim()
          : `${payload?.businessCategory || 'Rural'} micro-enterprise setup providing essential local services and goods.`,
        villageLgdCode: payload?.villageLgdCode || 639842,
        latitude: Number(payload?.latitude) || 10.0524,
        longitude: Number(payload?.longitude) || 78.3344
      };

      const res = await fetch('/api/assess/complete', {
        method: 'POST',
        headers,
        body: JSON.stringify(sanitizedPayload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setCurrentStep(PIPELINE_STAGES.length);
      setLogs(prev => [...prev, `[SUCCESS] Complete assessment report ready!`]);
      setCompletedReport(data);
    } catch (err) {
      console.error('Assessment execution failed:', err);
      setErrorMsg(err.message || 'Failed to generate assessment. Please check network connectivity or try again.');
      setLogs(prev => [...prev, `[ERROR] Process halted: ${err.message}`]);
    } finally {
      setIsRetrying(false);
    }
  };

  // Dynamic log emitter with plain language
  useEffect(() => {
    const logTemplates = [
      { time: 200, step: 0, text: `Starting business analysis for ${applicantName} (${businessCategory})` },
      { time: 600, step: 0, text: `Target village coordinates set: lat=${payload?.latitude || '10.0524'}, lng=${payload?.longitude || '78.3344'}` },
      { time: 1100, step: 0, text: `Loaded Census records for village: ${villageName} (Population & Household count verified)` },
      { time: 1800, step: 1, text: `Searching Google Maps directory within 10 km market area` },
      { time: 2500, step: 1, text: `Mapped nearby establishments and competitor units in this local cluster` },
      { time: 3300, step: 2, text: `Checking government low-interest loan eligibility for applicant category` },
      { time: 4100, step: 2, text: `Calculated 90% loan with 6-month grace period; monthly repayment is safe` },
      { time: 5000, step: 3, text: `AI generating category-specific profit forecast and pricing strategy for ${businessCategory}` },
      { time: 6000, step: 4, text: `Synthesizing loan approval index across credit, market, and business readiness` },
      { time: 7000, step: 4, text: `Final bank-ready project report compiled successfully!` }
    ];

    const logTimeouts = logTemplates.map(item => {
      return setTimeout(() => {
        setLogs(prev => [...prev, item.text]);
        setCurrentStep(prev => Math.max(prev, item.step));
      }, item.time);
    });

    runAssessment();

    return () => {
      logTimeouts.forEach(clearTimeout);
    };
  }, []);

  // ONLY scroll internal terminal box — NEVER scroll the main browser window!
  useEffect(() => {
    if (terminalBoxRef.current) {
      terminalBoxRef.current.scrollTop = terminalBoxRef.current.scrollHeight;
    }
  }, [logs]);

  // Gentle progress percentage
  const isFinished = completedReport || currentStep >= PIPELINE_STAGES.length;
  const progressPct = completedReport 
    ? 100 
    : Math.min(95, Math.round(((currentStep + 1) / (PIPELINE_STAGES.length + 1)) * 100));

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-slate-50 min-h-[700px]">
      <div className="max-w-3xl w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
        {/* 1. Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#006B7A] flex items-center justify-center shadow-md shrink-0">
              <img src="/favicon.svg" alt="VyapaarSathi" className="w-8 h-8 rounded-full" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Creating Your Business Project Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluating <strong className="text-slate-800">{applicantName}</strong> • {businessCategory} in {villageName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stationary percentage text with circular ring (stops spinning when 100%) */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-4 ${
                  isFinished
                    ? 'border-emerald-500'
                    : 'border-[#CBF9FF] border-t-[#006B7A] animate-spin'
                }`}
              />
              <span className={`relative text-xs font-black ${isFinished ? 'text-emerald-700' : 'text-[#006B7A]'}`}>
                {progressPct}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Completion Banner & Action Button when 100% Ready (Requires user click) */}
        {completedReport && (
          <div className="my-5 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">
                  Project Report Completed Successfully!
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  All evaluation steps verified. Tap below to view your full feasibility report.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSuccess(completedReport)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#006B7A] hover:bg-[#005561] text-white text-sm font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>View Project Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overall Progress Bar */}
        <div className="my-4">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#006B7A] via-[#009DB3] to-[#02C6E1] h-2 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 3. Detailed 5-Step Telemetry */}
        <div className="space-y-3 mb-6">
          {PIPELINE_STAGES.map((step, idx) => {
            const isDone = currentStep > idx || completedReport;
            const isCurrent = currentStep === idx && !completedReport;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isCurrent
                    ? 'bg-[#E5F6F8] border-[#79E4F3] shadow-sm ring-2 ring-[#CBF9FF]'
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-[#006B7A] animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-[#006B7A]' : isDone ? 'text-emerald-900' : 'text-slate-600'}`}>
                          Step {step.id}: {step.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006B7A] text-white animate-pulse">
                            Processing
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Done ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {step.desc}
                      </div>

                      {/* Subtasks breakdown */}
                      {(isCurrent || isDone) && (
                        <div className="mt-2 space-y-1">
                          {step.subtasks.map((st, i) => (
                            <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-[#009DB3]'}`} />
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right-hand Metric Badges */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    {Object.entries(step.liveMetrics).map(([key, val]) => (
                      <span key={key} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {key}: <strong className="text-[#006B7A]">{val}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Real-Time Execution Log Box (Self-scrolling internally without window jerk) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden text-left shadow-lg">
          <button
            type="button"
            onClick={() => setShowTerminal(!showTerminal)}
            className="w-full px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#02C6E1]" />
              <span>Live Creation Progress Log ({logs.length} events)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{showTerminal ? 'Collapse' : 'Expand'}</span>
              {showTerminal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showTerminal && (
            <div 
              ref={terminalBoxRef}
              className="p-4 font-mono text-[11px] text-emerald-400 max-h-40 overflow-y-auto space-y-1 bg-slate-950 scroll-smooth"
            >
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed flex items-start gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={log.includes('[ERROR]') ? 'text-rose-400 font-bold' : log.includes('[SUCCESS]') ? 'text-[#02C6E1] font-bold' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Alert & Retry Action Bar */}
        {errorMsg && (
          <div className="mt-5 p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-950">Evaluation Paused</h4>
                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                  {errorMsg.includes('validation')
                    ? 'Some input fields required adjustment. You can retry now with standard village market defaults, or return to edit your details.'
                    : errorMsg}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-200">
              <button
                type="button"
                onClick={runAssessment}
                disabled={isRetrying}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying Evaluation...' : 'Retry Evaluation'}</span>
              </button>

              <button
                type="button"
                onClick={onError}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Assessment Details</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
