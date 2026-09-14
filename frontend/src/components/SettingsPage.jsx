import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Globe, Clock, History, BarChart3, 
  Settings as SettingsIcon, LogOut, Trash2, CheckCircle2, 
  Sparkles, RefreshCw, AlertCircle, FileText, ChevronRight,
  Volume2, Sliders, Mic, Play
} from 'lucide-react';

const SETTINGS_I18N = {
  en: {
    title: "Settings & Preferences",
    subtitle: "Manage your verified profile, voice assistant preferences, and past business reports",
    btnNewAssessment: "+ Start New Assessment",
    googleProfile: "Google Login Profile",
    verifiedAccount: "Verified Google Account",
    accountId: "Account ID",
    registered: "Registered",
    active: "Active",
    primaryRole: "Your Primary Role:",
    businessOwner: "Business Owner",
    businessOwnerDesc: "Create reports and check government loan schemes",
    verificationOfficer: "Verification Officer",
    verificationOfficerDesc: "Review applicant reports and verify eligibility",
    monthlyUsage: "Free Monthly Usage",
    reportsCreated: "Reports Created This Month",
    questionsUsed: "AI Questions & Analysis Used",
    subsidizedNotice: "Government Subsidized: Free for all rural entrepreneurs. Quotas automatically refresh on the 1st of each month.",
    voiceControls: "AI Voice & Assistant Controls",
    testVoice: "Test Voice Aloud",
    spokenVoice: "Spoken Voice / Accent:",
    defaultVoice: "Default Indian Regional Voice",
    voiceSpeed: "Voice Speed:",
    voicePitch: "Voice Pitch:",
    answerLength: "AI Answer Length:",
    shortFast: "Short & Fast",
    balanced: "Balanced",
    detailed: "Detailed",
    assistantStyle: "Assistant Language Style:",
    simpleFriendly: "Simple & Friendly",
    simpleDesc: "No difficult financial jargon",
    officialBanking: "Official Banking",
    officialDesc: "Formal loan documentation format",
    pastReports: "Past Business Reports",
    clearAll: "Clear All History",
    noReports: "No saved past assessments found",
    noReportsDesc: "Your generated business feasibility reports and loan dossiers will appear here automatically.",
    btnCreateFirst: "Create Your First Report",
    totalCost: "Total Cost",
    date: "Date",
    approvalLikelihood: "Approval Likelihood",
    viewReport: "View Report",
    deleteReport: "Delete this report",
    languageRegion: "Language & Region",
    defaultLang: "Default Portal Language:",
    langNotice: "Language applies across your business reports, forms, and AI voice conversations.",
    sessionStorage: "Session & Storage",
    clearDrafts: "Clear Draft Forms",
    clearDraftsDesc: "Erase half-filled forms and start fresh",
    btnClearDrafts: "Clear Drafts",
    signOut: "Sign Out",
    signOutDesc: "Safely log out of your account",
    btnLogOut: "Log Out"
  },
  ta: {
    title: "அமைப்புகள் & விருப்பத்தேர்வுகள்",
    subtitle: "உங்கள் சரிபார்க்கப்பட்ட சுயவிவரம், AI குரல் உதவியாளர் விருப்பங்கள் மற்றும் முந்தைய தொழில் அறிக்கைகளை நிர்வகிக்கவும்",
    btnNewAssessment: "+ புதிய திட்ட அறிக்கை தொடங்க",
    googleProfile: "கூகுள் கணக்கு சுயவிவரம்",
    verifiedAccount: "சரிபார்க்கப்பட்ட கணக்கு",
    accountId: "கணக்கு எண்",
    registered: "பதிவு தேதி",
    active: "செயல்பாட்டில் உள்ளது",
    primaryRole: "உங்கள் முதன்மைப் பங்கு:",
    businessOwner: "தொழில்முனைவோர்",
    businessOwnerDesc: "திட்ட அறிக்கைகளை உருவாக்கி அரசு கடன் திட்டங்களை சரிபார்க்கவும்",
    verificationOfficer: "சரிபார்ப்பு அலுவலர்",
    verificationOfficerDesc: "விண்ணப்பதாரர் அறிக்கைகளை மதிப்பாய்வு செய்து தகுதியை சரிபார்க்கவும்",
    monthlyUsage: "இலவச மாதாந்திர பயன்பாடு",
    reportsCreated: "இந்த மாதம் உருவாக்கப்பட்ட அறிக்கைகள்",
    questionsUsed: "பயன்படுத்தப்பட்ட AI வினாக்கள் & பகுப்பாய்வு",
    subsidizedNotice: "அரசு மானியம்: அனைத்து கிராமப்புற தொழில்முனைவோருக்கும் 100% இலவசம். ஒதுக்கீடு ஒவ்வொரு மாதமும் 1-ம் தேதி புதுப்பிக்கப்படும்.",
    voiceControls: "AI குரல் & உதவியாளர் அமைப்புகள்",
    testVoice: "குரல் மாதிரியைக் கேட்க",
    spokenVoice: "பேசும் குரல் / உச்சரிப்பு:",
    defaultVoice: "இயல்புநிலை இந்திய பிராந்தியக் குரல்",
    voiceSpeed: "குரல் வேகம்:",
    voicePitch: "குரல் சுருதி (Pitch):",
    answerLength: "AI பதிலின் நீளம்:",
    shortFast: "சுருக்கமாகவும் விரைவாகவும்",
    balanced: "சமநிலையானது",
    detailed: "விரிவான விளக்கம்",
    assistantStyle: "உதவியாளரின் மொழி நடை:",
    simpleFriendly: "எளிய & நட்பான நடை",
    simpleDesc: "கடினமான வங்கி கலைச்சொற்கள் இன்றி",
    officialBanking: "அதிகாரப்பூர்வ வங்கி நடை",
    officialDesc: "முறையான கடன் ஆவண நடை",
    pastReports: "முந்தைய வணிக அறிக்கைகள்",
    clearAll: "அனைத்து வரலாற்றையும் நீக்குக",
    noReports: "சேமிக்கப்பட்ட முந்தைய அறிக்கைகள் எதுவும் இல்லை",
    noReportsDesc: "நீங்கள் உருவாக்கும் தொழில் சாத்தியக்கூறு அறிக்கைகள் மற்றும் கடன் ஆவணங்கள் தானாகவே இங்கு தோன்றும்.",
    btnCreateFirst: "முதல் அறிக்கையை உருவாக்கவும்",
    totalCost: "மொத்த திட்ட செலவு",
    date: "தேதி",
    approvalLikelihood: "ஒப்புதல் சாத்தியக்கூறு",
    viewReport: "அறிக்கையைப் பார்க்க",
    deleteReport: "இந்த அறிக்கையை நீக்குக",
    languageRegion: "மொழி மற்றும் பிராந்தியம்",
    defaultLang: "இயல்புநிலை இணையதள மொழி:",
    langNotice: "இந்த மொழி உங்கள் தொழில் அறிக்கைகள், படிவங்கள் மற்றும் AI குரல் உரையாடல்களில் பயன்படுத்தப்படும்.",
    sessionStorage: "அமர்வு மற்றும் சேமிப்பு",
    clearDrafts: "வரைவுப் படிவங்களை நீக்குக",
    clearDraftsDesc: "அரைகுறையாக நிரப்பப்பட்ட படிவங்களை அழித்து புதிதாகத் தொடங்க",
    btnClearDrafts: "வரைவுகளை நீக்குக",
    signOut: "வெளியேறு (Log Out)",
    signOutDesc: "உங்கள் கணக்கிலிருந்து பாதுகாப்பாக வெளியேறவும்",
    btnLogOut: "வெளியேறு"
  },
  hi: {
    title: "सेटिंग्स और प्राथमिकताएं",
    subtitle: "अपनी सत्यापित प्रोफ़ाइल, वॉइस असिस्टेंट प्राथमिकताओं और पिछली व्यावसायिक रिपोर्टों का प्रबंधन करें",
    btnNewAssessment: "+ नया मूल्यांकन शुरू करें",
    googleProfile: "गूगल लॉगिन प्रोफ़ाइल",
    verifiedAccount: "सत्यापित खाता",
    accountId: "खाता संख्या",
    registered: "पंजीकृत",
    active: "सक्रिय",
    primaryRole: "आपकी प्राथमिक भूमिका:",
    businessOwner: "उद्यमी / व्यवसाय मालिक",
    businessOwnerDesc: "रिपोर्ट बनाएं और सरकारी ऋण योजनाओं की जांच करें",
    verificationOfficer: "सत्यापन अधिकारी",
    verificationOfficerDesc: "आवेदक रिपोर्टों की समीक्षा करें और पात्रता सत्यापित करें",
    monthlyUsage: "निःशुल्क मासिक उपयोग",
    reportsCreated: "इस महीने बनाई गई रिपोर्टें",
    questionsUsed: "उपयोग किए गए AI प्रश्न और विश्लेषण",
    subsidizedNotice: "सरकारी सब्सिडी: सभी ग्रामीण उद्यमियों के लिए 100% निःशुल्क। कोटा प्रत्येक माह की 1 तारीख को स्वतः नवीनीकृत होता है।",
    voiceControls: "AI वॉइस और असिस्टेंट नियंत्रण",
    testVoice: "वॉइस परीक्षण सुनें",
    spokenVoice: "वॉइस / उच्चारण:",
    defaultVoice: "डिफ़ॉल्ट भारतीय क्षेत्रीय आवाज़",
    voiceSpeed: "बोलने की गति:",
    voicePitch: "आवाज़ की पिच:",
    answerLength: "AI उत्तर की लंबाई:",
    shortFast: "संक्षिप्त और तीव्र",
    balanced: "संतुलित",
    detailed: "विस्तृत",
    assistantStyle: "सहायक भाषा शैली:",
    simpleFriendly: "सरल और मित्रवत",
    simpleDesc: "बिना किसी कठिन वित्तीय शब्दावली के",
    officialBanking: "आधिकारिक बैंकिंग",
    officialDesc: "औपचारिक ऋण दस्तावेज़ीकरण प्रारूप",
    pastReports: "पिछली व्यावसायिक रिपोर्टें",
    clearAll: "सभी इतिहास साफ़ करें",
    noReports: "कोई सहेजी गई पिछली रिपोर्ट नहीं मिली",
    noReportsDesc: "आपकी बनाई गई व्यावसायिक व्यवहार्यता रिपोर्ट और ऋण डोजियर स्वचालित रूप से यहां दिखाई देंगे।",
    btnCreateFirst: "अपनी पहली रिपोर्ट बनाएं",
    totalCost: "कुल लागत",
    date: "तारीख",
    approvalLikelihood: "स्वीकृति संभावना",
    viewReport: "रिपोर्ट देखें",
    deleteReport: "यह रिपोर्ट हटाएं",
    languageRegion: "भाषा और क्षेत्र",
    defaultLang: "पोर्टल की डिफ़ॉल्ट भाषा:",
    langNotice: "यह भाषा आपकी व्यावसायिक रिपोर्टों, फॉर्मों और AI आवाज़ पर लागू होती है।",
    sessionStorage: "सत्र और भंडारण",
    clearDrafts: "ड्राफ्ट फ़ॉर्म साफ़ करें",
    clearDraftsDesc: "आधे-अधूरे फ़ॉर्म मिटाएं और नए सिरे से शुरुआत करें",
    btnClearDrafts: "ड्राफ्ट साफ़ करें",
    signOut: "साइन आउट",
    signOutDesc: "अपने खाते से सुरक्षित रूप से लॉग आउट करें",
    btnLogOut: "लॉग आउट"
  },
  te: {
    title: "సెట్టింగ్‌లు & ప్రాధాన్యతలు",
    subtitle: "మీ ప్రొఫైల్, వాయిస్ అసిస్టెంట్ మరియు మునుపటి నివేదికలను నిర్వహించండి",
    btnNewAssessment: "+ కొత్త నివేదికను ప్రారంభించండి",
    googleProfile: "గూగుల్ ప్రొఫైల్",
    verifiedAccount: "ధృవీకరించబడిన ఖాతా",
    accountId: "ఖాతా ఐడీ",
    registered: "నమోదైన తేదీ",
    active: "క్రియాశీలకంగా ఉంది",
    primaryRole: "మీ ప్రాథమిక పాత్ర:",
    businessOwner: "వ్యాపార యజమాని",
    businessOwnerDesc: "నివేదికలను రూపొందించండి మరియు రుణ పథకాలను తనిఖీ చేయండి",
    verificationOfficer: "ధృవీకరణ అధికారి",
    verificationOfficerDesc: "దరఖాస్తుదారు నివేదికలను సమీక్షించండి",
    monthlyUsage: "ఉచిత నెలవారీ కోటా",
    reportsCreated: "ఈ నెల రూపొందించిన నివేదికలు",
    questionsUsed: "AI ప్రశ్నలు & విశ్లేషణ కోటా",
    subsidizedNotice: "ప్రభుత్వ రాయితీ: గ్రామీణ వ్యవస్థాపకులందరికీ ఉచితం.",
    voiceControls: "AI వాయిస్ నియంత్రణలు",
    testVoice: "వాయిస్ వినండి",
    spokenVoice: "ఉచ్చారణ / స్వరం:",
    defaultVoice: "ప్రాంతీయ స్వరం",
    voiceSpeed: "మాట్లాడే వేగం:",
    voicePitch: "స్వర పిచ్:",
    answerLength: "సమాధానం నిడివి:",
    shortFast: "సంక్షిప్తంగా",
    balanced: "సమతుల్యం",
    detailed: "వివరణాత్మకంగా",
    assistantStyle: "భాష శైలి:",
    simpleFriendly: "సరళమైన శైలి",
    simpleDesc: "కష్టమైన ఆర్థిక పదాలు లేకుండా",
    officialBanking: "బ్యాంకింగ్ శైలి",
    officialDesc: "అధికారిక డాక్యుమెంటేషన్ ఫార్మాట్",
    pastReports: "గత నివేదికలు",
    clearAll: "చరిత్రను తొలగించండి",
    noReports: "గత నివేదికలు ఏవీ కనుగొనబడలేదు",
    noReportsDesc: "మీరు రూపొందించిన నివేదికలు ఇక్కడ కనిపిస్తాయి.",
    btnCreateFirst: "మొదటి నివేదికను సృష్టించండి",
    totalCost: "మొత్తం ఖర్చు",
    date: "తేదీ",
    approvalLikelihood: "ఆమోద సంభావ్యత",
    viewReport: "నివేదిక చూడండి",
    deleteReport: "తొలగించండి",
    languageRegion: "భాష మరియు ప్రాంతం",
    defaultLang: "పోర్టల్ భాష:",
    langNotice: "ఈ భాష నివేదికలు మరియు AI సంభాషణలలో వర్తిస్తుంది.",
    sessionStorage: "సెషన్ మరియు నిల్వ",
    clearDrafts: "డ్రాఫ్ట్ తొలగించండి",
    clearDraftsDesc: "సగం నింపిన ఫారాలను తొలగించి కొత్తగా ప్రారంభించండి",
    btnClearDrafts: "తొలగించు",
    signOut: "లాగ్ అవుట్",
    signOutDesc: "మీ ఖాతా నుండి సురక్షితంగా లాగ్ అవుట్ చేయండి",
    btnLogOut: "లాగ్ అవుట్"
  }
};

