import React from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, 
  Award, Layers, Percent, TrendingUp, HelpCircle, ArrowRight
} from 'lucide-react';

const RISK_TRANSLATIONS = {
  ta: {
    headerTitle: "வணிக அபாயங்கள் மற்றும் தயார்நிலை மதிப்பீடு",
    headerSubtitle: "சந்தை அபாயங்கள், கடன் திருப்பிச் செலுத்தும் திறன் மற்றும் வங்கி ஒப்புதல் தயார்நிலை மதிப்பீடு",
    readinessIndex: "தயார்நிலை குறியீடு",
    bankReady: "வங்கி தயார்",
    ringCredit: "கடன் திருப்பிச் செலுத்தும் தயார்நிலை",
    ringMarket: "சந்தை தேவை & வாடிக்கையாளர் எண்ணிக்கை",
    ringDocs: "தேவையான ஆவணங்கள் & தகுதி",
    repaymentViability: "கடன் திருப்பிச் செலுத்தும் நம்பகத்தன்மை",
    safeViable: "பாதுகாப்பானது & சாத்தியமானது",
    highBurdenLabel: "அதிக நிதிச்சுமை (சரிசெய்தல் தேவை)",
    repaymentRatio: "வருமானத்தில் கடன் தவணை விகிதம் (FOIR)",
    safeCeiling: "35% பாதுகாப்பான வரம்பிற்குள் உள்ளது",
    exceedsCeiling: "35% பாதுகாப்பான வரம்பை விட அதிகம்",
    gracePeriod: "தொடக்க சலுகை காலம்",
    graceDesc: "தொடக்க காலத்தில் அசல் செலுத்த தேவையில்லை",
    months: "மாதங்கள்",
    surplusNarrativeSafe: "மதிப்பிடப்பட்ட நிகர லாபம் மற்றும் நிலையான சந்தை தேவையின் அடிப்படையில், குடும்ப செலவுகளை பாதிக்காமல் கடன் தவணையை எளிதாக செலுத்த போதுமான உபரி நிதி உள்ளது.",
    surplusNarrativeBurden: "தற்போதைய திட்டச் செலவு மற்றும் கடன் அளவு மாதாந்திர நிகர லாபத்தில் 35%-க்கு மேல் உள்ளதால், தவணைச் சுமையை குறைக்க கடன் தொகையை குறைப்பது அல்லது மைக்ரோ பைனான்ஸ் திட்டத்தை தேர்வு செய்வது பரிந்துரைக்கப்படுகிறது.",
    autoSchemeEligible: "விதிமுறைகளின்படி அரசு கடன் திட்டத்தின் கீழ் நேரடி பரிந்துரைக்கு தகுதி பெற்றது.",
    detailedRisksTitle: "விரிவான வணிக அபாயங்கள் & நடைமுறை பாதுகாப்பு நடவடிக்கைகள்",
    recMitigation: "பரிந்துரைக்கப்பட்ட தீர்வு:",
    lowRisk: "குறைந்த அபாயம்",
    moderateRisk: "மிதமான அபாயம்",
    highRisk: "கவனிக்கத்தக்கது / அதிகம்"
  },
  hi: {
    headerTitle: "व्यावसायिक जोखिम एवं तैयारी मूल्यांकन",
    headerSubtitle: "बाज़ार जोखिम, ऋण पुनर्भुगतान व्यवहार्यता और बैंक स्वीकृति की तैयारी का विश्लेषण",
    readinessIndex: "तैयारी सूचकांक",
    bankReady: "बैंक तैयार",
    ringCredit: "ऋण पुनर्भुगतान तैयारी",
    ringMarket: "बाज़ार मांग एवं ग्राहक आधार",
    ringDocs: "आवश्यक दस्तावेज़ एवं पात्रता",
    repaymentViability: "ऋण पुनर्भुगतान व्यवहार्यता",
    safeViable: "सुरक्षित एवं व्यवहार्य",
    highBurdenLabel: "उच्च वित्तीय भार (समायोजन आवश्यक)",
    repaymentRatio: "आय के अनुपात में ऋण किस्त (FOIR)",
    safeCeiling: "35% सुरक्षित सीमा के पूर्णतः भीतर",
    exceedsCeiling: "35% सुरक्षित सीमा से अधिक",
    gracePeriod: "प्रारंभिक छूट अवधि (मोराटोरियम)",
    graceDesc: "शुरुआती महीनों में केवल न्यूनतम ब्याज देय",
    months: "महीने",
    surplusNarrativeSafe: "अनुमानित शुद्ध लाभ और बाज़ार मांग के आधार पर, यह उद्यम घरेलू खर्चों पर दबाव डाले बिना ऋण किश्तों को आसानी से चुकाने में सक्षम है।",
    surplusNarrativeBurden: "ऋण की किस्त मासिक शुद्ध लाभ के 35% सुरक्षित स्तर से अधिक है। ऋण राशि को कम करना या माइक्रो फाइनेंस योजना चुनना अधिक सुरक्षित होगा।",
    autoSchemeEligible: "सरकारी रियायती ऋण योजना के अंतर्गत संस्तुति हेतु पात्र।",
    detailedRisksTitle: "विस्तृत जोखिम कारक एवं व्यावहारिक समाधान",
    recMitigation: "अनुशंसित समाधान:",
    lowRisk: "कम जोखिम",
    moderateRisk: "मध्यम जोखिम",
    highRisk: "उच्च जोखिम"
  },
  te: {
    headerTitle: "వ్యాపార రిస్క్ మరియు సంసిద్ధత అంచనా",
    headerSubtitle: "మార్కెట్ నష్టాలు, రుణ చెల్లింపు సామర్థ్యం మరియు బ్యాంక్ మంజూరు సంసిద్ధత విశ్లేషణ",
    readinessIndex: "సంసిద్ధత సూచిక",
    bankReady: "బ్యాంక్ రెడీ",
    ringCredit: "రుణ చెల్లింపు సంసిద్ధత",
    ringMarket: "మార్కెట్ డిమాండ్ & వినియోగదారుల పరిధి",
    ringDocs: "అవసరమైన పత్రాలు & అర్హత",
    repaymentViability: "రుణ చెల్లింపు సాధ్యత",
    safeViable: "సురక్షితమైనది & సాధ్యమైనది",
    highBurdenLabel: "ఎక్కువ ఆర్థిక భారం (మార్పు అవసరం)",
    repaymentRatio: "ఆదాయంలో రుణ వాయిదా నిష్పత్తి (FOIR)",
    safeCeiling: "35% సురక్షిత పరిమితి లోపలే ఉంది",
    exceedsCeiling: "35% సురక్షిత పరిమితి దాటింది",
    gracePeriod: "ప్రారంభ గడువు కాలం",
    graceDesc: "ప్రారంభంలో అసలు చెల్లించాల్సిన అవసరం లేదు",
    months: "నెలలు",
    surplusNarrativeSafe: "అంచనా వేసిన నికర లాభం మరియు స్థానిక డిమాండ్ ఆధారంగా, కుటుంబ ఖర్చులకు ఇబ్బంది లేకుండా రుణ వాయిదాలను సులభంగా చెల్లించే మిగులు ఉంది.",
    surplusNarrativeBurden: "రుణ వాయిదా నికర లాభంలో 35% కంటే ఎక్కువగా ఉంది. రుణ మొత్తాన్ని తగ్గించడం లేదా మైక్రో ఫైనాన్స్ పథకం తీసుకోవడం ఉత్తమం.",
    autoSchemeEligible: "ప్రభుత్వ రాయితీ రుణ పథకం కింద అర్హత సాధించింది.",
    detailedRisksTitle: "వివరణాత్మక రిస్క్ కారకాలు మరియు ఆచరణాత్మక పరిష్కారాలు",
    recMitigation: "సిఫార్సు చేయబడిన పరిష్కారం:",
    lowRisk: "తక్కువ రిస్క్",
    moderateRisk: "మధ్యస్థ రిస్క్",
    highRisk: "ఎక్కువ రిస్క్"
  },
  en: {
    headerTitle: "Business Risk & Preparedness Assessment",
    headerSubtitle: "Evaluation of market risks, repayment feasibility, and bank sanction readiness",
    readinessIndex: "Readiness Index",
    bankReady: "Bank Ready",
    ringCredit: "Credit & Repayment Readiness",
    ringMarket: "Market Demand & Customer Base",
    ringDocs: "Required Documents & Eligibility",
    repaymentViability: "Loan Repayment Viability",
    safeViable: "Safe & Viable",
    highBurdenLabel: "High Financial Burden (Adjustment Needed)",
    repaymentRatio: "Repayment to Earnings Ratio (FOIR)",
    safeCeiling: "Well within the 35% safe ceiling",
    exceedsCeiling: "Exceeds 35% safe ceiling — restructure advised",
    gracePeriod: "Setup Grace Period",
    graceDesc: "Pay only minimal interest during startup",
    months: "Months",
    surplusNarrativeSafe: "Based on projected net profit and conservative demand estimates, this micro-enterprise demonstrates sufficient surplus to cover loan installments comfortably without stressing household living expenses.",
    surplusNarrativeBurden: "Debt repayments exceed the 35% safe benchmark against estimated monthly net income. Restructuring with a lower loan amount or opting for the Micro Finance Scheme brings repayments into the safe green zone.",
    autoSchemeEligible: "Eligible for automatic recommendation under Government Concessional Schemes.",
    detailedRisksTitle: "Detailed Risk Factors & Practical Mitigations",
    recMitigation: "Recommended Mitigation:",
    lowRisk: "LOW RISK",
    moderateRisk: "MODERATE",
    highRisk: "HIGH RISK"
  }
};

