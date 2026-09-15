import React, { useState } from 'react';
import { 
  Building2, CheckCircle, ExternalLink, ArrowRight, 
  FileText, Landmark, ShieldCheck, Sparkles, AlertCircle, Heart
} from 'lucide-react';

const SCHEME_TRANSLATIONS = {
  ta: {
    headerTitle: "அரசு கடன் திட்டங்கள் & தேசிய நிதி நிறுவனங்கள்",
    headerSubtitle: "மத்திய சமூக நீதி மற்றும் அதிகாரமளித்தல் அமைச்சகத்தின் (MoSJE) கீழ் உள்ள தகுதியான திட்டங்கள்",
    exploreBtn: "கூடுதல் திட்டங்களை ஆராய்க",
    primaryTitle: "முதன்மையாக பரிந்துரைக்கப்பட்ட கடன் திட்டம்",
    interestRate: "வட்டி விகிதம்",
    subsidizedRate: "அரசு மானிய சலுகை வட்டி",
    loanShare: "அரசு கடன் பங்கு",
    ofProjectCost: "திட்ட மதிப்பீட்டில் 90%",
    promoterMargin: "விண்ணப்பதாரர் பங்களிப்பு",
    marginMoney: "10% சொந்த முதலீடு",
    repaymentTenure: "திருப்பிச் செலுத்தும் காலம்",
    gracePeriod: "தொடக்க சலுகை காலம்",
    moratoriumMonths: "மாதங்கள் அசல் விலக்கு",
    apexTitle: "தேசிய நிதி நிறுவனங்களின் நேரடி தொடர்பு",
    eligibleBadge: "நேரடி தகுதி",
    notEligibleBadge: "பிற சமூகப் பிரிவு",
    maxLoan: "அதிகபட்ச கடன்:",
    concessionalRate: "சலுகை வட்டி:",
    womenBenefitTitle: "மகளிர் சிறப்பு சலுகை (மகிளா சம்ரித்தி யோஜனா):",
    womenBenefitDesc: "பெண் தொழில்முனைவோருக்கு கூடுதல் 1% வட்டி தள்ளுபடி மற்றும் முன்னுரிமை ஒதுக்கீடு பொருந்தும்.",
    termLoanDesc: "₹1.40 லட்சம் முதல் ₹50.00 லட்சம் வரையிலான வணிகங்களுக்கு 8% வட்டி, 7 ஆண்டுகள் அவகாசம் மற்றும் 6 மாத சலுகை காலத்துடன் வழங்கப்படுகிறது.",
    microFinanceDesc: "₹1.40 லட்சம் வரையிலான குறுந்தொழில்களுக்கு பிணையில்லா கடன், 6.5% குறைந்த வட்டி மற்றும் 3 ஆண்டு தவணையில் வழங்கப்படுகிறது."
  },
  hi: {
    headerTitle: "सरकारी ऋण योजनाएं एवं राष्ट्रीय विकास निगम",
    headerSubtitle: "सामाजिक न्याय और अधिकारिता मंत्रालय (MoSJE) के अंतर्गत रियायती क्रेडिट योजनाएं",
    exploreBtn: "अन्य योजनाएं खोजें",
    primaryTitle: "प्राथमिक रूप से अनुशंसित ऋण योजना",
    interestRate: "ब्याज दर",
    subsidizedRate: "सरकारी रियायती ब्याज दर",
    loanShare: "सरकारी ऋण का हिस्सा",
    ofProjectCost: "कुल लागत का 90%",
    promoterMargin: "लाभार्थी अंशदान",
    marginMoney: "10% स्वयं का मार्जिन",
    repaymentTenure: "ऋण चुकौती अवधि",
    gracePeriod: "प्रारंभिक छूट अवधि",
    moratoriumMonths: "महीने मोराटोरियम",
    apexTitle: "राष्ट्रीय शीर्ष निगमों के साथ संबद्धता",
    eligibleBadge: "पूर्णतः पात्र",
    notEligibleBadge: "अन्य सामाजिक वर्ग",
    maxLoan: "अधिकतम ऋण सीमा:",
    concessionalRate: "रियायती ब्याज:",
    womenBenefitTitle: "महिला विशेष लाभ (महिला समृद्धि योजना):",
    womenBenefitDesc: "महिला उद्यमियों के लिए 1% अतिरिक्त ब्याज छूट और प्राथमिकता ऋण आवंटन लागू है।",
    termLoanDesc: "₹1.40 लाख से ₹50.00 लाख तक के मध्यम ग्रामीण उद्यमों के लिए 8% वार्षिक ब्याज दर, 7 वर्ष की अवधि और 6 महीने की प्रारंभिक छूट।",
    microFinanceDesc: "₹1.40 लाख तक के सूक्ष्म उद्यमों के लिए बिना किसी गारंटी के 6.5% रियायती ब्याज दर और 36 महीने की आसान चुकौती।"
  },
  te: {
    headerTitle: "ప్రభుత్వ రుణ పథకాలు & జాతీయ అభివృద్ధి సంస్థలు",
    headerSubtitle: "సామాజిక న్యాయ మరియు సాధికారత మంత్రిత్వ శాఖ (MoSJE) కింద రాయితీ పథకాలు",
    exploreBtn: "మరిన్ని పథకాలను చూడండి",
    primaryTitle: "ప్రాథమిక సిఫార్సు చేయబడిన రుణ పథకం",
    interestRate: "వడ్డీ రేటు",
    subsidizedRate: "ప్రభుత్వ రాయితీ వడ్డీ",
    loanShare: "ప్రభుత్వ రుణ వాటా",
    ofProjectCost: "మొత్తం ఖర్చులో 90%",
    promoterMargin: "లబ్ధిదారుని వాటా",
    marginMoney: "10% స్వంత పెట్టుబడి",
    repaymentTenure: "రుణ కాలపరిమితి",
    gracePeriod: "ప్రారంభ గడువు కాలం",
    moratoriumMonths: "నెలలు అసలు మినహాయింపు",
    apexTitle: "జాతీయ సంస్థల ప్రత్యక్ష వర్తింపు",
    eligibleBadge: "అర్హత ఉంది",
    notEligibleBadge: "ఇతర సామాజిక వర్గం",
    maxLoan: "గరిష్ట రుణం:",
    concessionalRate: "రాయితీ వడ్డీ:",
    womenBenefitTitle: "మహిళా ప్రత్యేక ప్రయోజనం (మహిళా సమృద్ధి యోజన):",
    womenBenefitDesc: "మహిళా పారిశ్రామికవేత్తలకు అదనంగా 1% వడ్డీ రాయితీ మరియు ప్రాధాన్యత లభిస్తుంది.",
    termLoanDesc: "₹1.40 లక్షల నుండి ₹50.00 లక్షల వరకు ప్రాజెక్టులకు 8% వడ్డీతో, 7 సంవత్సరాల వ్యవధి మరియు 6 నెలల గడువుతో లభిస్తుంది.",
    microFinanceDesc: "₹1.40 లక్షల వరకు ఉన్న చిన్న వ్యాపారాలకు షూరిటీ లేకుండా 6.5% వడ్డీతో, 36 నెలల సులభ వాయిదాలలో లభిస్తుంది."
  },
  en: {
    headerTitle: "Government Credit Schemes & Corporations",
    headerSubtitle: "Eligible schemes under the Ministry of Social Justice and Empowerment (MoSJE)",
    exploreBtn: "Explore More Schemes",
    primaryTitle: "Primary Recommended Scheme",
    interestRate: "Interest Rate",
    subsidizedRate: "Subsidized Concessional Rate",
    loanShare: "Government Loan Share",
    ofProjectCost: "90% of Project Cost",
    promoterMargin: "Beneficiary Contribution",
    marginMoney: "10% Margin Money",
    repaymentTenure: "Repayment Tenure",
    gracePeriod: "Setup Grace Period",
    moratoriumMonths: "Months Moratorium",
    apexTitle: "National Apex Corporations Alignment",
    eligibleBadge: "Eligible",
    notEligibleBadge: "Other Category",
    maxLoan: "Maximum Outlay:",
    concessionalRate: "Concessional Rate:",
    womenBenefitTitle: "Women Beneficiary Advantage (Mahila Samriddhi Yojana):",
    womenBenefitDesc: "Eligible for an additional 1.0% interest rebate and priority SCA processing quota.",
    termLoanDesc: "Structured for small enterprise outlays between ₹1.40 Lakh and ₹50.00 Lakh. Offers 8.0% interest rate p.a., 84-month tenure (7 years), and 6-month grace period for stable enterprise ramp-up.",
    microFinanceDesc: "Tailored for micro-scale rural enterprises requiring up to ₹1.40 Lakh project outlay. Collateral-free lending with 6.5% interest rate, 36-month tenure, and 3-month grace period."
  }
};

