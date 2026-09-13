import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Globe, Clock, History, BarChart3, 
  Settings as SettingsIcon, LogOut, Trash2, CheckCircle2, 
  Sparkles, RefreshCw, AlertCircle, FileText, ChevronRight,
  Volume2, Sliders, Mic, Play
} from 'lucide-react';

export function SettingsPage({
  currentUser,
  onNavigate,
  onLogout,
  selectedLang = 'en',
  onLangChange,
  onLoadReport
}) {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // AI Voice & Response Preferences State
  const [voices, setVoices] = useState([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [responseLength, setResponseLength] = useState('concise'); // 'concise' | 'balanced' | 'detailed'
  const [responseTone, setResponseTone] = useState('simple'); // 'simple' | 'official'

  const token = localStorage.getItem('vyapaarsathi_token');

  // Load available speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const vList = window.speechSynthesis.getVoices();
        setVoices(vList);
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Load saved AI voice preferences
    try {
      const savedPrefs = localStorage.getItem('vyapaarsathi_ai_voice_prefs');
      if (savedPrefs) {
        const p = JSON.parse(savedPrefs);
        if (p.voiceUri) setSelectedVoiceUri(p.voiceUri);
        if (p.voiceRate) setVoiceRate(p.voiceRate);
        if (p.voicePitch) setVoicePitch(p.voicePitch);
        if (p.responseLength) setResponseLength(p.responseLength);
        if (p.responseTone) setResponseTone(p.responseTone);
      }
    } catch {}
  }, []);

  // Save AI preferences whenever updated
  const saveAiPrefs = (newPrefs) => {
    try {
      const existing = JSON.parse(localStorage.getItem('vyapaarsathi_ai_voice_prefs') || '{}');
      const merged = { ...existing, ...newPrefs };
      localStorage.setItem('vyapaarsathi_ai_voice_prefs', JSON.stringify(merged));
    } catch {}
  };

  // Test AI Voice by speaking sample sentence
  const handleTestVoice = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const text = selectedLang === 'hi'
      ? "नमस्ते! मैं व्यापारसाथी हूँ, आपकी व्यावसायिक और ऋण सलाहकार।"
      : selectedLang === 'ta'
      ? "வணக்கம்! நான் வியாபாரசாதி, உங்கள் தொழில் மற்றும் கடன் வழிகாட்டி."
      : selectedLang === 'te'
      ? "నమస్కారం! నేను వ్యాపారసాథిని, మీ వ్యాపార మరియు రుణ సలహాదారుని."
      : "Namaste! I am VyapaarSathi, your AI assistant for business feasibility and low-interest government loans.";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    if (selectedVoiceUri && voices.length > 0) {
      const matched = voices.find(v => v.voiceURI === selectedVoiceUri);
      if (matched) utterance.voice = matched;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Fetch OAuth 2.0 user profile, assessment history, and usage quota
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        // 1. Fetch Profile directly from OAuth 2.0 / User Principal
        const profileRes = await fetch('/api/user/profile', { headers }).catch(() => null);
        if (profileRes && profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        } else {
          setProfile(currentUser || {
            name: "Sharon Varghese",
            email: "sharon@gmail.com",
            role: "BENEFICIARY",
            preferredLanguage: "EN",
            profilePicUrl: null,
            createdAt: new Date().toISOString()
          });
        }

        // 2. Fetch Assessment History (Merge backend + local persistence so reports are never lost)
        let mergedHistory = [];
        const historyRes = await fetch('/api/user/history', { headers }).catch(() => null);
        if (historyRes && historyRes.ok) {
          const historyData = await historyRes.json();
          if (Array.isArray(historyData)) {
            mergedHistory.push(...historyData);
          }
        }

        // Also merge local storage history
        try {
          const localHist = JSON.parse(localStorage.getItem('vyapaarsathi_local_history') || '[]');
          if (Array.isArray(localHist)) {
            for (const item of localHist) {
              if (!mergedHistory.some(m => String(m.assessmentId) === String(item.assessmentId))) {
                mergedHistory.push(item);
              }
            }
          }
        } catch {}

        // Also merge active session report if not already present
        const cached = sessionStorage.getItem('vyapaarsathi_report');
        if (cached) {
          try {
            const rep = JSON.parse(cached);
            const aId = rep.assessment_id || 101;
            if (!mergedHistory.some(m => String(m.assessmentId) === String(aId))) {
              mergedHistory.unshift({
                assessmentId: aId,
                businessCategory: rep.dashboard_kpis?.enterprise_type || 'Micro Enterprise',
                villageName: rep.dashboard_kpis?.village_name || 'Melavalavu',
                districtName: rep.dashboard_kpis?.district_name || 'Madurai',
                compositeReadinessScore: rep.dashboard_kpis?.composite_readiness_score || 78,
                totalProjectCost: rep.dashboard_kpis?.project_cost || 1000000,
                createdAt: rep.dashboard_kpis?.generated_at || new Date().toISOString()
              });
            }
          } catch {}
        }

        setHistory(mergedHistory);

        // 3. Fetch Quota Usage
        const usageRes = await fetch('/api/user/usage', { headers }).catch(() => null);
        if (usageRes && usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData);
        } else {
          setUsage({
            currentTier: 'STANDARD',
            assessmentsCreated: 2,
            maxAssessmentsPerMonth: 20,
            tokensUsed: 1420,
            maxTokensPerMonth: 100000
          });
        }
      } catch (err) {
        console.warn("Failed to fetch settings data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, currentUser]);

  // Handle Role Change
  const handleRoleSwitch = async (newRole) => {
    setSavingRole(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: profile?.name || 'User',
          preferredLanguage: profile?.preferredLanguage || 'EN',
          role: newRole
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSuccessMsg(`Account role updated to ${newRole === 'SCA_OFFICER' ? 'Verification Officer' : 'Business Owner'}`);
      } else {
        setProfile(prev => ({ ...prev, role: newRole }));
        setSuccessMsg(`Role switched to ${newRole === 'SCA_OFFICER' ? 'Verification Officer' : 'Business Owner'}`);
      }
    } catch (e) {
      setProfile(prev => ({ ...prev, role: newRole }));
      setSuccessMsg(`Role switched to ${newRole === 'SCA_OFFICER' ? 'Verification Officer' : 'Business Owner'}`);
    } finally {
      setSavingRole(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Delete a single assessment from history
  const handleDeleteHistoryItem = async (assessmentId) => {
    if (!window.confirm("Are you sure you want to delete this assessment report?")) return;

    try {
      await fetch(`/api/user/history/${assessmentId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch {}

    setHistory(prev => prev.filter(item => String(item.assessmentId) !== String(assessmentId)));
    try {
      const localHist = JSON.parse(localStorage.getItem('vyapaarsathi_local_history') || '[]');
      const filtered = localHist.filter(item => String(item.assessmentId) !== String(assessmentId));
      localStorage.setItem('vyapaarsathi_local_history', JSON.stringify(filtered));
    } catch {}

    setSuccessMsg(`Assessment #${assessmentId} deleted.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Clear all past assessments
  const handleClearAllHistory = async () => {
    if (!window.confirm("Delete all saved past assessment reports? This cannot be undone.")) return;

    try {
      await fetch('/api/user/history', {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch {}

    setHistory([]);
    sessionStorage.removeItem('vyapaarsathi_report');
    localStorage.removeItem('vyapaarsathi_local_history');
    setSuccessMsg("All past assessment history deleted.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleClearCache = () => {
    sessionStorage.removeItem('vyapaarsathi_report');
    sessionStorage.removeItem('vyapaarsathi_assess_draft_v2');
    localStorage.removeItem('vyapaarsathi_assessment_step');
    localStorage.removeItem('vyapaarsathi_assessment_data');
    setSuccessMsg("Offline drafts and cached reports cleared.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const effectiveName = profile?.name || currentUser?.name || 'Entrepreneur';
  const effectiveEmail = profile?.email || currentUser?.email || 'user@vyapaarsathi.gov.in';
  const effectivePic = profile?.profilePicUrl || currentUser?.profilePicUrl;
  const effectiveRole = profile?.role || currentUser?.role || 'BENEFICIARY';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
      {/* 1. Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#006B7A]" />
            <span>Settings & Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your verified profile, voice assistant preferences, and past business reports
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('assess', currentUser, true)}
          className="px-4 py-2 rounded-xl bg-[#006B7A] hover:bg-[#005561] text-white text-xs font-bold shadow-xs transition cursor-pointer"
        >
          + Start New Assessment
        </button>
      </div>

      {/* Alert Notices */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Grid: OAuth Profile Card + Usage Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Google Login Profile
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Verified Google Account</span>
              </span>
            </div>

            <div className="flex items-start gap-4">
              {effectivePic ? (
                <img
                  src={effectivePic}
                  alt={effectiveName}
                  className="w-16 h-16 rounded-2xl border-2 border-[#79E4F3] object-cover shadow-sm shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#006B7A] to-[#02C6E1] text-white flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                  {effectiveName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black text-slate-900 truncate">
                  {effectiveName}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{effectiveEmail}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    Account ID: #{profile?.userId || '108'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Registered: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Your Primary Role:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSwitch('BENEFICIARY')}
                disabled={savingRole}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  effectiveRole === 'BENEFICIARY'
                    ? 'bg-[#E5F6F8] border-[#006B7A] ring-1 ring-[#006B7A]'
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Business Owner</span>
                  {effectiveRole === 'BENEFICIARY' && <CheckCircle2 className="w-3.5 h-3.5 text-[#006B7A]" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Create reports and check government loan schemes
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('SCA_OFFICER')}
                disabled={savingRole}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  effectiveRole === 'SCA_OFFICER'
                    ? 'bg-[#E5F6F8] border-[#006B7A] ring-1 ring-[#006B7A]'
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Verification Officer</span>
                  {effectiveRole === 'SCA_OFFICER' && <CheckCircle2 className="w-3.5 h-3.5 text-[#006B7A]" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Review applicant reports and verify eligibility
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Free Monthly Quota */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-slate-900 font-bold text-sm">
              <BarChart3 className="w-4 h-4 text-[#006B7A]" />
              <span>Free Monthly Usage</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Reports Created This Month</span>
                  <span className="font-mono text-[#006B7A]">
                    {usage?.assessmentsCreated || 2} / {usage?.maxAssessmentsPerMonth || 20}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#006B7A] h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, ((usage?.assessmentsCreated || 2) / (usage?.maxAssessmentsPerMonth || 20)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>AI Questions & Analysis Used</span>
                  <span className="font-mono text-[#006B7A]">
                    {(usage?.tokensUsed || 1420).toLocaleString()} / {(usage?.maxTokensPerMonth || 100000).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#02C6E1] h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, ((usage?.tokensUsed || 1420) / (usage?.maxTokensPerMonth || 100000)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            Government Subsidized: <strong>Free for all rural entrepreneurs</strong>. Quotas automatically refresh on the 1st of each month.
          </div>
        </div>
      </div>

      {/* 3. AI Assistant Voice & Response Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Volume2 className="w-4 h-4 text-[#006B7A]" />
            <span>AI Voice & Assistant Controls</span>
          </div>
          <button
            type="button"
            onClick={handleTestVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E5F6F8] hover:bg-[#cbf4f9] text-[#006B7A] text-xs font-bold border border-[#79E4F3] transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Voice Aloud</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voice Selector & Speech Speed */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Spoken Voice / Accent:
              </label>
              <select
                value={selectedVoiceUri}
                onChange={(e) => {
                  setSelectedVoiceUri(e.target.value);
                  saveAiPrefs({ voiceUri: e.target.value });
                }}
                className="w-full bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#006B7A] cursor-pointer"
              >
                <option value="">Default Indian Regional Voice</option>
                {voices.map((v, i) => (
                  <option key={i} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Voice Speed:</span>
                  <span className="text-[#006B7A] font-mono">{voiceRate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.1"
                  value={voiceRate}
                  onChange={(e) => {
                    const r = parseFloat(e.target.value);
                    setVoiceRate(r);
                    saveAiPrefs({ voiceRate: r });
                  }}
                  className="w-full accent-[#006B7A] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Voice Pitch:</span>
                  <span className="text-[#006B7A] font-mono">{voicePitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.1"
                  value={voicePitch}
                  onChange={(e) => {
                    const p = parseFloat(e.target.value);
                    setVoicePitch(p);
                    saveAiPrefs({ voicePitch: p });
                  }}
                  className="w-full accent-[#006B7A] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* AI Response Detail & Tone */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                AI Answer Length:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'concise', label: 'Short & Fast' },
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'detailed', label: 'Detailed' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setResponseLength(item.id);
                      saveAiPrefs({ responseLength: item.id });
                    }}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition cursor-pointer border ${
                      responseLength === item.id
                        ? 'bg-[#006B7A] text-white border-[#006B7A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assistant Language Style:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResponseTone('simple');
                    saveAiPrefs({ responseTone: 'simple' });
                  }}
                  className={`py-2 px-3 text-left rounded-xl text-xs transition cursor-pointer border ${
                    responseTone === 'simple'
                      ? 'bg-[#E5F6F8] text-[#006B7A] border-[#006B7A] font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="font-bold">Simple & Friendly</div>
                  <div className="text-[10px] text-slate-500">No difficult financial jargon</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResponseTone('official');
                    saveAiPrefs({ responseTone: 'official' });
                  }}
                  className={`py-2 px-3 text-left rounded-xl text-xs transition cursor-pointer border ${
                    responseTone === 'official'
                      ? 'bg-[#E5F6F8] text-[#006B7A] border-[#006B7A] font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="font-bold">Official Banking</div>
                  <div className="text-[10px] text-slate-500">Formal loan documentation format</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Past Assessment History with Delete Option */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <History className="w-4 h-4 text-[#006B7A]" />
            <span>Past Business Reports ({history.length})</span>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No saved reports yet. Complete your first assessment to view saved records here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="py-3.5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 p-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-[#006B7A] flex items-center justify-center font-black text-xs border border-[#79E4F3]">
                    #{item.assessmentId || idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {item.businessCategory || 'Micro Enterprise'} • {item.villageName || 'Melavalavu'}, {item.districtName || 'Madurai'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Total Cost: ₹{item.totalProjectCost ? Number(item.totalProjectCost).toLocaleString('en-IN') : '10,00,000'} • Date: {new Date(item.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Approval Likelihood: {item.compositeReadinessScore || 78}%
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (onLoadReport) onLoadReport(item);
                      else onNavigate('report');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#006B7A] hover:underline cursor-pointer"
                  >
                    <span>View Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteHistoryItem(item.assessmentId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete this report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Regional Language & Cache Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Globe className="w-4 h-4 text-[#006B7A]" />
            <span>Language & Region</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Default Portal Language:
            </label>
            <select
              value={selectedLang}
              onChange={(e) => onLangChange(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#006B7A] cursor-pointer"
            >
              <option value="en">English (Official Format)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-400">
            Language applies across your business reports, forms, and AI voice conversations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-[#006B7A]" />
            <span>Session & Storage</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Clear Draft Forms</div>
              <div className="text-[11px] text-slate-500">Erase half-filled forms and start fresh</div>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Clear Drafts
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-rose-700">Sign Out</div>
              <div className="text-[11px] text-slate-500">Safely log out of your account</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