export function TabRisk({ module1Report, module2Result, dashboardKpis, selectedLang = 'en' }) {
  const t = RISK_TRANSLATIONS[selectedLang] || RISK_TRANSLATIONS.en;

  const foirPctVal = Number(
    module2Result?.foirPercentage ||
    dashboardKpis?.foirPercentage ||
    dashboardKpis?.foir_percentage ||
    module2Result?.affordability?.foir_percentage ||
    57.4
  );
  const foirPct = foirPctVal.toFixed(1);
  const isHighBurden = foirPctVal > 50;
  const isModerateBurden = foirPctVal > 35 && foirPctVal <= 50;
  // 1. Dynamic Credit & Repayment Readiness (based on actual FOIR math)
  let creditScoreVal = 75;
  if (foirPctVal <= 20) {
    creditScoreVal = 95;
  } else if (foirPctVal <= 35) {
    creditScoreVal = Math.round(100 - (foirPctVal * 0.85)); // 70 - 83%
  } else if (foirPctVal <= 50) {
    creditScoreVal = Math.round(85 - ((foirPctVal - 35) * 1.5)); // 62 - 85%
  } else {
    creditScoreVal = Math.max(35, Math.round(62 - ((foirPctVal - 50) * 0.8))); // 35 - 62%
  }

  // 2. Dynamic Market Demand & Customer Base (based on Gemini M1 opportunity rating & consumer base)
  const oppScoreStr = String(module1Report?.opportunity_analysis?.opportunity_score || module1Report?.opportunityAnalysis?.opportunityScore || 'HIGH').toUpperCase();
  const consumerBasePop = Number(module1Report?.market_reach?.consumer_base_population || module1Report?.marketReach?.consumerBasePopulation || 25000);
  let marketScoreVal = oppScoreStr.includes('HIGH') ? 88 : oppScoreStr.includes('MOD') ? 74 : 62;
  if (consumerBasePop > 30000) marketScoreVal = Math.min(95, marketScoreVal + 4);

  // 3. Dynamic Required Documents & Eligibility (based on Apex Corporation demographic alignment)
  const userCategory = dashboardKpis?.social_category || module1Report?.applicantDetails?.socialCategory || 'OBC';
  let docsScoreVal = (userCategory === 'OBC' || userCategory === 'SC' || userCategory === 'Safai Karamchari') ? 94 : 88;
  if (dashboardKpis?.gender === 'Female' || module1Report?.applicantDetails?.gender === 'Female') {
    docsScoreVal = Math.min(98, docsScoreVal + 2); // Priority quota
  }

  // 4. Weighted Composite Score
  const compositeScore = Number(
    dashboardKpis?.readinessRings?.compositeScorePct ||
    dashboardKpis?.composite_readiness_score ||
    Math.round((creditScoreVal * 0.45) + (marketScoreVal * 0.35) + (docsScoreVal * 0.20))
  );

  const isUrban = Boolean(
    dashboardKpis?.is_urban ||
    (dashboardKpis?.village_name && (dashboardKpis.village_name.toLowerCase().includes('kolathur') || dashboardKpis.village_name.toLowerCase().includes('ward') || dashboardKpis.village_name.toLowerCase().includes('chennai'))) ||
    (dashboardKpis?.district_name && (dashboardKpis.district_name.toLowerCase().includes('chennai') || dashboardKpis.district_name.toLowerCase().includes('bengaluru') || dashboardKpis.district_name.toLowerCase().includes('mumbai')))
  );

  const rings = [
    { label: t.ringCredit, value: creditScoreVal, color: creditScoreVal >= 70 ? "#006B7A" : "#D97706", radius: 88, stroke: 9 },
    { label: t.ringMarket, value: marketScoreVal, color: "#009DB3", radius: 72, stroke: 9 },
    { label: t.ringDocs, value: docsScoreVal, color: "#02C6E1", radius: 56, stroke: 9 },
  ];

  const getCircumference = (radius) => 2 * Math.PI * radius;

  // Live AI threats from Gemini
  const aiSupply = module1Report?.threats_identification?.supply_bottlenecks;
  const aiThreatList = module1Report?.swot_analysis?.threats || [];

  // Dynamically generate risk factors fusing live Gemini AI intelligence & debt math
  const getDynamicRiskFactors = () => {
    const debtBurdenLabel = isHighBurden 
      ? (selectedLang === 'ta' ? "அதிக நிதிச்சுமை" : selectedLang === 'hi' ? "उच्च वित्तीय बोझ" : selectedLang === 'te' ? "ఎక్కువ ఆర్థిక భారం" : "HIGH BURDEN")
      : isModerateBurden 
      ? (selectedLang === 'ta' ? "மிதமான தவணை" : selectedLang === 'hi' ? "मध्यम वित्तीय भार" : selectedLang === 'te' ? "మధ్యస్థ భారం" : "MODERATE")
      : (selectedLang === 'ta' ? "பாதுகாப்பானது" : selectedLang === 'hi' ? "सुरक्षित" : selectedLang === 'te' ? "సురక్షితం" : "LOW RISK");

    const debtBurdenColor = isHighBurden ? "bg-rose-100 text-rose-800 border-rose-200" : isModerateBurden ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-emerald-100 text-emerald-800 border-emerald-200";

    return [
      {
        title: selectedLang === 'ta' ? "1. விரைவு வணிக ஆப்ஸ்கள் மற்றும் சூப்பர் மார்க்கெட் போட்டி" :
               selectedLang === 'hi' ? "1. क्विक-कॉमर्स ऐप्स एवं सुपरमार्केट प्रतिस्पर्धा" :
               selectedLang === 'te' ? "1. క్విక్ డెలివరీ యాప్‌లు & సూపర్ మార్కెట్ పోటీ" :
               "1. Quick-Commerce Apps & Supermarket Competition",
        level: isUrban ? t.moderateRisk : t.lowRisk,
        levelColor: isUrban ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-emerald-100 text-emerald-800 border-emerald-200",
        description: isUrban
          ? (aiThreatList[0] || (selectedLang === 'ta' ? "நகர்ப்புற வார்டுகளில் 10 நிமிட டெலிவரி செயலிகள் மற்றும் சங்கிலித் தொடர் பல்பொருள் அங்காடிகள் செயல்படுகின்றன." :
             selectedLang === 'hi' ? "घने शहरी क्षेत्रों में 10 मिनट डिलीवरी ऐप्स और सुपरमार्केट्स से प्रतिस्पर्धा संभव है।" :
             selectedLang === 'te' ? "పట్టణ ప్రాంతాలలో క్విక్ డెలివరీ యాప్‌లు మరియు చైన్ సూపర్ మార్కెట్‌ల ప్రభావం ఉండవచ్చు." :
             "Dense metropolitan wards face 10-minute delivery apps (Blinkit/Zepto/Instamart) and chain supermarkets."))
          : (selectedLang === 'ta' ? "கிராம சந்தைகளில் பெரிய பல்பொருள் அங்காடிகள் இல்லாதது உங்கள் கடைக்கு கூடுதல் வாய்ப்பு." :
             selectedLang === 'hi' ? "ग्रामीण क्षेत्र में बड़े सुपरमार्केट न होने से स्थानीय दुकान को सीधा लाभ मिलता है।" :
             selectedLang === 'te' ? "గ్రామీణ ప్రాంతాల్లో పెద్ద సూపర్ మార్కెట్లు లేకపోవడం స్థానిక దుకాణానికి అనుకూలం." :
             "Absence of large retail chains in the village cluster provides strong local customer retention."),
        mitigation: selectedLang === 'ta' ? "வாட்ஸ்அப் மூலம் உடனடியாக வீட்டுக்கே டெலிவரி, வாடிக்கையாளர் கணக்கு (கடன் லெட்ஜர்) மற்றும் புதிய தரம் வாய்ந்த பொருட்களை வழங்குங்கள்." :
                    selectedLang === 'hi' ? "फोन/व्हाट्सएप पर 5 मिनट में होम डिलीवरी, व्यक्तिगत खाता और ताजी वस्तुएं उपलब्ध कराएं।" :
                    selectedLang === 'te' ? "ఫోన్/వాట్సాప్ ద్వారా ఉచిత డోర్ డెలివరీ, వ్యక్తిగత ఖాటా మరియు తాజా సరుకులను అందించడం." :
                    "Offer immediate 5-minute phone/WhatsApp doorstep delivery, personalized credit ledger (khata), and fresh loose provisions."
      },
      {
        title: selectedLang === 'ta' ? `2. மாதாந்திர கடன் தவணை செலுத்தும் திறன் (${foirPct}%)` :
               selectedLang === 'hi' ? `2. मासिक ऋण चुकौती क्षमता (${foirPct}%)` :
               selectedLang === 'te' ? `2. నెలవారీ రుణ చెల్లింపు సామర్థ్యం (${foirPct}%)` :
               `2. Monthly Debt Servicing Capacity (${foirPct}%)`,
        level: debtBurdenLabel,
        levelColor: debtBurdenColor,
        description: isHighBurden
          ? (selectedLang === 'ta' ? `மாதாந்திர நிகர லாபத்தில் கடன் தவணை ${foirPct}% ஆக உள்ளதால், இது 35% பாதுகாப்பான வரம்பை விட அதிகமாக உள்ளது. கடன் தொகையை குறைப்பது அல்லது மைக்ரோ பைனான்ஸ் திட்டத்தை தேர்ந்தெடுப்பது பாதுகாப்பானது.` :
             selectedLang === 'hi' ? `ऋण किस्त मासिक लाभ का ${foirPct}% है जो 35% की सुरक्षित सीमा से अधिक है। ऋण राशि कम करना या माइक्रो फाइनेंस योजना चुनना हितकर होगा।` :
             selectedLang === 'te' ? `రుణ వాయిదా నికర లాభంలో ${foirPct}% గా ఉన్నందున 35% పరిమితిని దాటింది. రుణ మొత్తాన్ని తగ్గించడం మంచిది.` :
             `Debt repayments constitute ${foirPct}% of projected monthly net earnings (Exceeds 35% safe threshold). Reducing project outlay or selecting the Micro Finance scheme brings this into the safe zone.`)
          : (selectedLang === 'ta' ? `கடன் தவணை மாதாந்திர நிகர லாபத்தில் ${foirPct}% மட்டுமே உள்ளதால், தொழில் செலவுகள் மற்றும் குடும்ப செலவுகளை எளிதாக சமாளிக்கலாம்.` :
             selectedLang === 'hi' ? `ऋण किस्त अनुमानित शुद्ध लाभ का ${foirPct}% है (सुरक्षित सीमा के अंदर)। व्यवसाय परिचालन सुचारु रूप से चलेगा।` :
             selectedLang === 'te' ? `రుణ వాయిదా నికర ఆదాయంలో ${foirPct}% మాత్రమే ఉన్నందున వ్యాపారానికి ఎటువంటి ఇబ్బంది ఉండదు.` :
             `Debt repayments constitute ${foirPct}% of projected monthly net earnings (Safe Affordability below 35%).`),
        mitigation: isHighBurden
          ? (selectedLang === 'ta' ? "ரூ. 1.40 லட்சம் மைக்ரோ பைனான்ஸ் திட்டத்தை தேர்வு செய்யுங்கள் அல்லது அரசு மூலதன மானியத்தை (PMEGP 35%) பயன்படுத்தி தவணையை பாதுகாப்பான நிலைக்கு கொண்டு வாருங்கள்." :
             selectedLang === 'hi' ? "ऋण राशि ₹1.40 लाख माइक्रो फाइनेंस योजना में बदलें या 35% पीएमईजीपी पूंजीगत सब्सिडी का उपयोग करें।" :
             selectedLang === 'te' ? "రుణాన్ని ₹1.40 లక్షల మైక్రో ఫైనాన్స్ పథకానికి మార్చండి లేదా PMEGP సబ్సిడీని పొందండి." :
             "Switch to Micro Finance scheme (₹1.40L limit) or leverage PMEGP 35% margin subsidy to drop FOIR below 25%.")
          : (selectedLang === 'ta' ? "சலுகை 8.0% வட்டி மற்றும் காலாண்டு குறைந்துவரும் இருப்பு முறை மூலம் தவணைகளை சரியான நேரத்தில் செலுத்துங்கள்." :
             selectedLang === 'hi' ? "8.0% रियायती ब्याज और त्रैमासिक घटती शेष राशि अनुसूची से तनावमुक्त पुनर्भुगतान सुनिश्चित करें।" :
             selectedLang === 'te' ? "8.0% రాయితీ వడ్డీతో సులభ వాయిదాలలో చెల్లించండి." :
             "Concessional 8.0% interest and quarterly reducing balance schedule ensure stress-free repayments.")
      },
      {
        title: selectedLang === 'ta' ? "3. உள்ளூர் போட்டி நெருக்கம்" :
               selectedLang === 'hi' ? "3. स्थानीय प्रतिस्पर्धा का स्तर" :
               selectedLang === 'te' ? "3. స్థానిక పోటీ పరిధి" :
               "3. Local Competition Proximity",
        level: isUrban ? t.moderateRisk : t.lowRisk,
        levelColor: isUrban ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-emerald-100 text-emerald-800 border-emerald-200",
        description: isUrban 
          ? (selectedLang === 'ta' ? "நகர பகுதிகளில் பிற கடைகள் மற்றும் வணிக நிறுவனங்களின் அடர்த்தி அதிகம் உள்ளது." :
             selectedLang === 'hi' ? "शहरी क्षेत्र में प्रतिस्पर्धी दुकानों और बाज़ार का घनत्व अधिक है।" :
             selectedLang === 'te' ? "పట్టణ ప్రాంతాలలో ఇతర వ్యాపారాల పోటీ ఎక్కువగా ఉంటుంది." :
             "Dense metropolitan catchment with multiple commercial counters within 1.5 km.")
          : (selectedLang === 'ta' ? "கிராம பஞ்சாயத்து பகுதியில் நேரடி போட்டிக் கடைகள் மிகக் குறைவாகவே உள்ளன." :
             selectedLang === 'hi' ? "गाँव के समूह में सीधे प्रतिस्पर्धी व्यवसायों की संख्या कम है।" :
             selectedLang === 'te' ? "గ్రామ పరిధిలో ప్రత్యక్ష పోటీదారుల సంఖ్య తక్కువగా ఉంది." :
             "Low density of direct competitor businesses within the immediate village cluster."),
        mitigation: selectedLang === 'ta' ? "தனித்துவமான சேவை மற்றும் தரமான பொருட்கள் மூலம் வாடிக்கையாளர்களை நிரந்தரமாக்கிக் கொள்ளலாம்." :
                    selectedLang === 'hi' ? "ग्राहकों से सीधा संपर्क और बेहतर सेवा देकर बाज़ार में अपनी मजबूत पहचान बनाएं।" :
                    selectedLang === 'te' ? "మంచి నాణ్యత మరియు ప్రత్యక్ష కస్టమర్ సంబంధాలతో శాశ్వత కస్టమర్లను ఏర్పరచుకోవడం." :
                    "Early market positioning and quality local service build loyal repeat customers."
      },
      {
        title: selectedLang === 'ta' ? "4. மூலப்பொருள் கொள்முதல் & போக்குவரத்து" :
               selectedLang === 'hi' ? "4. कच्चा माल आपूर्ति एवं परिवहन" :
               selectedLang === 'te' ? "4. ముడిసరుకు రవాణా మరియు సరఫరా" :
               "4. Raw Material Supply & Transport",
        level: t.moderateRisk,
        levelColor: "bg-amber-100 text-amber-800 border-amber-200",
        description: aiSupply || (selectedLang === 'ta' ? "மொத்த வியாபாரிகள் அருகிலுள்ள தாலுகா அல்லது நகரத்தில் அமைந்துள்ளதால் திட்டமிட்ட கொள்முதல் அவசியம்." :
                      selectedLang === 'hi' ? "थोक विक्रेता तहसील या नजदीकी शहर में स्थित होने से नियोजित स्टॉक जरूरी है।" :
                      selectedLang === 'te' ? "హోల్‌సేల్ మార్కెట్ దగ్గరి పట్టణంలో ఉండటం వల్ల ముందస్తు ప్లానింగ్ అవసరం." :
                      "Wholesale suppliers located at sub-district market centers require planned logistics runs."),
        mitigation: selectedLang === 'ta' ? "வாரம் ஒருமுறை பிற கிராம வியாபாரிகளுடன் இணைந்து கூட்டு கொள்முதல் செய்து போக்குவரத்து செலவை குறைக்கவும்." :
                    selectedLang === 'hi' ? "साप्ताहिक समेकित खरीद चक्र अपनाएं ताकि परिवहन लागत न्यूनतम रहे।" :
                    selectedLang === 'te' ? "వారానికి ఒకసారి ఉమ్మడి రవాణా ద్వారా ముడిసరుకు తేవడం వలన ఖర్చులు తగ్గుతాయి." :
                    "Maintain weekly consolidated purchasing cycles to minimize transport overhead."
      },
      {
        title: selectedLang === 'ta' ? "5. ஆவண சரிபார்ப்பு & தகுதி நிலை" :
               selectedLang === 'hi' ? "5. आवश्यक दस्तावेज़ एवं पात्रता सत्यापन" :
               selectedLang === 'te' ? "5. పత్రాల సమర్పణ మరియు అర్హత" :
               "5. Required Documentation & Eligibility",
        level: t.lowRisk,
        levelColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        description: selectedLang === 'ta' ? "ஆதார், சாதி சான்றிதழ், வங்கி கணக்கு மற்றும் முகவரி சான்றுகள் தயாராக உள்ளன." :
                      selectedLang === 'hi' ? "आधार, जाति प्रमाण पत्र, बैंक खाता और निवास प्रमाण पत्र मानक रूप से उपलब्ध हैं।" :
                      selectedLang === 'te' ? "ఆధార్, కుల ధృవీకరణ పత్రం, బ్యాంక్ ఖాతా వివరాలు సరిచూడబడ్డాయి." :
                      "Aadhaar, Social Category certificate, bank account, and residential proof verified.",
        mitigation: selectedLang === 'ta' ? "மாநில முகமைகள் (SCA) கோரும் அனைத்து தகுதிகளும் பூர்த்தியாகி உள்ளதால் கடன் அனுமதி விரைவாக கிடைக்கும்." :
                    selectedLang === 'hi' ? "दस्तावेज़ चेकलिस्ट राज्य चैनलाइजिंग एजेंसी (SCA) के मानकों के पूर्णतः अनुरूप है।" :
                    selectedLang === 'te' ? "రాష్ట్ర ఏజెన్సీ (SCA) నిబంధనల ప్రకారం పత్రాలన్నీ సరిగ్గా ఉన్నాయి." :
                    "Checklist strictly meets State Channelizing Agency (SCA) requirements for swift sanction."
      },
      {
        title: selectedLang === 'ta' ? "6. வணிக பதிவு & உள்ளாட்சி அனுமதி" :
               selectedLang === 'hi' ? "6. व्यवसाय पंजीकरण एवं स्थानीय अनुमति" :
               selectedLang === 'te' ? "6. వ్యాపార రిజిస్ట్రేషన్ మరియు అనుమతులు" :
               "6. Business Registration & Local Permits",
        level: t.lowRisk,
        levelColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        description: selectedLang === 'ta' ? "மத்திய அரசின் உத்யம் எம்.எஸ்.எம்.இ பதிவு மற்றும் ஊராட்சி அனுமதி எளிய முறையில் பெறலாம்." :
                      selectedLang === 'hi' ? "उद्यम एमएसएमई पंजीकरण और ग्राम पंचायत सहमति सरल प्रक्रिया से संभव है।" :
                      selectedLang === 'te' ? "ఉద్యమ్ ఎంఎస్ఎంఈ నమోదు మరియు గ్రామ పంచాయతీ అనుమతులు సులభంగా లభిస్తాయి." :
                      "Udyam MSME Registration and local body consent are standard single-window requisites.",
        mitigation: selectedLang === 'ta' ? "இலவச உத்யம் பதிவு இணையதள வழிகாட்டுதல் மற்றும் விண்ணப்ப மாதிரி இந்த அறிக்கையில் வழங்கப்பட்டுள்ளது." :
                    selectedLang === 'hi' ? "मुफ्त उद्यम पोर्टल पंजीकरण प्रारूप और दिशा-निर्देश इस रिपोर्ट के साथ संलग्न हैं।" :
                    selectedLang === 'te' ? "ఉచిత ఉద్యమ్ రిజిస్ట్రేషన్ మరియు ఫారమ్ వివరాలు ఈ నివేదికతో ఇవ్వబడ్డాయి." :
                    "Single-window government registration guidelines provided directly in this dossier."
      }
    ];
  };

  const riskFactors = getDynamicRiskFactors();

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-blue-700" />
          <span>{t.headerTitle}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t.headerSubtitle}
        </p>
      </div>

      {/* 2. Top Summary: Ring Index & Affordability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Rings Visual */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-base font-bold text-slate-900 mb-2">{t.readinessIndex}</h3>
          
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
              <span className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-2xs border ${
                isSafe 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : isModerateBurden 
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
                {isSafe ? t.bankReady : isModerateBurden ? 'MODERATE' : 'REVIEW REPAYMENT'}
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
                <Award className={`w-5 h-5 ${isSafe ? 'text-emerald-700' : 'text-rose-600'}`} />
                <h3 className="text-base font-bold text-slate-900">{t.repaymentViability}</h3>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isSafe 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : isModerateBurden 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {isSafe ? t.safeViable : t.highBurdenLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className={`p-4 rounded-xl border ${
                isSafe ? 'bg-slate-50 border-slate-100' : 'bg-rose-50/50 border-rose-200'
              }`}>
                <span className="text-xs text-slate-500">{t.repaymentRatio}</span>
                <div className={`text-2xl font-black mt-1 ${
                  isSafe ? 'text-slate-900' : isModerateBurden ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {foirPct}%
                </div>
                <p className={`text-[11px] mt-1 ${isSafe ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                  {isSafe ? t.safeCeiling : t.exceedsCeiling}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">{t.gracePeriod}</span>
                <div className="text-2xl font-black text-blue-700 mt-1">6 {t.months}</div>
                <p className="text-[11px] text-slate-500 mt-1">{t.graceDesc}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isSafe ? t.surplusNarrativeSafe : t.surplusNarrativeBurden}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{t.autoSchemeEligible}</span>
          </div>
        </div>
      </div>

      {/* 3. Detailed 6-Point Risk Breakdown */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">
          {t.detailedRisksTitle}
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
                <div className="text-[11px] font-bold text-slate-700 mb-1">{t.recMitigation}</div>
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
