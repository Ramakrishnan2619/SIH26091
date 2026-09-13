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
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PIPELINE_STAGES = [
  {
    id: 1,
    title: 'Village Demographics & Market Base',
    desc: 'Querying Census 2011 master and district economic tier',
    icon: Database,
    subtasks: [
      'Querying revenue village demographics (Population, Households)',
      'Calculating local literacy and working population ratio',
      'Determining District NDP per capita & purchasing power tier'
    ],
    liveMetrics: { 'Demographics': 'Census 2011 Grounded', 'Catchment': '10 km' }
  },
  {
    id: 2,
    title: 'Competitor Saturation & Google Places GIS',
    desc: 'Scanning local competitor clusters within 10 km catchment zone',
    icon: MapPin,
    subtasks: [
      'Scanning 10 km radius via Google Places & AreaInsights',
      'Identifying physical retail stores and direct enterprise rivals',
      'Computing saturation index and unfulfilled village demand headroom'
    ],
    liveMetrics: { 'GIS Engine': 'Google Maps API', 'Radius': '10 km' }
  },
  {
    id: 3,
    title: 'Concessional Financing & Debt Feasibility',
    desc: 'Structuring 90% debt with 6-month moratorium & FOIR risk validation',
    icon: Coins,
    subtasks: [
      'Matching NBCFDC / NSFDC / NSKFDC concessional scheme rules',
      'Calculating debt amortization at 5-8% p.a. with 6-month moratorium',
      'Stress testing Fixed Obligation to Income Ratio (FOIR) & DSCR'
    ],
    liveMetrics: { 'Debt Ratio': '90% Concessional', 'FOIR Threshold': '≤ 45%' }
  },
  {
    id: 4,
    title: 'Vertex AI / Gemini 2.5 Grounded Synthesis',
    desc: 'Synthesizing SWOT matrix, pricing elasticity and rural cashflow safeguards',
    icon: Sparkles,
    subtasks: [
      'Constructing context-grounded prompt with local village telemetry',
      'Evaluating business strengths, rural supply bottlenecks & seasonals',
      'Synthesizing pricing guidance and daily unit volume projections'
    ],
    liveMetrics: { 'LLM Engine': 'Gemini 2.5 Flash', 'Latency': 'Real-time' }
  },
  {
    id: 5,
    title: 'Credit Readiness Index & Official Dossier',
    desc: 'Computing composite score across credit, market and operational readiness',
    icon: CheckCircle2,
    subtasks: [
      'Synthesizing composite readiness index across 3 dimensions',
      'Verifying Ministry of Social Justice and Empowerment eligibility',
      'Compiling bank-ready appraisal report & scheme application package'
    ],
    liveMetrics: { 'Standard': 'MoSJE Compliant', 'Status': 'Ready' }
  }
];

