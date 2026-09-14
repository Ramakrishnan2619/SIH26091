import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Calculator, ShieldAlert, Building2, 
  Printer, Share2, Sparkles, AlertCircle, CheckCircle, RefreshCw, MessageSquare,
  FileText, PlusCircle, ArrowRight, Download, Bot
} from 'lucide-react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { AssessmentForm } from './components/AssessmentForm';
import { ProcessingScreen } from './components/ProcessingScreen';
import { LoginPage } from './components/LoginPage';
import { TabFeasibility } from './components/TabFeasibility';
import { TabFinancial } from './components/TabFinancial';
import { TabRisk } from './components/TabRisk';
import { TabSchemes } from './components/TabSchemes';
import { ChatDrawer } from './components/ChatDrawer';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { SchemeSearchModal } from './components/SchemeSearchModal';
import { SettingsPage } from './components/SettingsPage';
import { PageFooter } from './components/common/PageFooter';
import { getTranslation } from './utils/translations';

function App() {
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vyapaarsathi_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Page Routing: 'home' | 'assess' | 'processing' | 'report' | 'login'
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') || path.includes('/callback')) return 'assess';
    if (path.startsWith('/login')) return 'login';
    // If not authenticated, strictly allow only home or login
    try {
      const stored = localStorage.getItem('vyapaarsathi_user');
      if (!stored) return 'home';
    } catch {
      return 'home';
    }
    if (path.startsWith('/assess')) return 'assess';
    if (path.startsWith('/report')) return 'report';
    if (path.startsWith('/settings')) return 'settings';
    return 'home';
  });

  const [activeTab, setActiveTab] = useState('feasibility');
  const [selectedLang, setSelectedLang] = useState('en');
  
  // Clean initialization without demo reports
  const [reportData, setReportData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('vyapaarsathi_report');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [assessmentPayload, setAssessmentPayload] = useState(null);
  const [assessmentFormKey, setAssessmentFormKey] = useState(1);
  const [showLiveVoice, setShowLiveVoice] = useState(false);
  const [showSchemeModal, setShowSchemeModal] = useState(false);

  const t = getTranslation(selectedLang);

  // Handle Google OAuth 2.0 callback URL (/login/callback?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const path = window.location.pathname.toLowerCase();

    if (urlToken || path.includes('/callback')) {
      const token = urlToken || localStorage.getItem('vyapaarsathi_token');
      if (token) {
        localStorage.setItem('vyapaarsathi_token', token);
        
        // Fetch user profile from backend using the JWT token
        fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Profile fetch failed');
          })
          .then(userData => {
            const userObj = {
              userId: userData.userId,
              name: userData.name || 'Beneficiary',
              email: userData.email,
              role: userData.role || 'beneficiary'
            };
            localStorage.setItem('vyapaarsathi_user', JSON.stringify(userObj));
            setCurrentUser(userObj);
            if (userData.preferredLanguage) {
              setSelectedLang(userData.preferredLanguage);
            }
            // Clear URL query parameters and redirect to assess
            window.history.replaceState({}, '', '/assess');
            setCurrentPage('assess');
          })
          .catch(err => {
            console.warn('OAuth profile retrieval notice:', err);
            // Fallback decode from JWT
            try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);
              const fallbackUser = {
                email: payload.sub,
                name: payload.name || (payload.sub ? payload.sub.split('@')[0] : 'Beneficiary'),
                role: payload.role || 'beneficiary'
              };
              localStorage.setItem('vyapaarsathi_user', JSON.stringify(fallbackUser));
              setCurrentUser(fallbackUser);
              window.history.replaceState({}, '', '/assess');
              setCurrentPage('assess');
            } catch (decodeErr) {
              handleNavigate('login');
            }
          });
      }
    }
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      let effectiveUser = currentUser;
      if (!effectiveUser) {
        try {
          const stored = localStorage.getItem('vyapaarsathi_user');
          if (stored) effectiveUser = JSON.parse(stored);
        } catch {}
      }

      if (path.startsWith('/login')) {
        setCurrentPage('login');
      } else if (!effectiveUser) {
        setCurrentPage('home');
      } else if (path.startsWith('/assess')) {
        setCurrentPage('assess');
      } else if (path.startsWith('/report')) {
        setCurrentPage('report');
      } else if (path.startsWith('/settings')) {
        setCurrentPage('settings');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Sync tab from URL query parameter if on report page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['feasibility', 'financial', 'risk', 'schemes'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleNavigate = (page, activeUser = currentUser, resetAssess = false) => {
    let targetPage = page;
    let effectiveUser = activeUser;
    if (!effectiveUser) {
      try {
        const stored = localStorage.getItem('vyapaarsathi_user');
        if (stored) effectiveUser = JSON.parse(stored);
      } catch {}
    }

    if (!effectiveUser && page !== 'home' && page !== 'login') {
      targetPage = 'login';
    }

    if (targetPage === 'assess') {
      // If user is opening assessment fresh or requested reset, close previous assessment and start fresh
      if (resetAssess) {
        try {
          sessionStorage.removeItem('vyapaarsathi_assess_draft_v2');
          sessionStorage.removeItem('vyapaarsathi_report');
        } catch {}
        setReportData(null);
        setAssessmentPayload(null);
        setAssessmentFormKey(k => k + 1);
      }
    }

    setCurrentPage(targetPage);
    const targetPath = targetPage === 'home' ? '/' : `/${targetPage}`;
    window.history.pushState({}, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  const handleStartProcessing = (payload) => {
    setAssessmentPayload(payload);
    setCurrentPage('processing');
    window.history.pushState({}, '', '/assess');
  };

  const handleAssessmentComplete = (unifiedReport) => {
    const vc = unifiedReport.villageContext || {};
    const kpis = unifiedReport.dashboardKpis || {};
    const m1 = unifiedReport.module1Report || {};
    const m2 = unifiedReport.module2Result || {};

    const targetLat = Number(assessmentPayload?.latitude || unifiedReport.latitude || vc.latitude) || 10.0524;
    const targetLng = Number(assessmentPayload?.longitude || unifiedReport.longitude || vc.longitude) || 78.3344;

    const normalizedReport = {
      assessment_id: unifiedReport.assessmentId,
      latitude: targetLat,
      longitude: targetLng,
      dashboard_kpis: {
        assessment_id: unifiedReport.assessmentId,
        village_name: vc.villageName || vc.village_name || 'Selected Village',
        subdistrict_name: vc.subdistrictName || vc.subdistrict_name || '',
        district_name: vc.districtName || vc.district_name || 'District',
        state_name: vc.stateName || 'India',
        latitude: targetLat,
        longitude: targetLng,
        enterprise_type: unifiedReport.businessCategory || 'Micro Enterprise',
        project_cost: kpis.totalProjectCost || m2.projectCost || 1000000,
        margin_money: kpis.marginMoney || m2.marginCapital || 100000,
        loan_amount: kpis.concessionalLoan || m2.loanAmount || 900000,
        scheme_name: kpis.schemeName || m2.schemeName || 'Term Loan Scheme',
        foir_badge: kpis.foirBadgeColor || m2.foirBadgeColor || 'GREEN',
        foir_verdict: kpis.foirVerdictLabel || m2.foirVerdictLabel || 'SAFE',
        composite_readiness_score: kpis.readinessRings?.compositeScorePct || 78,
        monthly_installment: m2.monthlyEquivalentInstallment || 13500,
        generated_at: unifiedReport.createdAt || new Date().toISOString()
      },
      applicantDetails: {
        ownerName: assessmentPayload?.ownerName || unifiedReport.ownerName || 'Applicant',
        age: assessmentPayload?.age || unifiedReport.age || 32,
        gender: assessmentPayload?.gender || unifiedReport.gender || 'Female',
        socialCategory: assessmentPayload?.socialCategory || unifiedReport.socialCategory || 'OBC',
        disabilityStatus: assessmentPayload?.disabilityStatus ?? unifiedReport.disabilityStatus ?? false,
        exServicemenStatus: assessmentPayload?.exServicemenStatus ?? unifiedReport.exServicemenStatus ?? false,
        villageName: vc.villageName || vc.village_name || assessmentPayload?.villageName || '',
        districtName: vc.districtName || vc.district_name || assessmentPayload?.districtName || '',
        stateName: vc.stateName || assessmentPayload?.stateName || 'Tamil Nadu',
        selectedLang: selectedLang
      },
      module1_feasibility: {
        latitude: targetLat,
        longitude: targetLng,
        village_context: {
          ...vc,
          latitude: targetLat,
          longitude: targetLng
        },
        marketReach: m1.marketReach,
        opportunityAnalysis: m1.opportunityAnalysis,
        swotAnalysis: m1.swotAnalysis,
        productMarketValue: m1.productMarketValue,
        competitorDensity: m1.competitorDensity || m1.competitorMapping,
        supply_metrics: unifiedReport.supplyMetrics || unifiedReport.supply_metrics || m1.supplyMetrics
      },
      module2_financial: m2
    };

    sessionStorage.setItem('vyapaarsathi_report', JSON.stringify(normalizedReport));

    try {
      const historyItem = {
        assessmentId: normalizedReport.assessment_id || Date.now(),
        businessCategory: normalizedReport.dashboard_kpis?.enterprise_type || 'Micro Enterprise',
        villageName: normalizedReport.dashboard_kpis?.village_name || vc?.village_name || 'Melavalavu',
        districtName: normalizedReport.dashboard_kpis?.district_name || vc?.district_name || 'Madurai',
        compositeReadinessScore: normalizedReport.dashboard_kpis?.composite_readiness_score || 78,
        totalProjectCost: normalizedReport.dashboard_kpis?.project_cost || 1000000,
        createdAt: new Date().toISOString()
      };
      const existingHistory = JSON.parse(localStorage.getItem('vyapaarsathi_local_history') || '[]');
      const filtered = existingHistory.filter(h => h.assessmentId !== historyItem.assessmentId);
      filtered.unshift(historyItem);
      localStorage.setItem('vyapaarsathi_local_history', JSON.stringify(filtered));
    } catch {}

    setReportData(normalizedReport);
    setCurrentPage('report');
    window.history.pushState({}, '', '/report');
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    handleNavigate('assess', user, true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('vyapaarsathi_token');
    localStorage.removeItem('vyapaarsathi_user');
    setCurrentUser(null);
    handleNavigate('home');
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const { dashboard_kpis, module1_feasibility, module2_financial } = reportData || {};

  return (
    <div className="min-h-screen w-full max-w-full bg-[#F6FCFD] text-slate-900 flex flex-col font-sans overflow-x-hidden">
      {/* 1. Global Sovereign Header */}
      <Header
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
        onDownloadPdf={handleDownloadPdf}
        onOpenAiChat={() => setShowLiveVoice(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Page Content */}
      <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
        {currentPage === 'home' && (
          <LandingPage
            currentUser={currentUser}
            selectedLang={selectedLang}
            onStartAssessment={() => handleNavigate('assess', currentUser, true)}
            onGoToLogin={() => handleNavigate('login')}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            selectedLang={selectedLang}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'assess' && (
          <AssessmentForm
            key={assessmentFormKey}
            defaultUser={currentUser}
            selectedLang={selectedLang}
            onSubmit={handleStartProcessing}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'processing' && (
          <ProcessingScreen
            payload={assessmentPayload}
            onSuccess={handleAssessmentComplete}
            onError={() => setCurrentPage('assess')}
          />
        )}

        {/* Report View: Empty State */}
        {currentPage === 'report' && !reportData && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-slate-50 min-h-[550px]">
            <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0B2545] flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1">
                {t.noReportTitle}
              </h2>
              <h3 className="text-sm font-semibold text-slate-600 mb-4">
                {t.noReportSubtitle}
              </h3>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                {t.noReportDesc}
              </p>
              <button
                type="button"
                onClick={() => handleNavigate('assess', currentUser, true)}
                className="w-full py-3.5 rounded-xl bg-[#006B7A] hover:bg-[#00525E] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#A8EFF9]" />
                <span>{t.btnStartAssessment}</span>
              </button>
            </div>
          </div>
        )}

        {/* Report View: Active Generated Report */}
        {currentPage === 'report' && reportData && (
          <div className="flex-1 flex flex-col">
            {/* Top Dossier Summary Banner */}
            <section className="bg-white border-b border-slate-200 py-6 px-6 shadow-xs">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                      {t.dossierLabel}{dashboard_kpis?.assessment_id || '101'}
                    </span>
                    <h1 className="text-xl font-black text-slate-900">
                      {dashboard_kpis?.enterprise_type || 'Micro Enterprise Assessment'}
                    </h1>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t.verifiedReport}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Applicant: <strong>{dashboard_kpis?.owner_name || currentUser?.name || 'Applicant'}</strong> • Village: <strong>{dashboard_kpis?.village_name}, {dashboard_kpis?.district_name}</strong> • Scheme: <strong>{dashboard_kpis?.scheme_name}</strong>
                  </p>
                </div>

                {/* Key Financial Badges */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">{t.totalCostLabel}</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ₹{Number(dashboard_kpis?.project_cost || 1000000).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-right">
                    <div className="text-xs text-slate-500">{t.loanAmountLabel}</div>
                    <div className="text-lg font-black text-blue-700 mt-0.5">
                      ₹{Number(dashboard_kpis?.loan_amount || 900000).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-500">{t.marginLabel}</div>
                    <div className="text-lg font-black text-emerald-700 mt-0.5">
                      ₹{Number(dashboard_kpis?.margin_money || 100000).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sticky Dossier Tabs Navigation */}
            <nav className="sticky top-28 z-40 bg-white border-b border-slate-200 px-6 shadow-xs no-print">
              <div className="max-w-7xl mx-auto flex overflow-x-auto gap-3 py-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('feasibility')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'feasibility'
                      ? 'bg-[#0B2545] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{t.tabFeasibility}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('financial')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'financial'
                      ? 'bg-[#0B2545] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>{t.tabFinancial}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('risk')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'risk'
                      ? 'bg-[#0B2545] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t.tabRisk}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('schemes')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'schemes'
                      ? 'bg-[#0B2545] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t.tabSchemes}</span>
                </button>
              </div>
            </nav>

            {/* Main Tab Content Area with Breathing Space */}
            <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
              {activeTab === 'feasibility' && (
                <TabFeasibility
                  reportData={module1_feasibility}
                  dashboardKpis={dashboard_kpis}
                  villageContext={module1_feasibility?.village_context || dashboard_kpis}
                  supplyMetrics={module1_feasibility?.supply_metrics}
                  selectedLang={selectedLang}
                />
              )}

              {activeTab === 'financial' && (
                <TabFinancial
                  module2Result={module2_financial}
                  selectedLang={selectedLang}
                  onMarginChange={(newMargin) => {}}
                />
              )}

              {activeTab === 'risk' && (
                <TabRisk
                  module1Report={module1_feasibility}
                  module2Result={module2_financial}
                  dashboardKpis={dashboard_kpis}
                  selectedLang={selectedLang}
                />
              )}

              {activeTab === 'schemes' && (
                <TabSchemes
                  module2Result={module2_financial}
                  selectedLang={selectedLang}
                  applicantDetails={reportData?.applicantDetails || assessmentPayload}
                  onOpenSchemeSearch={() => setShowSchemeModal(true)}
                />
              )}
            </main>

            {/* Schemes Recommendation Modal */}
            <SchemeSearchModal
              assessmentId={dashboard_kpis?.assessment_id || 101}
              isOpen={showSchemeModal}
              onClose={() => setShowSchemeModal(false)}
              defaultCategory={reportData?.applicantDetails?.socialCategory || dashboard_kpis?.socialCategory || 'OBC'}
              applicantDetails={reportData?.applicantDetails || assessmentPayload}
              selectedLang={selectedLang}
            />
          </div>
        )}

        {/* 5. Settings Page */}
        {currentPage === 'settings' && (
          <SettingsPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            selectedLang={selectedLang}
            onLangChange={setSelectedLang}
            onLoadReport={(historyItem) => {
              if (historyItem) {
                const cached = sessionStorage.getItem('vyapaarsathi_report');
                if (cached) {
                  try {
                    const parsed = JSON.parse(cached);
                    if (String(parsed.assessment_id) === String(historyItem.assessmentId)) {
                      setReportData(parsed);
                      handleNavigate('report');
                      return;
                    }
                  } catch {}
                }
                const cost = Number(historyItem.totalProjectCost) || 1000000;
                setReportData({
                  assessment_id: historyItem.assessmentId,
                  latitude: 10.0524,
                  longitude: 78.3344,
                  dashboard_kpis: {
                    assessment_id: historyItem.assessmentId,
                    village_name: historyItem.villageName || 'Selected Village',
                    district_name: historyItem.districtName || 'Madurai',
                    state_name: 'India',
                    enterprise_type: historyItem.businessCategory || 'Micro Enterprise',
                    project_cost: cost,
                    margin_money: Math.round(cost * 0.10),
                    loan_amount: Math.round(cost * 0.90),
                    composite_readiness_score: historyItem.compositeReadinessScore || 78,
                    scheme_name: 'Term Loan Scheme',
                    interest_rate_pa: 8.0,
                    tenure_months: 84
                  }
                });
              }
              handleNavigate('report');
            }}
          />
        )}
      </main>

      {/* Global AI Assistant Floating FAB & Live Voice Modal (Available on all authenticated pages) */}
      {currentUser && (
        <>
          <ChatDrawer
            assessmentId={dashboard_kpis?.assessment_id || reportData?.assessment_id || 101}
            preferredLang={selectedLang}
            onOpenLiveVoice={() => setShowLiveVoice(true)}
          />

          <LiveVoiceModal
            assessmentId={dashboard_kpis?.assessment_id || reportData?.assessment_id || 101}
            isOpen={showLiveVoice}
            onClose={() => setShowLiveVoice(false)}
            preferredLang={selectedLang}
          />
        </>
      )}

      {/* 3. Official Sovereign Government PageFooter */}
      <PageFooter selectedLang={selectedLang} />
    </div>
  );
}

export default App;