export function SettingsPage({
  currentUser,
  onNavigate,
  onLogout,
  selectedLang = 'en',
  onLangChange,
  onLoadReport
}) {
  const t = SETTINGS_I18N[selectedLang] || SETTINGS_I18N.en;

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
  const [responseLength, setResponseLength] = useState('concise');
  const [responseTone, setResponseTone] = useState('simple');

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

  // Test AI Voice by speaking sample sentence with correct language code
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

    const langCode = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'ta' ? 'ta-IN' : selectedLang === 'te' ? 'te-IN' : 'en-IN';
    utterance.lang = langCode;

    const available = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    if (selectedVoiceUri) {
      const matched = available.find(v => v.voiceURI === selectedVoiceUri);
      if (matched) utterance.voice = matched;
    } else {
      // Find regional voice matching selectedLang
      const regional = available.find(v => {
        const l = (v.lang || '').toLowerCase();
        const n = (v.name || '').toLowerCase();
        if (selectedLang === 'ta') return l.startsWith('ta') || n.includes('tamil') || n.includes('valluvar');
        if (selectedLang === 'hi') return l.startsWith('hi') || n.includes('hindi') || n.includes('kalpana') || n.includes('hemant');
        if (selectedLang === 'te') return l.startsWith('te') || n.includes('telugu');
        return l.startsWith('en-in') || l.startsWith('en');
      });
      // CRITICAL: Only set voice if a real regional voice exists. 
      // Do NOT set an English voice on Tamil text, which would mute or corrupt Tamil speech!
      if (regional) {
        utterance.voice = regional;
      }
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
            name: "Ramakrishnan S",
            email: "ramakrishnan@vyapaarsathi.gov.in",
            role: "beneficiary",
            preferredLanguage: (selectedLang || "ta").toLowerCase(),
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

        setHistory(mergedHistory);

        // 3. Fetch Quota Usage (Dynamically based on real activity)
        const usageRes = await fetch('/api/user/usage', { headers }).catch(() => null);
        if (usageRes && usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData);
        } else {
          setUsage({
            currentTier: 'STANDARD',
            assessmentsCreated: mergedHistory.length,
            maxAssessmentsPerMonth: 20,
            tokensUsed: Math.max(120, mergedHistory.length * 350),
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
  }, [token, currentUser, selectedLang]);

  // Handle Role Change
  const handleRoleSwitch = async (newRole) => {
    setSavingRole(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const backendRole = newRole.toLowerCase();

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: profile?.name || 'User',
          preferredLanguage: (selectedLang || 'ta').toLowerCase(),
          role: backendRole
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSuccessMsg(backendRole === 'sca_officer' ? "Role: Verification Officer" : "Role: Business Owner");
      } else {
        setProfile(prev => ({ ...prev, role: backendRole }));
        setSuccessMsg(backendRole === 'sca_officer' ? "Role: Verification Officer" : "Role: Business Owner");
      }
    } catch (e) {
      setProfile(prev => ({ ...prev, role: backendRole }));
      setSuccessMsg(backendRole === 'sca_officer' ? "Role: Verification Officer" : "Role: Business Owner");
    } finally {
      setSavingRole(false);
      setTimeout(() => setSuccessMsg(null), 3000);
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
    try {
      sessionStorage.clear();
      sessionStorage.removeItem('vyapaarsathi_assess_draft_v2');
      sessionStorage.removeItem('vyapaarsathi_report');
      localStorage.removeItem('vyapaarsathi_assessment_step');
      localStorage.removeItem('vyapaarsathi_assessment_data');
      localStorage.removeItem('vyapaarsathi_assess_draft_v2');
    } catch (e) {}

    setSuccessMsg(selectedLang === 'ta' ? "வரைவுப் படிவங்கள் வெற்றிகரமாக அழிக்கப்பட்டன!" : "Offline drafts and cached forms cleared successfully.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const effectiveName = profile?.name || currentUser?.name || 'Ramakrishnan S';
  const effectiveEmail = profile?.email || currentUser?.email || 'ramakrishnan@vyapaarsathi.gov.in';
  const effectivePic = profile?.profilePicUrl || currentUser?.profilePicUrl;
  const rawRole = (profile?.role || currentUser?.role || 'beneficiary').toLowerCase();
  const isOfficer = rawRole === 'sca_officer';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
      {/* 1. Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#006B7A]" />
            <span>{t.title}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('assess', currentUser, true)}
          className="px-4 py-2 rounded-xl bg-[#006B7A] hover:bg-[#005561] text-white text-xs font-bold shadow-xs transition cursor-pointer"
        >
          {t.btnNewAssessment}
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
                {t.googleProfile}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>{t.verifiedAccount}</span>
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
                    {t.accountId}: #{profile?.userId || '1'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {t.registered}: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : t.active}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {t.primaryRole}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSwitch('beneficiary')}
                disabled={savingRole}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  !isOfficer
                    ? 'bg-[#E5F6F8] border-[#006B7A] ring-1 ring-[#006B7A]'
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>{t.businessOwner}</span>
                  {!isOfficer && <CheckCircle2 className="w-3.5 h-3.5 text-[#006B7A]" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t.businessOwnerDesc}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('sca_officer')}
                disabled={savingRole}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  isOfficer
                    ? 'bg-[#E5F6F8] border-[#006B7A] ring-1 ring-[#006B7A]'
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>{t.verificationOfficer}</span>
                  {isOfficer && <CheckCircle2 className="w-3.5 h-3.5 text-[#006B7A]" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t.verificationOfficerDesc}
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
              <span>{t.monthlyUsage}</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{t.reportsCreated}</span>
                  <span className="font-mono text-[#006B7A]">
                    {usage?.assessmentsCreated !== undefined ? usage.assessmentsCreated : history.length} / {usage?.maxAssessmentsPerMonth || 20}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#006B7A] h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (((usage?.assessmentsCreated !== undefined ? usage.assessmentsCreated : history.length)) / (usage?.maxAssessmentsPerMonth || 20)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{t.questionsUsed}</span>
                  <span className="font-mono text-[#006B7A]">
                    {(usage?.tokensUsed || Math.max(150, history.length * 350)).toLocaleString()} / {(usage?.maxTokensPerMonth || 100000).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#02C6E1] h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (((usage?.tokensUsed || Math.max(150, history.length * 350))) / (usage?.maxTokensPerMonth || 100000)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            {t.subsidizedNotice}
          </div>
        </div>
      </div>

      {/* 3. AI Assistant Voice & Response Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Volume2 className="w-4 h-4 text-[#006B7A]" />
            <span>{t.voiceControls}</span>
          </div>
          <button
            type="button"
            onClick={handleTestVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E5F6F8] hover:bg-[#cbf4f9] text-[#006B7A] text-xs font-bold border border-[#79E4F3] transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{t.testVoice}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voice Selector & Speech Speed */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.spokenVoice}
              </label>
              <select
                value={selectedVoiceUri}
                onChange={(e) => {
                  setSelectedVoiceUri(e.target.value);
                  saveAiPrefs({ voiceUri: e.target.value });
                }}
                className="w-full bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#006B7A] cursor-pointer"
              >
                <option value="">{t.defaultVoice}</option>
                {voices.map((v, i) => (
                  <option key={i} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.voiceSpeed} <span className="text-[#006B7A] font-mono">{voiceRate}x</span>
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.voicePitch} <span className="text-[#006B7A] font-mono">{voicePitch}</span>
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
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

          {/* AI Response Behavior & Tone */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.answerLength}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'concise', label: t.shortFast },
                  { id: 'balanced', label: t.balanced },
                  { id: 'detailed', label: t.detailed }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setResponseLength(opt.id);
                      saveAiPrefs({ responseLength: opt.id });
                    }}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition cursor-pointer ${
                      responseLength === opt.id
                        ? 'bg-[#006B7A] text-white border-[#006B7A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.assistantStyle}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResponseTone('simple');
                    saveAiPrefs({ responseTone: 'simple' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    responseTone === 'simple'
                      ? 'bg-[#E5F6F8] border-[#006B7A] ring-1 ring-[#006B7A]'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{t.simpleFriendly}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t.simpleDesc}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResponseTone('official');
                    saveAiPrefs({ responseTone: 'official' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    responseTone === 'official'
                      ? 'bg-[#E5F6F8] border-[#006B7A] ring-1 ring-[#006B7A]'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{t.officialBanking}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t.officialDesc}</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Past Business Reports */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <History className="w-4 h-4 text-[#006B7A]" />
            <span>{t.pastReports} ({history.length})</span>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
            >
              {t.clearAll}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-600">{t.noReports}</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t.noReportsDesc}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('assess', currentUser, true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#006B7A] text-white text-xs font-bold cursor-pointer hover:bg-[#005561]"
            >
              {t.btnCreateFirst}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div
                key={item.assessmentId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-[#79E4F3] transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      #{item.assessmentId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {item.businessCategory || 'Micro Enterprise'} • {item.villageName || 'Village'}, {item.districtName || 'District'}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                    <span>{t.totalCost}: ₹{Number(item.totalProjectCost || 1000000).toLocaleString('en-IN')}</span>
                    <span>•</span>
                    <span>{t.date}: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recent'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.approvalLikelihood}: {item.compositeReadinessScore || 78}%
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (onLoadReport) onLoadReport(item);
                      else onNavigate('report');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#006B7A] hover:underline cursor-pointer"
                  >
                    <span>{t.viewReport}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteHistoryItem(item.assessmentId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title={t.deleteReport}
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
            <span>{t.languageRegion}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {t.defaultLang}
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
            {t.langNotice}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-[#006B7A]" />
            <span>{t.sessionStorage}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900">{t.clearDrafts}</div>
              <div className="text-[11px] text-slate-500">{t.clearDraftsDesc}</div>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              {t.btnClearDrafts}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-rose-700">{t.signOut}</div>
              <div className="text-[11px] text-slate-500">{t.signOutDesc}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  localStorage.removeItem('vyapaarsathi_token');
                  localStorage.removeItem('vyapaarsathi_user');
                  sessionStorage.clear();
                  window.location.href = '/';
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.btnLogOut}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
