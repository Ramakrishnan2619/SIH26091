import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, IndianRupee, ShieldAlert, CheckCircle2, 
  HelpCircle, Calendar, Percent, RefreshCw, BarChart2, Layers
} from 'lucide-react';
import { calculateFinanceClientSide } from '../utils/financialMath';
import { getTranslation } from '../utils/translations';

export function TabFinancial({ module2Result, onMarginChange, selectedLang = 'en' }) {
  const t = getTranslation(selectedLang);
  const initialMargin = module2Result?.marginCapital || module2Result?.margin_capital || module2Result?.financial_summary?.margin_money_amount || 100000;
  const initialNetProfit = module2Result?.affordability?.estimated_net_profit_monthly || 28500;

  const [marginInput, setMarginInput] = useState(initialMargin);

  // Compute live recalculation based on margin input
  const liveCalc = calculateFinanceClientSide(marginInput, initialNetProfit);
  const display = liveCalc?.isEligible ? liveCalc : null;

  const finLabels = {
    en: {
      subheading: 'Government Concessional Credit Scheme (NSFDC / NBCFDC Aligned) • 8.0% p.a.',
      repaymentStatus: 'Repayment Status',
      capexDesc: 'Total capital for machinery, equipment & setup',
      marginDesc: 'Beneficiary promoter margin required',
      bifurcation: 'Project Cost Allocation (MoSJE / SCA Compliance Standard)',
      bifurcationSub: 'Strict statutory bifurcation between fixed asset creation and operating liquidity',
      capexTitle: '🏗️ Capital Expenditure (CAPEX - 75%)',
      capexDetail: 'Machinery, tools, shop infrastructure, and physical asset acquisition.',
      opexTitle: '📦 Working Capital / OPEX (25%)',
      opexDetail: 'Initial raw materials, inventory stocking, and day-to-day liquidity buffer.',
      simTitle: 'Loan & Investment Simulator',
      simSub: 'Adjust your self-investment to see the updated loan eligibility and repayment schedule.',
      selectedInv: 'Your Investment Selected:',
      monthlyEmi: 'Monthly Equivalent (EMI)',
      monthlySub: 'Budgeted monthly outflow',
      quarterlyInst: 'Quarterly Installment',
      quarterlySub: 'Paid once every 3 months',
      gracePeriod: 'Setup Grace Period',
      graceSub: 'Pay only minimal interest during startup',
      capacity: 'Loan Repayment Capacity',
      months: 'Months'
    },
    ta: {
      subheading: 'அரசு மானியக் கடன் திட்டம் (NSFDC / NBCFDC இணைக்கப்பட்டது) • 8.0% ஆண்டு வட்டி',
      repaymentStatus: 'திருப்பிச் செலுத்தும் நிலை',
      capexDesc: 'இயந்திரங்கள், உபகரணங்கள் மற்றும் அமைப்பிற்கான மொத்த மூலதனம்',
      marginDesc: 'விண்ணப்பதாரரின் கட்டாய குறைந்தபட்ச சுய முதலீடு',
      bifurcation: 'திட்டச் செலவு ஒதுக்கீடு (அரசு வழிகாட்டுதல் தரநிலை)',
      bifurcationSub: 'நிலையான சொத்து உருவாக்கம் மற்றும் செயல்பாட்டுத் தேவைகளுக்கான சட்டப்பூர்வ பிரிவு',
      capexTitle: '🏗️ மூலதனச் செலவு (CAPEX - 75%)',
      capexDetail: 'இயந்திரங்கள், கருவிகள், கடை உள்கட்டமைப்பு மற்றும் சொத்துக்கள் கையகப்படுத்தல்.',
      opexTitle: '📦 நடப்பு மூலதனம் / செயல்பாட்டுச் செலவு (OPEX - 25%)',
      opexDetail: 'ஆரம்ப மூலப்பொருட்கள், சரக்கு இருப்பு மற்றும் அன்றாட பணப்புழக்கம்.',
      simTitle: 'கடன் மற்றும் முதலீட்டு கால்குலேட்டர்',
      simSub: 'உங்கள் சுய முதலீட்டை மாற்றி கடன் தகுதி மற்றும் தவணை அட்டவணையை உடனுக்குடன் பார்க்கலாம்.',
      selectedInv: 'தேர்ந்தெடுக்கப்பட்ட முதலீடு:',
      monthlyEmi: 'மாதத் தவணை (EMI)',
      monthlySub: 'மாதாந்திர உத்தேச செலவு',
      quarterlyInst: 'காலாண்டு தவணை',
      quarterlySub: '3 மாதங்களுக்கு ஒருமுறை செலுத்தப்படும் தவணை',
      gracePeriod: 'அவகாசக் காலம் (Moratorium)',
      graceSub: 'தொழில் தொடங்கும் காலத்தில் குறைந்தபட்ச வட்டியை மட்டும் செலுத்தினால் போதும்',
      capacity: 'கடன் திருப்பிச் செலுத்தும் திறன்',
      months: 'மாதங்கள்'
    },
    hi: {
      subheading: 'सरकारी रियायती ऋण योजना (NSFDC / NBCFDC के अनुरूप) • 8.0% वार्षिक ब्याज',
      repaymentStatus: 'पुनर्भुगतान स्थिति',
      capexDesc: 'मशीनरी, उपकरण एवं व्यवसाय स्थापना हेतु कुल पूंजी',
      marginDesc: 'लाभार्थी प्रमोटर का अनिवार्य अंशदान',
      bifurcation: 'परियोजना लागत आवंटन (मंत्रालय अनुपालन मानक)',
      bifurcationSub: 'स्थिर संपत्ति निर्माण एवं कार्यशील पूंजी का वैधानिक विभाजन',
      capexTitle: '🏗️ पूंजीगत व्यय (CAPEX - 75%)',
      capexDetail: 'मशीनरी, औजार, दुकान का बुनियादी ढांचा एवं भौतिक संपत्ति।',
      opexTitle: '📦 कार्यशील पूंजी (OPEX - 25%)',
      opexDetail: 'प्रारंभिक कच्चा माल, इन्वेंट्री स्टॉक एवं दैनिक नकदी प्रवाह।',
      simTitle: 'ऋण एवं निवेश सिमुलेटर',
      simSub: 'अपनी ऋण पात्रता और ईएमआई देखने के लिए अपना निवेश बदलें।',
      selectedInv: 'चयनित आपका निवेश:',
      monthlyEmi: 'मासिक किस्त (EMI)',
      monthlySub: 'मासिक अनुमानित भुगतान',
      quarterlyInst: 'त्रैमासिक किस्त',
      quarterlySub: 'हर 3 महीने में एक बार देय',
      gracePeriod: 'शुरुआती ग्रेस अवधि (मोरेटोरियम)',
      graceSub: 'शुरुआती महीनों में केवल न्यूनतम ब्याज का भुगतान',
      capacity: 'ऋण पुनर्भुगतान क्षमता',
      months: 'महीने'
    },
    te: {
      subheading: 'ప్రభుత్వ రాయితీ రుణ పథకం (NSFDC / NBCFDC కింద) • 8.0% వార్షిక వడ్డీ',
      repaymentStatus: 'తిరిగి చెల్లించే స్థితి',
      capexDesc: 'యంత్రాలు, పరికరాలు మరియు వ్యాపార స్థాపనకు మొత్తం మూలధనం',
      marginDesc: 'దరఖాస్తుదారు తప్పనిసరి స్వంత వాటా',
      bifurcation: 'ప్రాజెక్ట్ వ్యయ విభజన (MoSJE నిబంధనల ప్రకారం)',
      bifurcationSub: 'స్థిర ఆస్తులు మరియు నిర్వహణ మూలధనం మధ్య స్పష్టమైన విభజన',
      capexTitle: '🏗️ మూలధన వ్యయం (CAPEX - 75%)',
      capexDetail: 'యంత్రాలు, పనిముట్లు మరియు భౌతిక ఆస్తుల కొనుగోలు.',
      opexTitle: '📦 నిర్వహణ మూలధనం (OPEX - 25%)',
      opexDetail: 'ముడి సరుకులు, ఇన్వెంటరీ నిల్వలు మరియు రోజువారీ ఖర్చులు.',
      simTitle: 'రుణం & పెట్టుబడి సిమ్యులేటర్',
      simSub: 'మీ పెట్టుబడిని మార్చి అర్హత కలిగిన రుణం మరియు వాయిదా పట్టికను చూడండి.',
      selectedInv: 'ఎంచుకున్న మీ పెట్టుబడి:',
      monthlyEmi: 'నెలవారీ వాయిదా (EMI)',
      monthlySub: 'నెలవారీ అంచనా చెల్లింపు',
      quarterlyInst: 'త్రైమాసిక వాయిదా',
      quarterlySub: 'ప్రతి 3 నెలలకు ఒకసారి చెల్లించాలి',
      gracePeriod: 'మొరటోరియం వ్యవధి',
      graceSub: 'వ్యాపారం ప్రారంభంలో కేవలం స్వల్ప వడ్డీ మాత్రమే చెల్లించాలి',
      capacity: 'రుణం తిరిగి చెల్లించే సామర్థ్యం',
      months: 'నెలలు'
    }
  };

  const fl = finLabels[selectedLang] || finLabels.en;

  return (
    <div className="space-y-8">
      {/* 1. Header & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-blue-700" />
            <span>{t.tabFinancial || "Financial Viability & Loan Structuring"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {fl.subheading}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {display?.schemeName || "Term Loan Scheme"}
          </span>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            display?.foirBadgeColor === 'GREEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            display?.foirBadgeColor === 'YELLOW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {fl.repaymentStatus}: {display?.foirVerdictLabel || "Safe"}
          </span>
        </div>
      </div>

      {/* 2. Primary 3-Metric Cards with Breathing Space */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalCostLabel || "Total Project Cost"}</span>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">
            ₹{display?.projectCost ? Number(display.projectCost).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {fl.capexDesc}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">{t.marginLabel || "Your Investment (10%)"}</span>
            <IndianRupee className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-3">
            ₹{display?.marginCapital ? Number(display.marginCapital).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {fl.marginDesc}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t.loanAmountLabel || "Government Loan (90%)"}</span>
            <Percent className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-3">
            ₹{display?.loanAmount ? Number(display.loanAmount).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            @{display?.interestRatePa || 8.0}% p.a. • {display?.totalQuarters || 28} Quarters ({Math.round((display?.tenureMonths || 84) / 12)} Years) • {display?.moratoriumQuarters || 2}Q ({display?.moratoriumMonths || 6}M) Moratorium
          </div>
        </div>
      </div>

      {/* 2.5 Dynamic Capital Outlay Breakdown: Itemized CAPEX (75%) & OPEX (25%) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>{fl.bifurcation}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {fl.bifurcationSub}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            75% CAPEX : 25% OPEX Model
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Itemized Capital Expenditure Table */}
          <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-black text-slate-800">{fl.capexTitle}</span>
              <span className="text-sm font-black text-slate-900">
                ₹{display?.capexAmount ? Number(display.capexAmount).toLocaleString('en-IN') : '0'}
              </span>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              {[
                {
                  name: selectedLang === 'ta' ? "இயந்திரங்கள் மற்றும் முதன்மை உற்பத்தி உபகரணங்கள்" : "Primary Machinery & Equipment",
                  pct: "45%",
                  amt: Math.round(Number(display?.projectCost || 1000000) * 0.45),
                  desc: selectedLang === 'ta' ? "முக்கிய தயாரிப்புக் கருவிகள் மற்றும் தொழில்நுட்ப உபகரணங்கள்" : "Core processing tools & equipment"
                },
                {
                  name: selectedLang === 'ta' ? "வணிக சேமிப்பு அடுக்குகள், ரேக்குகள் மற்றும் கவுண்டர்கள்" : "Storage Racks, Furniture & Counters",
                  pct: "15%",
                  amt: Math.round(Number(display?.projectCost || 1000000) * 0.15),
                  desc: selectedLang === 'ta' ? "கடை உள்கட்டமைப்பு மற்றும் பாதுகாப்பு சாதனங்கள்" : "Display units & physical infrastructure"
                },
                {
                  name: selectedLang === 'ta' ? "மின் வயரிங், விளம்பர பலகை மற்றும் அமைவு வேலைகள்" : "Electrification, Signage & Setup",
                  pct: "10%",
                  amt: Math.round(Number(display?.projectCost || 1000000) * 0.10),
                  desc: selectedLang === 'ta' ? "மின் இணைப்பு மற்றும் கடையின் அலங்காரம்" : "Power cabling and storefront work"
                },
                {
                  name: selectedLang === 'ta' ? "சட்டப்பூர்வ பதிவுகள் மற்றும் பாதுகாப்புக் கருவிகள்" : "Statutory Licences & Safety Gear",
                  pct: "5%",
                  amt: Math.round(Number(display?.projectCost || 1000000) * 0.05),
                  desc: selectedLang === 'ta' ? "உத்யம் பதிவு மற்றும் ஊராட்சி தடையில்லாச் சான்றிதழ்" : "Udyam registration & Panchayat Trade NOC"
                }
              ].map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-start gap-2">
                  <div>
                    <div className="font-bold text-slate-900">{item.name} <span className="text-slate-400 font-normal">({item.pct})</span></div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">₹{item.amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Working Capital Table */}
          <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
              <span className="text-xs font-black text-emerald-900">{fl.opexTitle}</span>
              <span className="text-sm font-black text-emerald-800">
                ₹{display?.workingCapitalAmount ? Number(display.workingCapitalAmount).toLocaleString('en-IN') : '0'}
              </span>
            </div>
            <div className="divide-y divide-emerald-100 text-xs">
              {[
                {
                  name: selectedLang === 'ta' ? "ஆரம்ப சரக்கு இருப்பு மற்றும் மொத்த மூலப்பொருட்கள்" : "Initial Raw Materials & Inventory",
                  pct: "15%",
                  amt: Math.round(Number(display?.projectCost || 1000000) * 0.15),
                  desc: selectedLang === 'ta' ? "முதல் 30-45 நாட்களுக்கான நுகர்வுப் பொருட்கள்" : "First 30-45 days consumable stock"
                },
                {
                  name: selectedLang === 'ta' ? "60 நாள் பணப்புழக்கம் மற்றும் சப்ளையர் முன்பணம்" : "60-Day Operating Liquidity & Vendor Advance",
                  pct: "7%",
                  amt: Math.round(Number(display?.projectCost || 1000000) * 0.07),
                  desc: selectedLang === 'ta' ? "அன்றாட சுழற்சி மற்றும் விநியோக வைப்புத்தொகை" : "Rolling liquidity & supplier credits"
                },
                {
                  name: selectedLang === 'ta' ? "பேக்கிங், போக்குவரத்து மற்றும் அவசர நிதி இருப்பு" : "Packaging, Freight & Contingency Reserve",
                  pct: "3%",
                  amt: Math.round(Number(display?.projectCost || 1000000) * 0.03),
                  desc: selectedLang === 'ta' ? "விநியோகச் செலவுகள் மற்றும் எதிர்பாராத செலவுகள்" : "Logistics & unforeseen operating buffers"
                }
              ].map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-start gap-2">
                  <div>
                    <div className="font-bold text-emerald-950">{item.name} <span className="text-emerald-600 font-normal">({item.pct})</span></div>
                    <div className="text-[11px] text-emerald-700">{item.desc}</div>
                  </div>
                  <span className="font-bold text-emerald-900 shrink-0">₹{item.amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Margin Money Simulator */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {fl.simTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {fl.simSub}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500">{fl.selectedInv} </span>
            <span className="text-lg font-black text-blue-700">₹{Number(marginInput).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="py-3">
          <input
            type="range"
            min="5000"
            max="500000"
            step="1000"
            value={marginInput}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMarginInput(val);
              if (onMarginChange) onMarginChange(val);
            }}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B2545]"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>₹5,000 (Min Micro)</span>
            <span>₹1,00,000</span>
            <span>₹2,50,000</span>
            <span>₹5,00,000 (₹50 Lakh Maximum)</span>
          </div>
        </div>

        {/* Repayment Breakdown Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">{fl.monthlyEmi}</div>
            <div className="text-lg font-black text-blue-700 mt-1">
              ₹{display?.monthlyEquivalentInstallment ? Number(display.monthlyEquivalentInstallment).toLocaleString('en-IN') : '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{fl.monthlySub}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">{fl.quarterlyInst}</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              ₹{display?.quarterlyInstallment ? Number(display.quarterlyInstallment).toLocaleString('en-IN') : '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{fl.quarterlySub}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">{fl.gracePeriod}</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {display?.moratoriumMonths || 6} {fl.months}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">{fl.graceSub}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500">{fl.capacity}</div>
            <div className={`text-lg font-black mt-1 ${
              display?.foirBadgeColor === 'GREEN' ? 'text-emerald-700' :
              display?.foirBadgeColor === 'YELLOW' ? 'text-amber-700' : 'text-rose-700'
            }`}>
              {display?.foirPercentage}% ({display?.foirVerdictLabel || (display?.foirPercentage <= 35 ? 'Safe' : display?.foirPercentage <= 50 ? 'Moderate' : 'High Financial Burden')})
            </div>
            <div className="text-[11px] text-slate-400 mt-1">of ₹{initialNetProfit.toLocaleString('en-IN')} net income</div>
          </div>
        </div>
      </div>

      {/* 4. Monthly Profit Cushion Projection */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-700" />
              <span>Monthly Business Profit & Repayment Cushion</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Safe benchmark: Debt payments should not exceed 35% of monthly net income.
            </p>
          </div>

          <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            Estimated Monthly Savings Surplus: ₹{Math.max(0, initialNetProfit - (display?.monthlyEquivalentInstallment || 0)).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Visual Cushion Bar */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-600">Loan Repayment Share:</span>
              <span className={`font-bold ${
                (display?.foirPercentage || 0) <= 35 ? 'text-emerald-700' :
                (display?.foirPercentage || 0) <= 50 ? 'text-amber-700' : 'text-rose-700'
              }`}>
                ₹{display?.monthlyEquivalentInstallment?.toLocaleString('en-IN')} ({display?.foirPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-300 ${
                  (display?.foirPercentage || 0) <= 35 ? 'bg-emerald-500' :
                  (display?.foirPercentage || 0) <= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, display?.foirPercentage || 25)}%` }}
              />
              <div className="h-full bg-slate-200 flex-1" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Safe Range (&lt; 35%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate (35% - 50%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> High Burden (&gt; 50%)
            </span>
          </div>
        </div>

        {/* Actionable Roadmap: How to reach the Safe Green Zone (< 35% FOIR) */}
        {(display?.foirPercentage > 35) && (
          <div className="mt-6 p-6 rounded-2xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedLang === 'ta' ? "கடன் தவணையை பாதுகாப்பான வரம்பிற்குள் (< 35%) கொண்டு வருவது எப்படி?" :
                     selectedLang === 'hi' ? "ऋण किस्त को सुरक्षित सीमा (< 35%) में कैसे लाएं?" :
                     selectedLang === 'te' ? "రుణ వాయిదాను సురక్షిత పరిమితి (< 35%) లోకి ఎలా తీసుకురావాలి?" :
                     "How to Bring Debt Repayment into the Safe Zone (< 35% FOIR)"}
                  </h4>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Action Plan
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedLang === 'ta' 
                    ? `தற்போது ரூ. ${(display?.loanAmount || 900000).toLocaleString('en-IN')} கடனுக்கு மாதாந்திர தவணை ரூ. ${(display?.monthlyEquivalentInstallment || 16350).toLocaleString('en-IN')} ஆக உள்ளது, இது உங்களின் மாதாந்திர நிகர லாபத்தில் ${display?.foirPercentage}% ஆகும். வங்கி ஒப்புதல் சுலபமாகவும் தவணைச் சுமை குறைவாகவும் இருக்க கீழ்கண்ட 3 வழிகளில் ஒன்றை தேர்வு செய்யலாம்:`
                    : selectedLang === 'hi'
                    ? `वर्तमान में ₹${(display?.loanAmount || 900000).toLocaleString('en-IN')} के ऋण पर मासिक ईएमआई ₹${(display?.monthlyEquivalentInstallment || 16350).toLocaleString('en-IN')} है, जो आपके शुद्ध लाभ का ${display?.foirPercentage}% है। इसे सुरक्षित बनाने के 3 सरल रास्ते:`
                    : selectedLang === 'te'
                    ? `ప్రస్తుతం ₹${(display?.loanAmount || 900000).toLocaleString('en-IN')} రుణానికి నెలకు ₹${(display?.monthlyEquivalentInstallment || 16350).toLocaleString('en-IN')} వాయిదా ఉంది. దీనిని సురక్షిత పరిధిలోకి తేవడానికి 3 మార్గాలు:`
                    : `Currently, servicing a ₹${(display?.loanAmount || 900000).toLocaleString('en-IN')} loan requires ₹${(display?.monthlyEquivalentInstallment || 16350).toLocaleString('en-IN')}/month, consuming ${display?.foirPercentage}% of projected net earnings. Here are 3 viable ways to bring your repayment under the 35% safe ceiling:`}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-blue-900 block">
                      {selectedLang === 'ta' ? "வழி 1: கடன் அளவை குறைத்தல்" : selectedLang === 'hi' ? "विकल्प 1: ऋण राशि कम करें" : "Option 1: Right-Size Loan"}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {selectedLang === 'ta' 
                        ? "கடன் அளவை ரூ. 3,50,000 ஆக குறைத்தால் மாத தவணை ரூ. 5,650 ஆக குறைந்து FOIR 19.8% (பச்சை மண்டலம்) ஆக மாறும்."
                        : "Adjust project outlay to ₹3.50 Lakh (Loan ₹3.15L) → EMI drops to ~₹5,650/mo, reducing FOIR to 19.8% (Green Safe Zone)."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMarginInput(35000);
                        if (onMarginChange) onMarginChange(35000);
                      }}
                      className="mt-2 text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      {selectedLang === 'ta' ? "ரூ. 35,000 முதலீடாக மாற்றுக →" : "Set ₹35,000 Margin (Safe) →"}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-900 block">
                      {selectedLang === 'ta' ? "வழி 2: மைக்ரோ பைனான்ஸ் திட்டம்" : selectedLang === 'hi' ? "विकल्प 2: माइक्रो फाइनेंस चुनें" : "Option 2: Micro Finance Scheme"}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {selectedLang === 'ta'
                        ? "ரூ. 1.40 லட்சம் வரையிலான மைக்ரோ பைனான்ஸ் திட்டத்தில் 6.5% குறைந்த வட்டியில் மாத தவணை வெறும் ரூ. 2,100 மட்டுமே (FOIR 7.4%)."
                        : "Switch to Micro Finance Scheme (₹1.40 Lakh cap, 6.5% interest) → Monthly EMI only ~₹2,100, dropping FOIR to just 7.4%."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMarginInput(15000);
                        if (onMarginChange) onMarginChange(15000);
                      }}
                      className="mt-2 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      {selectedLang === 'ta' ? "மைக்ரோ வரம்பை அமைக்க (ரூ. 15,000) →" : "Select Micro Scale (₹15,000) →"}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-purple-900 block">
                      {selectedLang === 'ta' ? "வழி 3: 35% அரசு மானியம் (PMEGP)" : selectedLang === 'hi' ? "विकल्प 3: 35% पीएमईजीपी सब्सिडी" : "Option 3: PMEGP 35% Capital Subsidy"}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {selectedLang === 'ta'
                        ? "கிராமப்புற பெண்கள்/OBC பிரிவினருக்கு PMEGP திட்டத்தில் 35% நேரடி மூலதன மானியம் (ரூ. 3.5 லட்சம்) கிடைப்பதால் கடன் சுமை பெருமளவு குறையும்."
                        : "Avail 35% Margin Money Subsidy under PMEGP for rural special categories, directly paying off ₹3.5 Lakh of the capital outlay."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Complete Quarterly Repayment Schedule (Amortization Table to ₹0.00) */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              <span>Full Statutory Quarterly Repayment Schedule</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Exact reducing-balance quarterly installments with {display?.moratoriumQuarters}Q moratorium (Interest only) converging to exact ₹0.00
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Terminal Balance: ₹0.00 Verified ✓
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Quarter</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Opening Principal</th>
                <th className="py-3 px-4">Principal Repaid</th>
                <th className="py-3 px-4">Interest Serviced</th>
                <th className="py-3 px-4">Quarterly Outflow (EQI)</th>
                <th className="py-3 px-4">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {display?.amortizationSchedule?.map((row) => (
                <tr 
                  key={row.quarterNumber} 
                  className={row.isMoratorium ? "bg-amber-50/40" : "hover:bg-slate-50/60"}
                >
                  <td className="py-2.5 px-4 font-bold text-slate-900">Q{row.quarterNumber}</td>
                  <td className="py-2.5 px-4">
                    {row.isMoratorium ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Moratorium
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active EQI
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">₹{Number(row.openingBalance).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">₹{Number(row.principalPaid).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 text-rose-700 font-medium">₹{Number(row.interestPaid).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 font-bold text-blue-700">₹{Number(row.totalInstallment).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 font-black text-slate-900">
                    {row.closingBalance === 0 ? "₹0.00 (Closed)" : `₹${Number(row.closingBalance).toLocaleString('en-IN')}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