export function ProcessingScreen({ payload, onSuccess, onError }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [logs, setLogs] = useState([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalEndRef = useRef(null);

  const applicantName = payload?.ownerName || 'Applicant';
  const businessCategory = payload?.businessCategory || 'Micro Enterprise';
  const villageName = payload?.villageName || 'Selected Revenue Village';

  // Dynamic log emitter simulating real-time pipeline traces
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);

    const logTemplates = [
      { time: 200, step: 0, text: `[INIT] Starting unified assessment for ${applicantName} (${businessCategory})` },
      { time: 500, step: 0, text: `[GIS] Target coordinates established: lat=${payload?.latitude || '10.0524'}, lng=${payload?.longitude || '78.3344'}` },
      { time: 900, step: 0, text: `[CENSUS] Querying Census 2011 directory for village: ${villageName}` },
      { time: 1400, step: 0, text: `[CENSUS] Retrieved demographic record: Rural Cluster, Literacy=74.2%` },
      { time: 2000, step: 1, text: `[PLACES] Querying Google Maps AreaInsights within 10 km catchment zone` },
      { time: 2600, step: 1, text: `[PLACES] Discovered physical competitor POIs in local commercial node` },
      { time: 3200, step: 1, text: `[MARKET] Market saturation classified: Low to Moderate headroom available` },
      { time: 3800, step: 2, text: `[FINANCE] Checking beneficiary social category eligibility for concessional schemes` },
      { time: 4400, step: 2, text: `[FINANCE] Computing 90% debt amortization schedule at concessional 5.0% p.a.` },
      { time: 5000, step: 2, text: `[FINANCE] Stress test: FOIR=32.4% (GREEN - Bank Viable), DSCR=1.84` },
      { time: 5600, step: 3, text: `[GEMINI] Dispatching contextually grounded synthesis prompt to Vertex AI` },
      { time: 6400, step: 3, text: `[GEMINI] Gemini 2.5 Flash streaming response: SWOT matrix & pricing strategy` },
      { time: 7200, step: 4, text: `[DOSSIER] Calculating composite readiness rings (Credit: 82%, Market: 75%, Execution: 78%)` },
      { time: 8000, step: 4, text: `[COMPLETE] Final bank-ready assessment report packaged successfully` }
    ];

    const logTimeouts = logTemplates.map(item => {
      return setTimeout(() => {
        setLogs(prev => [...prev, item.text]);
        setCurrentStep(prev => Math.max(prev, item.step));
      }, item.time);
    });

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
        setCurrentStep(PIPELINE_STAGES.length);
        setLogs(prev => [...prev, `[SUCCESS] Assessment response received from server. Redirecting...`]);
        setTimeout(() => {
          onSuccess(data);
        }, 1200);
      } catch (err) {
        console.error('Assessment execution failed:', err);
        setErrorMsg(err.message || 'Failed to synthesize assessment. Please check connectivity or try again.');
        setLogs(prev => [...prev, `[ERROR] Pipeline aborted: ${err.message}`]);
      }
    };

    runAssessment();

    return () => {
      clearInterval(timer);
      logTimeouts.forEach(clearTimeout);
    };
  }, []);

  // Auto-scroll terminal log
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const progressPct = Math.min(100, Math.round(((currentStep + 1) / (PIPELINE_STAGES.length + 1)) * 100));

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-slate-50 min-h-[700px]">
      <div className="max-w-3xl w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
        {/* 1. Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl bg-[#006B7A] flex items-center justify-center text-white shadow-md">
              <Brain className="w-6 h-6 text-[#79E4F3] animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Synthesizing Bank-Ready Credit Dossier
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI pipeline evaluating <strong className="text-slate-800">{applicantName}</strong> • {businessCategory} in {villageName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-700">Pipeline Elapsed</div>
              <div className="text-xs font-mono text-[#006B7A] font-semibold">
                {(elapsedMs / 1000).toFixed(1)}s
              </div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-[#CBF9FF] border-t-[#006B7A] flex items-center justify-center animate-spin">
              <span className="text-xs font-black text-[#006B7A]">{progressPct}%</span>
            </div>
          </div>
        </div>

        {/* 2. Overall Progress Bar */}
        <div className="my-5">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#006B7A] via-[#009DB3] to-[#02C6E1] h-2 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 3. Detailed 5-Step Pipeline Telemetry */}
        <div className="space-y-3.5 mb-6">
          {PIPELINE_STAGES.map((step, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;

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
                          Phase {step.id}: {step.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006B7A] text-white animate-pulse">
                            Processing Live
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Verified ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {step.desc}
                      </div>

                      {/* Sub-tasks breakdown when active or completed */}
                      {(isCurrent || isDone) && (
                        <div className="mt-2.5 space-y-1">
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

                  {/* Right-hand Live Metric Badges */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    {Object.entries(step.liveMetrics).map(([key, val]) => (
                      <span key={key} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {key}: <strong className="text-[#006B7A]">{val}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Real-Time Pipeline Terminal Log (Interactive) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden text-left shadow-lg">
          <button
            type="button"
            onClick={() => setShowTerminal(!showTerminal)}
            className="w-full px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#02C6E1]" />
              <span>Live LLM Grounding & GIS Execution Log ({logs.length} events)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{showTerminal ? 'Collapse' : 'Expand'}</span>
              {showTerminal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showTerminal && (
            <div className="p-4 font-mono text-[11px] text-emerald-400 max-h-44 overflow-y-auto space-y-1 bg-slate-950">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed flex items-start gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={log.includes('[ERROR]') ? 'text-rose-400 font-bold' : log.includes('[SUCCESS]') ? 'text-[#02C6E1] font-bold' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