export function TabSchemes({ module2Result, onOpenSchemeSearch, selectedLang = 'en', applicantDetails }) {
  const t = SCHEME_TRANSLATIONS[selectedLang] || SCHEME_TRANSLATIONS.en;

  const schemeName = module2Result?.financial_summary?.scheme_name || module2Result?.schemeName || "Term Loan Scheme";
  const isMicro = schemeName.includes("Micro");

  const socialCategory = (
    applicantDetails?.socialCategory ||
    module2Result?.socialCategory ||
    'OBC'
  ).toUpperCase();

  const gender = (
    applicantDetails?.gender ||
    module2Result?.gender ||
    'Female'
  ).toLowerCase();

  const isFemale = gender === 'female';
  const isPwD = Boolean(applicantDetails?.disabilityStatus || module2Result?.disabilityStatus);

  // Dynamically calculate eligibility based on applicant demographics
  const isNbcfdcEligible = socialCategory.includes('OBC') || socialCategory.includes('BACKWARD') || socialCategory === 'OBC';
  const isNsfdcEligible = socialCategory.includes('SC') || socialCategory.includes('SCHEDULED CASTE');
  const isNskfdcEligible = socialCategory.includes('SAFAI') || socialCategory.includes('SANITATION') || socialCategory.includes('KARAMCHARI');
  const isNdfdcEligible = isPwD;

  const targetApexCode = isNbcfdcEligible ? 'NBCFDC' : isNsfdcEligible ? 'NSFDC' : isNskfdcEligible ? 'NSKFDC' : isNdfdcEligible ? 'NDFDC' : 'MoSJE';

  const bizCat = (applicantDetails?.businessCategory || module2Result?.businessCategory || '').toLowerCase();
  const isArtisan = bizCat.includes('wood') || bizCat.includes('craft') || bizCat.includes('tailor') || bizCat.includes('barber') || bizCat.includes('carpenter') || bizCat.includes('mason');
  const isDairy = bizCat.includes('dairy') || bizCat.includes('milk') || bizCat.includes('cattle');

  // Interactive Required Documents Verification State
  const [docChecks, setDocChecks] = useState(() => {
    try {
      const saved = localStorage.getItem('vyapaarsathi_docs_verified');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      aadhaar: true,
      community: true,
      dpr: true,
      quotations: true
    };
  });

  const toggleDoc = (key) => {
    setDocChecks(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem('vyapaarsathi_docs_verified', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const markAllDocs = (val = true) => {
    const next = { aadhaar: val, community: val, dpr: val, quotations: val };
    setDocChecks(next);
    try { localStorage.setItem('vyapaarsathi_docs_verified', JSON.stringify(next)); } catch {}
  };

  const readyDocsCount = Object.values(docChecks).filter(Boolean).length;

  const corporations = [
    {
      code: "NBCFDC",
      name: selectedLang === 'ta' ? "தேசிய பிற்படுத்தப்பட்டோர் நிதி மற்றும் மேம்பாட்டுக் கழகம்" :
            selectedLang === 'hi' ? "राष्ट्रीय पिछड़ा वर्ग वित्त एवं विकास निगम" :
            selectedLang === 'te' ? "జాతీయ వెనుకబడిన తరగతుల ఆర్థిక & అభివృద్ధి సంస్థ" :
            "National Backward Classes Finance & Development Corporation",
      eligible: isNbcfdcEligible,
      interestRate: isMicro ? "6.5% p.a." : "8.0% p.a.",
      maxAmount: "₹50.00 Lakh",
      description: selectedLang === 'ta' ? "ஆண்டு வருமானம் ₹3.00 லட்சத்திற்குள் உள்ள இதர பிற்படுத்தப்பட்ட (OBC) தொழில்முனைவோருக்கான சலுகைக் கடன்." :
                   selectedLang === 'hi' ? "₹3.00 लाख से कम वार्षिक पारिवारिक आय वाले अन्य पिछड़ा वर्ग (OBC) उद्यमियों हेतु रियायती ऋण।" :
                   selectedLang === 'te' ? "వార్షిక ఆదాయం ₹3.00 లక్షల లోపు ఉన్న బీసీ (OBC) పారిశ్రామికవేత్తలకు రాయితీ రుణాలు." :
                   "Concessional credit for Other Backward Classes (OBC) entrepreneurs with annual family income under ₹3.00 Lakh."
    },
    {
      code: "NSFDC",
      name: selectedLang === 'ta' ? "தேசிய ஆதிதிராவிடர் நிதி மற்றும் மேம்பாட்டுக் கழகம்" :
            selectedLang === 'hi' ? "राष्ट्रीय अनुसूचित जाति वित्त एवं विकास निगम" :
            selectedLang === 'te' ? "జాతీయ షెడ్యూల్డ్ కులాల ఆర్థిక & అభివృద్ధి సంస్థ" :
            "National Scheduled Castes Finance & Development Corporation",
      eligible: isNsfdcEligible,
      interestRate: isMicro ? "6.0% p.a." : "7.5% p.a.",
      maxAmount: "₹50.00 Lakh",
      description: selectedLang === 'ta' ? "பட்டியலின (SC) பயனாளிகளுக்கான மூலதன மானியம் மற்றும் பிரத்யேக கடன் வசதி (மகளிருக்கு முன்னுரிமை)." :
                   selectedLang === 'hi' ? "अनुसूचित जाति (SC) लाभार्थियों के लिए समर्पित ऋण सुविधा एवं पूंजीगत अनुदान, महिलाओं को विशेष प्राथमिकता।" :
                   selectedLang === 'te' ? "షెడ్యూల్డ్ కులాల (SC) లబ్ధిదారులకు ప్రత్యేక మూలధన సబ్సిడీ మరియు రుణ సౌకర్యం (మహిళలకు ప్రాధాన్యత)." :
                   "Dedicated credit facilitation and capital subsidy for Scheduled Caste beneficiaries with priority for women."
    },
    {
      code: "NSKFDC",
      name: selectedLang === 'ta' ? "தேசிய தூய்மைப் பணியாளர் நிதி மற்றும் மேம்பாட்டுக் கழகம்" :
            selectedLang === 'hi' ? "राष्ट्रीय सफाई कर्मचारी वित्त एवं विकास निगम" :
            selectedLang === 'te' ? "జాతీయ సఫాయీ కర్మచారుల ఆర్థిక & అభివృద్ధి సంస్థ" :
            "National Safai Karamcharis Finance & Development Corporation",
      eligible: isNskfdcEligible,
      interestRate: "6.0% p.a.",
      maxAmount: "₹15.00 Lakh",
      description: selectedLang === 'ta' ? "தூய்மைப் பணியாளர்கள் மற்றும் அவர்களது குடும்பத்தினரின் வாழ்வாதார மறுவாழ்வுக்கான சிறப்பு கடன்." :
                   selectedLang === 'hi' ? "सफाई कर्मचारियों, स्वच्छता कर्मियों एवं उनके आश्रितों के आर्थिक पुनर्वास हेतु समर्पित ऋण।" :
                   selectedLang === 'te' ? "పారిశుద్ధ్య కార్మికులు మరియు వారి కుటుంబాల ఆర్థిక పునరావాసం కోసం ప్రత్యేక రుణాలు." :
                   "Specialized rehabilitation credit for sanitation workers, manual scavengers, and their dependents."
    },
    {
      code: "NDFDC",
      name: selectedLang === 'ta' ? "தேசிய மாற்றுத்திறனாளிகள் நிதி மற்றும் மேம்பாட்டுக் கழகம்" :
            selectedLang === 'hi' ? "राष्ट्रीय दिव्यांगजन वित्त एवं विकास निगम" :
            selectedLang === 'te' ? "జాతీయ దివ్యాంగుల ఆర్థిక & అభివృద్ధి సంస్థ" :
            "National Divyangjan Finance & Development Corporation",
      eligible: isNdfdcEligible,
      interestRate: "5.0% - 6.0% p.a.",
      maxAmount: "₹25.00 Lakh",
      description: selectedLang === 'ta' ? "மாற்றுத்திறனாளி தொழில்முனைவோரின் சுயதொழில் முயற்சிகளுக்கான அதீத சலுகை கடன் திட்டம்." :
                   selectedLang === 'hi' ? "दिव्यांग व्यक्तियों (PwD) द्वारा संचालित स्वरोजगार उद्यमों के लिए विशेष कम ब्याज ऋण।" :
                   selectedLang === 'te' ? "దివ్యాంగులు (PwD) ప్రారంభించే స్వయం ఉపాధి వ్యాపారాలకు ప్రత్యేక రాయితీ రుణాలు." :
                   "Concessional loans for self-employment ventures initiated by Persons with Disabilities (PwD)."
    }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-700" />
            <span>{t.headerTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.headerSubtitle}
          </p>
        </div>

        <button
          onClick={onOpenSchemeSearch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133E68] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t.exploreBtn}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Primary Recommended Scheme Card */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm border-l-4 border-l-blue-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {t.primaryTitle}
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-3">
              {schemeName}
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              {isMicro ? t.microFinanceDesc : t.termLoanDesc}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">{t.interestRate}</div>
            <div className="text-3xl font-black text-emerald-700 mt-1">
              {isMicro ? '6.5%' : '8.0%'} <span className="text-xs font-normal text-slate-500">p.a.</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{t.subsidizedRate}</div>
          </div>
        </div>

        {/* Female Beneficiary Highlight */}
        {isFemale && (
          <div className="mt-6 p-4 rounded-xl bg-pink-50 border border-pink-200 text-pink-900 flex items-center gap-3">
            <Heart className="w-5 h-5 text-pink-600 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold">{t.womenBenefitTitle} </strong>
              <span>{t.womenBenefitDesc}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500">{t.loanShare}</div>
            <div className="text-lg font-black text-slate-900 mt-1">{t.ofProjectCost}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">{t.promoterMargin}</div>
            <div className="text-lg font-black text-blue-700 mt-1">{t.marginMoney}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">{t.repaymentTenure}</div>
            <div className="text-lg font-black text-slate-900 mt-1">{isMicro ? '36' : '84'} {selectedLang === 'ta' ? 'மாதங்கள்' : selectedLang === 'hi' ? 'महीने' : selectedLang === 'te' ? 'నెలలు' : 'Months'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">{t.gracePeriod}</div>
            <div className="text-lg font-black text-emerald-700 mt-1">{isMicro ? '3' : '6'} {t.moratoriumMonths}</div>
          </div>
        </div>

        {/* Why this scheme was recommended */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            {selectedLang === 'ta' ? "இந்த திட்டம் உங்களுக்கு ஏன் பரிந்துரைக்கப்பட்டது?" :
             selectedLang === 'hi' ? "यह योजना आपके लिए क्यों अनुशंसित की गई?" :
             selectedLang === 'te' ? "ఈ పథకం మీకు ఎందుకు సిఫార్సు చేయబడింది?" :
             "Why Was This Primary Scheme Recommended for You?"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{selectedLang === 'ta' ? "சமூக பிரிவு தகுதி:" : "Demographic Match:"}</strong> {selectedLang === 'ta' ? `உங்கள் ${socialCategory} சமூக தகுதி மற்றும் கிராமப்புற அமைவிடத்தின் அடிப்படையில் MoSJE நேரடி சலுகை வட்டி பொருந்துகிறது.` : `Direct MoSJE statutory mandate for ${socialCategory} applicants with priority SCA allocation.`}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{selectedLang === 'ta' ? "சலுகை வட்டி விகிதம்:" : "Concessional Rate:"}</strong> {selectedLang === 'ta' ? "வணிக வங்கிகளின் 12%-14% வட்டிக்கு பதிலாக வெறும் 8.0% ஆண்டு வட்டி (குறைந்துவரும் இருப்பு)." : "8.0% p.a. reducing balance rate vs 12%-14% standard commercial bank micro-enterprise loans."}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{selectedLang === 'ta' ? "அதிகபட்ச கடன் பங்கு:" : "90% Loan Share:"}</strong> {selectedLang === 'ta' ? "மொத்த திட்ட செலவில் 90% வரை கடன் வழங்கப்படுவதால் விண்ணப்பதாரர் வெறும் 10% முதலீடு செய்தால் போதுமானது." : "Only 10% promoter margin required, with 90% financed via State Channelizing Agency."}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{selectedLang === 'ta' ? "தொடக்க கால அவகாசம்:" : "6-Month Moratorium:"}</strong> {selectedLang === 'ta' ? "வணிகத்தை நிலைநிறுத்த 6 மாதங்கள் அசல் விலக்கு வழங்கப்படுகிறது." : "6 months principal moratorium to establish retail cash flow before amortization begins."}
              </span>
            </div>
          </div>
        </div>

        {/* Exact Mandatory Required Documents Interactive Checklist for Primary Scheme */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-blue-50/50 border-2 border-emerald-300 text-xs shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-emerald-200/80">
            <div>
              <div className="flex items-center gap-2 font-black text-emerald-950 text-sm">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {selectedLang === 'ta' 
                    ? "விண்ணப்பிக்க தேவையான அசல் ஆவணங்கள் (Mandatory Document Checklist):" 
                    : "Exact Required Documents to Apply (Mandatory Checklist):"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                {selectedLang === 'ta' 
                  ? "உங்களிடம் இந்த ஆவணங்கள் தயாராக உள்ளதா? கீழே உள்ள ஆவணங்களை கிளிக் செய்து உறுதிப்படுத்தவும் (100% அரசு கடன் ஒப்புதலுக்கு அவசியம்)."
                  : "Do you have these mandatory documents ready? Click each item to verify readiness for swift bank sanction."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAllDocs(readyDocsCount !== 4)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{readyDocsCount === 4 ? "Uncheck All" : "✓ Mark All Ready (அனைத்தும் தயார்)"}</span>
              </button>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                readyDocsCount === 4 
                  ? 'bg-emerald-200 text-emerald-900 border-emerald-300' 
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {readyDocsCount}/4 Ready ({readyDocsCount === 4 ? '100% Required for Sanction' : 'Incomplete'})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Aadhaar Card */}
            <div 
              onClick={() => toggleDoc('aadhaar')}
              className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 select-none ${
                docChecks.aadhaar 
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-xs' 
                  : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 opacity-90'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                docChecks.aadhaar 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-200 text-slate-500 border border-slate-300'
              }`}>
                {docChecks.aadhaar ? '✓' : '○'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 block text-xs font-bold">1. Aadhaar Card</strong>
                  {docChecks.aadhaar && <span className="text-[10px] font-extrabold text-emerald-700">READY</span>}
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {selectedLang === 'ta' ? "ஆதார் அட்டை / அடையாள சான்று" : "Identity & Age Verification (KYC)"}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                  {docChecks.aadhaar ? "✓ Available with applicant" : "Click if you possess this"}
                </span>
              </div>
            </div>

            {/* 2. Community Certificate */}
            <div 
              onClick={() => toggleDoc('community')}
              className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 select-none ${
                docChecks.community 
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-xs' 
                  : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 opacity-90'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                docChecks.community 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-200 text-slate-500 border border-slate-300'
              }`}>
                {docChecks.community ? '✓' : '○'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 block text-xs font-bold">2. Community Certificate</strong>
                  {docChecks.community && <span className="text-[10px] font-extrabold text-emerald-700">READY</span>}
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {selectedLang === 'ta' ? `${socialCategory} சாதி சான்றிதழ்` : `${socialCategory} / Domicile Certificate`}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                  {docChecks.community ? "✓ Available with applicant" : "Click if you possess this"}
                </span>
              </div>
            </div>

            {/* 3. Detailed Project Report (DPR) */}
            <div 
              onClick={() => toggleDoc('dpr')}
              className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 select-none ${
                docChecks.dpr 
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-xs' 
                  : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 opacity-90'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                docChecks.dpr 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-200 text-slate-500 border border-slate-300'
              }`}>
                {docChecks.dpr ? '✓' : '○'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 block text-xs font-bold">3. Detailed Project Report</strong>
                  {docChecks.dpr && <span className="text-[10px] font-extrabold text-emerald-700">AUTO-READY</span>}
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {selectedLang === 'ta' ? "விரிவான திட்ட அறிக்கை (DPR)" : "Generated directly by VyapaarSathi"}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                  ✓ Instant download available
                </span>
              </div>
            </div>

            {/* 4. Machinery Quotations */}
            <div 
              onClick={() => toggleDoc('quotations')}
              className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 select-none ${
                docChecks.quotations 
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-xs' 
                  : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 opacity-90'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                docChecks.quotations 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-200 text-slate-500 border border-slate-300'
              }`}>
                {docChecks.quotations ? '✓' : '○'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 block text-xs font-bold">4. Machinery Quotations</strong>
                  {docChecks.quotations && <span className="text-[10px] font-extrabold text-emerald-700">READY</span>}
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {selectedLang === 'ta' ? "இயந்திர விலைப்பட்டியல் / மதிப்பீடு" : "Equipment & Stock Supplier Invoices"}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                  {docChecks.quotations ? "✓ Obtained from supplier" : "Click if you possess this"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Multi-Scheme Comparative Decision Matrix (Top 4 Schemes Compared) */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <span>
                {selectedLang === 'ta' ? "அரசு கடன் திட்டங்களின் ஒப்பீட்டு அட்டவணை (4 முதன்மை திட்டங்கள்)" :
                 selectedLang === 'hi' ? "सरकारी ऋण योजनाओं की तुलना (4 प्रमुख योजनाएं)" :
                 selectedLang === 'te' ? "ప్రభుత్వ పథకాల పోలిక పట్టిక (4 ముఖ్య పథకాలు)" :
                 "Government Schemes Comparative Decision Matrix (Top 4 Schemes)"}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {selectedLang === 'ta' 
                ? "உங்கள் சமூகப் பிரிவு, வணிகத் தேவை, கடன் அளவு மற்றும் திருப்பிச் செலுத்தும் திறனுக்கேற்ப பொருத்தமான திட்டத்தை ஒப்பிட்டு தேர்வு செய்யுங்கள்."
                : "Compare loan ceilings, interest subvention, subsidies, and tenure across 4 targeted central and state government credit schemes."}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {selectedLang === 'ta' ? "4 திட்டங்களின் ஒப்பீடு" : "4-Way Side-by-Side Comparison"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5 border-r border-slate-200 min-w-[160px]">
                  {selectedLang === 'ta' ? "அம்சம் / அளவுகோல்" : selectedLang === 'hi' ? "विशेषता / मापदंड" : selectedLang === 'te' ? "లక్షణం / మెట్రిక్" : "Feature / Metric"}
                </th>
                <th className="p-3.5 border-r border-slate-200 bg-blue-50/50 text-blue-900 min-w-[180px]">
                  <div className="font-extrabold text-sm">
                    {isNbcfdcEligible ? "NBCFDC Term Loan" : isNsfdcEligible ? "NSFDC Term Loan" : isNskfdcEligible ? "NSKFDC Term Loan" : isNdfdcEligible ? "NDFDC Term Loan" : "Term Loan Scheme"}
                  </div>
                  <div className="text-[11px] font-medium text-blue-700">
                    {isNbcfdcEligible ? (selectedLang === 'ta' ? "பிற்படுத்தப்பட்டோர் (OBC பரிந்துரை)" : "OBC Entitlement (Recommended)") :
                     isNsfdcEligible ? (selectedLang === 'ta' ? "ஆதிதிராவிடர் (SC பரிந்துரை)" : "SC Entitlement (Recommended)") :
                     isNskfdcEligible ? (selectedLang === 'ta' ? "தூய்மைப் பணியாளர் பரிந்துரை" : "Sanitation Entitlement") :
                     isNdfdcEligible ? (selectedLang === 'ta' ? "மாற்றுத்திறனாளி பரிந்துரை" : "PwD Entitlement") :
                     "MoSJE Concessional Credit"}
                  </div>
                </th>
                <th className="p-3.5 border-r border-slate-200 min-w-[170px]">
                  <div className="font-extrabold text-sm">
                    {selectedLang === 'ta' ? "மைக்ரோ நிதி திட்டம்" : "Micro Finance Scheme"}
                  </div>
                  <div className="text-[11px] font-normal text-slate-500">
                    {isNbcfdcEligible ? "NBCFDC / TABCEDCO Micro" : isNsfdcEligible ? "NSFDC / TAHDCO Micro" : "State SCA Micro Credit"}
                  </div>
                </th>
                <th className="p-3.5 border-r border-slate-200 min-w-[170px]">
                  <div className="font-extrabold text-sm">
                    {selectedLang === 'ta' ? "PMEGP மானிய திட்டம்" : "PMEGP Subsidy Scheme"}
                  </div>
                  <div className="text-[11px] font-normal text-slate-500">
                    {selectedLang === 'ta' ? "KVIC / DIC 35% மானியம்" : "KVIC / DIC Capital Subsidy"}
                  </div>
                </th>
                <th className="p-3.5 bg-emerald-50/40 text-emerald-950 min-w-[190px]">
                  <div className="font-extrabold text-sm">
                    {isArtisan ? (selectedLang === 'ta' ? "PM விஸ்வகர்மா திட்டம்" : "PM Vishwakarma Scheme") :
                     isDairy ? (selectedLang === 'ta' ? "AHIDF பால்பண்ணை திட்டம்" : "AHIDF Dairy Development") :
                     (selectedLang === 'ta' ? "PM முத்ரா யோஜனா" : "PM MUDRA (Kishore / Tarun)")}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-700">
                    {isArtisan ? (selectedLang === 'ta' ? "கைவினைஞர் நேரடி கடன்" : "Artisan & Tradesman Credit") :
                     isDairy ? (selectedLang === 'ta' ? "கால்நடை கூட்டுறவு கடன்" : "Livestock & Dairy Co-op") :
                     (selectedLang === 'ta' ? "வணிக பிணையில்லா மூலதனம்" : "Commercial Working Capital")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                  {selectedLang === 'ta' ? "அதிகபட்ச திட்ட மதிப்பீடு" : selectedLang === 'hi' ? "अधिकतम परियोजना लागत" : "Maximum Project Outlay"}
                </td>
                <td className="p-3.5 border-r border-slate-200 bg-blue-50/30 font-bold text-blue-900">Up to ₹50.00 Lakh</td>
                <td className="p-3.5 border-r border-slate-200 font-bold text-slate-900">Up to ₹1.40 Lakh</td>
                <td className="p-3.5 border-r border-slate-200 font-bold text-slate-900">Up to ₹20.00 Lakh (Trade) / ₹50.00 Lakh (Mfg)</td>
                <td className="p-3.5 bg-emerald-50/20 font-bold text-emerald-900">
                  {isArtisan ? "Up to ₹3.00 Lakh" : isDairy ? "Up to ₹50.00 Lakh" : "Up to ₹10.00 Lakh"}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                  {selectedLang === 'ta' ? "சலுகை வட்டி விகிதம்" : selectedLang === 'hi' ? "रियायती ब्याज दर" : "Concessional Interest Rate"}
                </td>
                <td className="p-3.5 border-r border-slate-200 bg-blue-50/30 font-bold text-emerald-700">8.0% p.a. (7.0% for Women)</td>
                <td className="p-3.5 border-r border-slate-200 font-bold text-emerald-700">6.0% - 6.5% p.a.</td>
                <td className="p-3.5 border-r border-slate-200 text-slate-700">Bank Lending Rate (9% - 11%)</td>
                <td className="p-3.5 bg-emerald-50/20 font-bold text-emerald-700">
                  {isArtisan ? "5.0% p.a. (Subsidized)" : isDairy ? "6.5% - 7.5% p.a." : "8.5% - 9.5% p.a."}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                  {selectedLang === 'ta' ? "அரசு கடன் பங்கு" : selectedLang === 'hi' ? "सरकारी ऋण का हिस्सा" : "Government Credit Share"}
                </td>
                <td className="p-3.5 border-r border-slate-200 bg-blue-50/30 font-bold text-blue-900">90% of Project Cost</td>
                <td className="p-3.5 border-r border-slate-200 font-bold text-slate-900">100% of Micro Outlay</td>
                <td className="p-3.5 border-r border-slate-200 text-slate-700">60% - 75% Bank Loan</td>
                <td className="p-3.5 bg-emerald-50/20 text-emerald-900 font-bold">
                  {isArtisan ? "100% Collateral-Free" : isDairy ? "90% Loan + 3% Rebate" : "100% Bank Finance"}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                  {selectedLang === 'ta' ? "விண்ணப்பதாரர் சொந்த முதலீடு" : selectedLang === 'hi' ? "लाभार्थी मार्जिन राशि" : "Beneficiary Margin Required"}
                </td>
                <td className="p-3.5 border-r border-slate-200 bg-blue-50/30 font-bold text-blue-900">10% Margin Money</td>
                <td className="p-3.5 border-r border-slate-200 font-bold text-slate-900">0% (Nil Collateral)</td>
                <td className="p-3.5 border-r border-slate-200 text-slate-700">5% (Special / Rural) to 10% (General)</td>
                <td className="p-3.5 bg-emerald-50/20 text-slate-800 font-medium">
                  {isArtisan ? "0% (Nil Margin)" : isDairy ? "10% Margin Money" : "10% - 15%"}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                  {selectedLang === 'ta' ? "அரசு மூலதன மானியம்" : selectedLang === 'hi' ? "सरकारी पूंजीगत अनुदान" : "Government Capital Subsidy"}
                </td>
                <td className="p-3.5 border-r border-slate-200 bg-blue-50/30 text-slate-600">Interest Subvention & Concession</td>
                <td className="p-3.5 border-r border-slate-200 text-slate-600">Low interest micro credit</td>
                <td className="p-3.5 border-r border-slate-200 font-bold text-emerald-700">35% Rural Special Category Grant</td>
                <td className="p-3.5 bg-emerald-50/20 font-bold text-emerald-700">
                  {isArtisan ? (selectedLang === 'ta' ? "₹15,000 உபகரண மானியம் + பயிற்சி உதவித்தொகை" : "₹15,000 Free Toolkit Grant + Stipend") :
                   isDairy ? (selectedLang === 'ta' ? "3% வட்டி மானியம்" : "3% Interest Subvention") :
                   (selectedLang === 'ta' ? "முழு கடன் உத்தரவாதம் (CGFMU)" : "100% CGFMU Credit Guarantee")}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                  {selectedLang === 'ta' ? "திருப்பிச் செலுத்தும் காலம் & அவகாசம்" : selectedLang === 'hi' ? "ऋण चुकौती अवधि एवं छूट" : "Repayment Tenure & Grace"}
                </td>
                <td className="p-3.5 border-r border-slate-200 bg-blue-50/30 text-slate-800">84 Months (7 Years) • 6-mo Grace</td>
                <td className="p-3.5 border-r border-slate-200 text-slate-800">36 Months (3 Years) • 3-mo Grace</td>
                <td className="p-3.5 border-r border-slate-200 text-slate-800">36 to 84 Months as per Bank norms</td>
                <td className="p-3.5 bg-emerald-50/20 text-slate-800">
                  {isArtisan ? "36 to 60 Months" : isDairy ? "84 Months • 6-mo Grace" : "36 to 60 Months (RuPay Card)"}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 bg-slate-50/30">
                <td className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                  {selectedLang === 'ta' ? "யாருக்கு மிகவும் பொருத்தமானது?" : selectedLang === 'hi' ? "किसके लिए सर्वोत्तम उपयुक्त?" : "Best Suited For"}
                </td>
                <td className="p-3.5 border-r border-slate-200 bg-blue-50/50 font-semibold text-blue-900">
                  {selectedLang === 'ta' ? "முழு வணிக விரிவாக்கம், இயந்திரங்கள் மற்றும் ₹50 லட்சம் வரையிலான கடை திட்டங்களுக்கு." : "Full physical enterprise setup, machinery & commercial shop outlays up to ₹50 Lakh."}
                </td>
                <td className="p-3.5 border-r border-slate-200 font-semibold text-slate-700">
                  {selectedLang === 'ta' ? "சிறிய மளிகை கவுண்ட்டர்கள், குறைந்த நிதி ஆபத்து, மாத தவணை ₹2,200க்குள்." : "Small provision counters, low financial risk, debt payments under ₹2,200/mo."}
                </td>
                <td className="p-3.5 border-r border-slate-200 font-semibold text-slate-700">
                  {selectedLang === 'ta' ? "திரும்ப செலுத்தத் தேவையில்லாத நேரடி அரசு மானியம் (₹3.5 லட்சம் வரை இலவச மூலதனம்)." : "Beneficiaries seeking non-repayable cash grants (up to ₹3.5 Lakh free capital)."}
                </td>
                <td className="p-3.5 bg-emerald-50/40 font-semibold text-emerald-950">
                  {isArtisan ? (selectedLang === 'ta' ? "கைவினைஞர்கள், தையல், தச்சு தொழில் மற்றும் நவீன கருவிகள் வாங்குவதற்கு." : "Artisans, carpenters, tailors, modern equipment and 5% credit.") :
                   isDairy ? (selectedLang === 'ta' ? "கறவை மாடுகள் வாங்குதல், பால் குளிரூட்டும் மையங்கள் அமைத்தல்." : "Dairy farmers, cattle acquisition, milk chilling infrastructure.") :
                   (selectedLang === 'ta' ? "மளிகை, சில்லறை வர்த்தகம் மற்றும் சொத்து அடமானமில்லா உடனடி சரக்கு இருப்பு நிதிக்கு." : "Grocery/retail stores seeking instant inventory liquidity without property mortgage.")}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 bg-emerald-50/20">
                <td className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{selectedLang === 'ta' ? "தேவையான ஆவணங்கள்" : "Required Documents"}</span>
                  </div>
                </td>
                <td className="p-3.5 border-r border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-semibold text-blue-900 block mb-1">Term Loan Pack:</span>
                  Aadhaar, Caste/Community Cert, Detailed Project Report (DPR), Machinery Quotations, Bank Passbook
                </td>
                <td className="p-3.5 border-r border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-semibold text-blue-900 block mb-1">Micro Credit Pack:</span>
                  Aadhaar & KYC, Income / Community Proof, Micro Business Estimate, Bank Passbook
                </td>
                <td className="p-3.5 border-r border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-semibold text-blue-900 block mb-1">PMEGP Subsidy Pack:</span>
                  Aadhaar Card, Detailed Project Report (DPR), Machinery Quotations, Caste Cert, EDP Certificate
                </td>
                <td className="p-3.5 bg-emerald-50/30 text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-semibold text-emerald-900 block mb-1">Enterprise Pack:</span>
                  Aadhaar & PAN, Business Proof / Udyam, Machinery Invoices, 6-Month Bank Statement
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Apex Corporations Grid */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-900">
            {t.apexTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {selectedLang === 'ta'
              ? "மத்திய அரசின் சமூக நீதி மற்றும் அதிகாரமளித்தல் அமைச்சகம் (MoSJE) நான்கு பிரத்யேக தேசிய நிதி கழகங்களை நடத்துகிறது. இக்கழகங்கள் மாநில பிற்படுத்தப்பட்டோர் மற்றும் ஆதிதிராவிடர் கழகங்கள் (TABCEDCO / TAHDCO) மற்றும் வங்கிகளுக்கு 100% மானிய மறுநிதியளிப்பை வழங்குகின்றன. உங்களின் சாதி மற்றும் சமூக பிரிவிற்கான கழகம் கீழே 'நேரடி தகுதி' என குறிக்கப்பட்டுள்ளது."
              : "The Ministry of Social Justice and Empowerment (MoSJE) operates four National Apex Corporations. These corporations provide 100% concessional refinance to State Channelizing Agencies (e.g. TABCEDCO, TAHDCO) and Public Sector Banks. The highlighted corporation represents your direct statutory entitlement where your loan is refinanced at subsidized single-digit interest rates without commercial markups."}
          </p>
        </div>

        {/* Statutory Alignment Validation Notice */}
        <div className="mb-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>
                {selectedLang === 'ta' ? "சட்டரீதியான தகுதி சரிபார்ப்பு (Statutory Entitlement)" : "Statutory Beneficiary Mapping (Ministry of Social Justice & Empowerment)"}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-200/80 text-blue-900 font-semibold text-[10px]">
                {socialCategory} {gender ? `• ${gender}` : ''}
              </span>
            </div>
            <p className="leading-relaxed">
              {selectedLang === 'ta'
                ? `உங்கள் சுயவிவரத்தில் பதிவு செய்யப்பட்ட சமூகப் பிரிவு (${socialCategory}) மற்றும் விண்ணப்பதாரர் தகவல்களின் அடிப்படையில், மத்திய அரசின் சமூக நீதி அமைச்சக விதிகளின்படி ${targetApexCode} கழகத்திற்கு நேரடி தகுதி சரிபார்க்கப்பட்டு டிக் செய்யப்பட்டுள்ளது. இக்கழகத்தின் கீழ் வணிக வங்கிகளின் கூடுதல் வட்டி இல்லாமல் குறைந்த ஒற்றை இலக்க சலுகை வட்டி கடன் பெற முடியும்.`
                : `Based on the demographic profile entered in your assessment (Social Category: ${socialCategory}, Gender: ${gender}), you have been mapped to ${targetApexCode} in compliance with statutory MoSJE mandates. Apex refinance guarantees single-digit concessional credit through state channelizing agencies without commercial banking markup.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {corporations.map((corp) => (
            <div 
              key={corp.code} 
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                corp.eligible 
                  ? 'bg-blue-50/40 border-blue-300 shadow-xs' 
                  : 'bg-slate-50/60 border-slate-200 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-black text-blue-900">{corp.code}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{corp.name}</h4>
                  </div>
                  {corp.eligible ? (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shrink-0">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>{t.eligibleBadge}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 border border-slate-300 shrink-0">
                      {t.notEligibleBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {corp.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>{t.maxLoan} <strong className="text-slate-900 font-bold">{corp.maxAmount}</strong></span>
                <span>{t.concessionalRate} <strong className="text-emerald-700 font-bold">{corp.interestRate}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Grounded Official Government Scheme Master Catalog (Accurate Government Schemes) */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                {selectedLang === 'ta' 
                  ? "அரசு நிதி உதவி & மானிய திட்டங்களின் அதிகாரப்பூர்வ பட்டியல் (Official Scheme Master)" 
                  : "Official State & Central Government Scheme Catalog (VyapaarSathi)"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {selectedLang === 'ta'
                ? "தமிழ்நாடு MSME துறை மற்றும் மத்திய அரசின் கீழ் நடைமுறையில் உள்ள அதிகாரப்பூர்வ கடன் மற்றும் மூலதன மானிய திட்டங்கள். நேரடி போர்டல் இணைப்புகள் சரிபார்க்கப்பட்டு வழங்கப்பட்டுள்ளன."
                : "Authentic, live concessional credit and capital subsidy programs from Tamil Nadu MSME Department and Government of India with verified direct portal links."}
            </p>
          </div>
          <button
            onClick={onOpenSchemeSearch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{selectedLang === 'ta' ? "தனிப்பயனாக்கப்பட்ட திட்ட தேடல்" : "Run Tailored Eligibility Discovery"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Primary State Scheme */}
          {isNsfdcEligible ? (
            <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 flex flex-col justify-between space-y-3 text-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-200 text-emerald-900">TN-004</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">35% Subsidy (Max ₹1.5 Cr)</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {selectedLang === 'ta' ? "AABCS – அண்ணல் அம்பேத்கர் தொழில் முன்னோடிகள் திட்டம்" : "AABCS – Annal Ambedkar Business Champions Scheme"}
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                      {selectedLang === 'ta' ? "பட்டியலின (SC/ST) தொழில்முனைவோருக்கான 100% பிரத்யேக திட்டம்" : "100% SC/ST owned enterprises in Tamil Nadu"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    {selectedLang === 'ta' ? "முதன்மை சலுகை" : "Top State Grant"}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  {selectedLang === 'ta' 
                    ? "35% நேரடி மூலதன மானியம் (அதிகபட்சம் ரூ. 1.50 கோடி) மற்றும் இயந்திர கடனுக்கு 6% அரசு வட்டி மானியம் (Interest Subvention). 10 ஆண்டுகள் வரை திருப்பிச் செலுத்த அவகாசம்."
                    : "35% capital subsidy up to ₹1.50 Crore + 6% interest subvention for machinery loans up to 10 years via District Industries Centre."}
                </p>

                {/* Exact Required Documents Checklist */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-300/60 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{selectedLang === 'ta' ? "தேவையான ஆவணங்கள் (Required Documents):" : "Required Documents:"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {["Aadhaar / KYC", "SC/ST Community Certificate", "Detailed Project Report (DPR)", "Machinery Quotations", "Bank Account Proof"].map((doc, dIdx) => (
                      <span key={dIdx} className="px-2 py-0.5 rounded bg-white/90 border border-emerald-300/80 text-emerald-900 font-medium flex items-center gap-1">
                        <span className="text-emerald-700 font-bold">✓</span> {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Channel: <strong className="text-slate-800">Online AABCS / DIC</strong></span>
                <a 
                  href="https://msmeonline.tn.gov.in/aabcs/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : isFemale ? (
            <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 flex flex-col justify-between space-y-3 text-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-pink-200 text-pink-900">TN-003</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">25% Subsidy • 95% Bank Loan</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {selectedLang === 'ta' ? "TWEES – தமிழ்நாடு மகளிர் தொழில்முனைவோர் மேம்பாட்டு திட்டம்" : "TWEES – Tamil Nadu Women Entrepreneurs Empowerment Scheme"}
                    </h4>
                    <p className="text-[11px] text-pink-800 font-semibold mt-0.5">
                      {selectedLang === 'ta' ? "தமிழ்நாடு பெண் தொழில்முனைவோருக்கான நேரடி சலுகை" : "Women entrepreneurs with Tamil Nadu domicile"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-300 shrink-0">
                    {selectedLang === 'ta' ? "மகளிர் திட்டம்" : "Women Flagship"}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  {selectedLang === 'ta' 
                    ? "திட்ட மதிப்பீட்டில் 95% வங்கி கடன், வெறும் 5% சொந்த முதலீடு, 25% மூலதன மானியம் (அதிகபட்சம் ரூ. 2.00 லட்சம்) மற்றும் சொத்து பிணையில்லா நிதி உதவி."
                    : "95% bank finance with only 5% promoter margin, 25% capital subsidy up to ₹2.00 Lakh, and zero collateral security."}
                </p>

                {/* Exact Required Documents Checklist */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-pink-100/60 border border-pink-300/60 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-pink-950 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-pink-700 shrink-0" />
                    <span>{selectedLang === 'ta' ? "தேவையான ஆவணங்கள் (Required Documents):" : "Required Documents:"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {["Aadhaar / KYC", "TN Residence Proof", "Business Project Report (DPR)", "Machinery / Equipment Quotations", "Bank Account Passbook"].map((doc, dIdx) => (
                      <span key={dIdx} className="px-2 py-0.5 rounded bg-white/90 border border-pink-300/80 text-pink-900 font-medium flex items-center gap-1">
                        <span className="text-pink-700 font-bold">✓</span> {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Channel: <strong className="text-slate-800">Online TWEES / DIC</strong></span>
                <a 
                  href="https://msmeonline.tn.gov.in/twees/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border-2 border-blue-300 bg-blue-50/30 flex flex-col justify-between space-y-3 text-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-blue-200 text-blue-900">TN-001</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">25% Subsidy (Max ₹75 Lakh)</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {selectedLang === 'ta' ? "NEEDS – புதிய தொழில்முனைவோர் மற்றும் நிறுவன மேம்பாட்டு திட்டம்" : "NEEDS – New Entrepreneur-cum-Enterprise Development Scheme"}
                    </h4>
                    <p className="text-[11px] text-blue-800 font-semibold mt-0.5">
                      {selectedLang === 'ta' ? "முதல் தலைமுறை பட்டதாரிகள் & தொழில்முனைவோர்" : "First-generation entrepreneurs (₹10 Lakh to ₹5 Crore)"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 shrink-0">
                    {selectedLang === 'ta' ? "தமிழ்நாடு முதன்மை" : "TN Flagship"}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  {selectedLang === 'ta' 
                    ? "25% அரசு மூலதன மானியம் (அதிகபட்சம் ரூ. 75 லட்சம்) மற்றும் திருப்பிச் செலுத்தும் காலம் முழுவதும் 3% வட்டி மானியம் (Interest Subvention)."
                    : "25% capital subsidy up to ₹75 Lakh + 3% interest subvention throughout the loan tenure via TIIC and Commercial Banks."}
                </p>

                {/* Exact Required Documents Checklist */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-blue-100/60 border border-blue-300/60 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{selectedLang === 'ta' ? "தேவையான ஆவணங்கள் (Required Documents):" : "Required Documents:"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {["Aadhaar / KYC", "Degree / Diploma Certificate", "First-Generation Certificate", "Detailed Project Report (DPR)", "Machinery Quotations", "Bank Docs"].map((doc, dIdx) => (
                      <span key={dIdx} className="px-2 py-0.5 rounded bg-white/90 border border-blue-300/80 text-blue-900 font-medium flex items-center gap-1">
                        <span className="text-blue-700 font-bold">✓</span> {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-blue-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Channel: <strong className="text-slate-800">Online NEEDS / TIIC / DIC</strong></span>
                <a 
                  href="https://msmeonline.tn.gov.in/needs/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] transition"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Card 2: UYEGP for Micro/Trading or Micro Finance Scheme (CEN-001) */}
          {isNsfdcEligible ? (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 text-xs shadow-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800">CEN-001</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">6.5% Concessional Rate</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {selectedLang === 'ta' ? "மைக்ரோ நிதி திட்டம் (MFS) – NSFDC / தாட்கோ" : "Micro Finance Scheme (MFS) – NSFDC"}
                    </h4>
                    <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                      {selectedLang === 'ta' ? "SC சிறுதொழில் கடன் (திட்ட மதிப்பு ₹1.40 லட்சம் வரை)" : "Micro units with project outlay up to ₹1.40 Lakh"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                    PM-SURAJ
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  {selectedLang === 'ta' 
                    ? "திட்ட மதிப்பீட்டில் 90% கடன் (அதிகபட்சம் ரூ. 1.25 லட்சம்), 6.5% குறைந்த வட்டி, 36 மாத தவணை மற்றும் 3 மாத அசல் விலக்கு சலுகை."
                    : "90% loan outlay up to ₹1.25 Lakh at 6.5% concessional interest rate, 3-year repayment tenure and 3-month grace period."}
                </p>

                {/* Required Documents */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{selectedLang === 'ta' ? "தேவையான ஆவணங்கள் (Required Documents):" : "Required Documents:"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {["Aadhaar / KYC", "Caste Certificate", "Annual Family Income Proof (<= ₹5 Lakh)", "Micro Business Estimate", "Bank Passbook"].map((doc, dIdx) => (
                      <span key={dIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">✓</span> {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Channel: <strong className="text-slate-800">PM-SURAJ / TAHDCO</strong></span>
                <a 
                  href="https://nsfdc.nic.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 text-xs shadow-xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800">TN-002</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">25% Subsidy (Max ₹3.75 Lakh)</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {selectedLang === 'ta' ? "UYEGP – வேலைவாய்ப்பற்ற இளைஞர் வேலைவாய்ப்பு உருவாக்கும் திட்டம்" : "UYEGP – Unemployed Youth Employment Generation Programme"}
                    </h4>
                    <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                      {selectedLang === 'ta' ? "வணிகம் மற்றும் வர்த்தக திட்டங்கள் (₹15 லட்சம் வரை)" : "Trading and business ventures up to ₹15 Lakh"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                    DIC Portal
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  {selectedLang === 'ta' 
                    ? "ரூ. 15 லட்சம் வரையிலான வணிகத் திட்டங்களுக்கு 25% அரசு மூலதன மானியம் (ரூ. 3.75 லட்சம் வரை) மற்றும் 90-95% வங்கி கடன்."
                    : "Up to ₹15 Lakh project cost with 25% capital subsidy (max ₹3.75 Lakh) and 90-95% bank loan via commercial banks."}
                </p>

                {/* Required Documents */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{selectedLang === 'ta' ? "தேவையான ஆவணங்கள் (Required Documents):" : "Required Documents:"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {["Aadhaar / KYC", "8th Pass Transfer Certificate", "Community Certificate", "Project Quotation / Estimate", "Bank Documents"].map((doc, dIdx) => (
                      <span key={dIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">✓</span> {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Channel: <strong className="text-slate-800">Online UYEGP / DIC</strong></span>
                <a 
                  href="https://msmeonline.tn.gov.in/uyegp/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Card 3: Central Flagship Subsidy PMEGP (CEN-005) */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 text-xs shadow-xs">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800">CEN-005</span>
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">Up to 35% Rural Subsidy</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">
                    {selectedLang === 'ta' ? "பிரதமரின் வேலைவாய்ப்பு உருவாக்கும் திட்டம் (PMEGP)" : "Prime Minister's Employment Generation Programme (PMEGP)"}
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                    {selectedLang === 'ta' ? "மத்திய சிறு குறு நடுத்தர தொழில்கள் அமைச்சகம் (MSME)" : "Ministry of MSME, Govt of India"}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  National Grant
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                {selectedLang === 'ta' 
                  ? "கிராமப்புற சிறப்பு பிரிவினருக்கு 35% வரை அரசு மூலதன மானியம் (ரூ. 50 லட்சம் உற்பத்தி / ரூ. 20 லட்சம் சேவை), வெறும் 5% சொந்த முதலீடு."
                  : "Up to 35% non-repayable margin money subsidy in rural areas for special category beneficiaries with only 5% promoter margin."}
              </p>

              {/* Required Documents */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{selectedLang === 'ta' ? "தேவையான ஆவணங்கள் (Required Documents):" : "Required Documents:"}</span>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {["Aadhaar & PAN Card", "Passport Size Photos", "Detailed Project Report (DPR)", "Special Category / Caste Certificate", "Bank Account Details", "EDP Training Certificate (Post-sanction)"].map((doc, dIdx) => (
                    <span key={dIdx} className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900 font-medium flex items-center gap-1">
                      <span className="text-amber-700 font-bold">✓</span> {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Channel: <strong className="text-slate-800">Online PMEGP e-Portal / KVIC / DIC</strong></span>
              <a 
                href="https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 4: Central Working Capital MUDRA (CEN-004) or Stand-Up India (CEN-007) */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 text-xs shadow-xs">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800">
                      {isNsfdcEligible || isFemale ? "CEN-007" : "CEN-004"}
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {isNsfdcEligible || isFemale ? "₹10 Lakh to ₹1 Crore" : "Up to ₹10 - ₹20 Lakh"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">
                    {isNsfdcEligible || isFemale 
                      ? (selectedLang === 'ta' ? "ஸ்டாண்ட்-அப் இந்தியா திட்டம் (Stand-Up India)" : "Stand-Up India Scheme (SC/ST & Women)")
                      : (selectedLang === 'ta' ? "பிரதமர் முத்ரா யோஜனா (PMMY) – கிஷோர் & தருண்" : "Pradhan Mantri MUDRA Yojana (PMMY)")}
                  </h4>
                  <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                    {isNsfdcEligible || isFemale 
                      ? (selectedLang === 'ta' ? "பசுமை தொழில் நிறுவனங்களுக்கான கூட்டு கடன்" : "Greenfield enterprises in manufacturing, services or trading")
                      : (selectedLang === 'ta' ? "வணிக பிணையில்லா நடைமுறை மூலதனம்" : "Collateral-free working capital for micro retailers")}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                  Bank Finance
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                {isNsfdcEligible || isFemale 
                  ? (selectedLang === 'ta' ? "ரூ. 10 லட்சம் முதல் ரூ. 1 கோடி வரை வணிக வங்கிகள் மூலம் கூட்டு கடன், 15% சொந்த முதலீடு மற்றும் கடன் உத்தரவாதம்." : "Composite loan between ₹10 Lakh and ₹1 Crore for SC/ST and women entrepreneurs with CGFSIL guarantee.")
                  : (selectedLang === 'ta' ? "சொத்து அடமானம் இல்லாமல் ரூ. 10.00 லட்சம் வரை (தருண் பிளஸ் ரூ. 20 லட்சம் வரை) உடனடி வணிக கடன் மற்றும் RuPay வணிக அட்டை." : "Collateral-free credit up to ₹10 Lakh (Tarun Plus ₹20 Lakh) with RuPay business card via all public sector and rural banks.")}
              </p>

              {/* Required Documents */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{selectedLang === 'ta' ? "தேவையான ஆவணங்கள் (Required Documents):" : "Required Documents:"}</span>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {(isNsfdcEligible || isFemale
                    ? ["Aadhaar & PAN Card", "SC/ST / Women Ownership Proof (51%+)", "Greenfield Project Proposal", "Machinery Quotations", "Bank Statements (6 Months)"]
                    : ["Aadhaar & PAN Card", "Business Registration / Udyam Certificate", "Passport Size Photos", "Quotations for Machinery / Stock", "Bank Statement (Last 6 Months)"]
                  ).map((doc, dIdx) => (
                    <span key={dIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">
                Channel: <strong className="text-slate-800">{isNsfdcEligible || isFemale ? "Stand-Up Mitra / Commercial Banks" : "Mudra Portal / All Bank Branches"}</strong>
              </span>
              <a 
                href={isNsfdcEligible || isFemale ? "https://www.standupmitra.in/" : "https://www.mudra.org.in/"} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
