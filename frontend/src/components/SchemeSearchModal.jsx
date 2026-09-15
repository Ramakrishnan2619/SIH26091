import React, { useState } from 'react';
import { 
  Sparkles, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, 
  Building2, Landmark, CreditCard, ShoppingBag, ShieldAlert, RefreshCw, X, Info
} from 'lucide-react';

export function SchemeSearchModal({ assessmentId, isOpen, onClose, defaultCategory = 'SC', applicantDetails = null, selectedLang = 'en' }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeBucket, setActiveBucket] = useState('all');
  const [showEditPrefilled, setShowEditPrefilled] = useState(false);

  // Form State pre-filled from assessment Step 3
  const [ownership, setOwnership] = useState('Me (Primary Applicant)');
  const [age, setAge] = useState(applicantDetails?.age ?? 34);
  const [gender, setGender] = useState(applicantDetails?.gender ?? 'Female');
  const [socialCategory, setSocialCategory] = useState(applicantDetails?.socialCategory ?? defaultCategory);
  const [incomeBand, setIncomeBand] = useState('< ₹1.5 Lakh');
  const [education, setEducation] = useState('10th Pass');
  const [disability, setDisability] = useState(Boolean(applicantDetails?.disabilityStatus));
  const [exServicemen, setExServicemen] = useState(Boolean(applicantDetails?.exServicemenStatus));
  const [hasBusiness, setHasBusiness] = useState(false);
  const [prevSubsidies, setPrevSubsidies] = useState('None');
  const [coApplicantRelation, setCoApplicantRelation] = useState('Spouse');
  const [coApplicantGender, setCoApplicantGender] = useState('Male');

  // Sync when applicantDetails changes
  React.useEffect(() => {
    if (applicantDetails) {
      if (applicantDetails.age !== undefined) setAge(applicantDetails.age);
      if (applicantDetails.gender) setGender(applicantDetails.gender);
      if (applicantDetails.socialCategory) setSocialCategory(applicantDetails.socialCategory);
      if (applicantDetails.disabilityStatus !== undefined) setDisability(Boolean(applicantDetails.disabilityStatus));
      if (applicantDetails.exServicemenStatus !== undefined) setExServicemen(Boolean(applicantDetails.exServicemenStatus));
    }
  }, [applicantDetails, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleExecuteSearch = async () => {
    setLoading(true);
    const applicantName = applicantDetails?.ownerName || applicantDetails?.applicantName || 'Applicant';
    const lang = selectedLang || applicantDetails?.selectedLang || 'en';

    const payload = {
      assessment_id: assessmentId || 101,
      questionnaire: {
        ownership,
        applicant_name: applicantName,
        preferred_language: lang,
        village_name: applicantDetails?.villageName || '',
        district_name: applicantDetails?.districtName || '',
        state_name: applicantDetails?.stateName || 'Tamil Nadu',
        primary_applicant: {
          age: Number(age),
          gender,
          social_category: socialCategory,
          annual_household_income_band: incomeBand,
          education_level: education,
          disability_status: disability,
          ex_servicemen_status: exServicemen
        },
        household_history: {
          has_existing_business: hasBusiness,
          previous_subsidies: prevSubsidies,
          co_applicant: {
            relationship: coApplicantRelation,
            gender: coApplicantGender,
            disability_status: false
          }
        }
      }
    };

    try {
      const res = await fetch('/api/schemes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        fallbackSynthesis();
      }
    } catch (e) {
      fallbackSynthesis();
    } finally {
      setLoading(false);
    }
  };

  const fallbackSynthesis = () => {
    const applicantName = applicantDetails?.ownerName || applicantDetails?.applicantName || 'Applicant';
    const isFemale = gender === 'Female';
    const cat = (socialCategory || 'OBC').toLowerCase();
    const bizCat = (applicantDetails?.businessCategory || '').toLowerCase();
    const isDisab = disability;
    const isTa = selectedLang === 'ta';

    const schemes = [];

    // 1. Direct Statutory Apex Scheme (Category-specific)
    if (cat === 'obc') {
      schemes.push({
        scheme_id: 'NBCFDC_GENERAL_TERM_LOAN',
        scheme_name: isTa ? 'NBCFDC பொது தவணை கடன் திட்டம் (விருப்பத் தேர்வு)' : 'NBCFDC General Term Loan Scheme (Illustrative)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'இதர பிற்படுத்தப்பட்ட (OBC) தொழில்முனைவோருக்கான நேரடி தகுதி' : 'Other Backward Classes (OBC) target demographic',
        illustrative_benefit: isTa ? '₹50.00 லட்சம் வரை 90% சலுகைக் கடன், 84 மாத தவணை மற்றும் 6 மாத அசல் விலக்கு' : '90% concessional credit up to ₹50 Lakh with 84-month repayment tenure and 6-month moratorium',
        indicative_interest_rate: '8.0% p.a. (reducing balance)',
        participating_institutions: isTa ? 'மாநில பிற்படுத்தப்பட்டோர் பொருளாதார மேம்பாட்டுக் கழகம் (TABCEDCO) / தேசியமயமாக்கப்பட்ட வங்கிகள்' : 'State Backward Classes Economic Development Corporation (TABCEDCO) / PSBs',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — விண்ணப்பிக்கும் முன் அருகில் உள்ள TABCEDCO/வங்கியில் சரிபார்க்கவும்' : 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    } else if (cat === 'sc') {
      schemes.push({
        scheme_id: 'NSFDC_TERM_LOAN',
        scheme_name: isTa ? 'NSFDC நேரடி தவணை கடன் திட்டம்' : 'NSFDC Term Loan Scheme (Illustrative)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'பட்டியலின (SC) தொழில்முனைவோருக்கான நேரடி சலுகை' : 'Scheduled Caste (SC) target demographic',
        illustrative_benefit: isTa ? '₹50.00 லட்சம் வரை 90% கடன், 7.5% வட்டி மற்றும் மகளிர் முன்னுரிமை' : '90% concessional credit up to ₹50 Lakh with 7.5% p.a. interest',
        indicative_interest_rate: '7.0% - 7.5% p.a.',
        participating_institutions: isTa ? 'தாட்கோ (TAHDCO) / மாவட்ட மத்திய கூட்டுறவு வங்கிகள்' : 'TAHDCO / District Central Cooperative Banks',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — விண்ணப்பிக்கும் முன் அருகில் உள்ள TAHDCO/வங்கியில் சரிபார்க்கவும்' : 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    } else if (cat.includes('safai')) {
      schemes.push({
        scheme_id: 'NSKFDC_SWACCHTA_UDYAMI',
        scheme_name: isTa ? 'NSKFDC ஸ்வச்சதா உத்யமி யோஜனா' : 'NSKFDC Swacchta Udyami Yojana (Illustrative)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'தூய்மைப் பணியாளர் மற்றும் அவர்களது குடும்பத்தினர்' : 'Safai Karamchari & Sanitation Workers Community',
        illustrative_benefit: isTa ? '₹15 லட்சம் வரை கடன் மற்றும் ₹3,25,000 வரை மூலதன மானியம்' : 'Capital subsidy up to ₹3,25,000 with 4.0% concessional interest rate',
        indicative_interest_rate: '4.0% - 6.0% p.a.',
        participating_institutions: 'NSKFDC / State Channelizing Agencies',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
      });
    }

    // 2. Micro Finance / State Agency Channel
    if (cat === 'obc') {
      schemes.push({
        scheme_id: 'TABCEDCO_MICRO_FINANCE',
        scheme_name: isTa ? 'TABCEDCO மைக்ரோ கிரெடிட் நுண் கடன் திட்டம்' : 'TABCEDCO Micro Credit Finance Scheme (Illustrative)',
        category: 'bank_specific',
        target_beneficiary_match: isTa ? 'குறுந்தொழில் நடத்தும் OBC விண்ணப்பதாரர்கள்' : 'Micro-enterprise OBC entrepreneurs',
        illustrative_benefit: isTa ? 'பிணையில்லா கடன் ₹1,40,000 வரை, 36 மாத சுலப தவணை, மாத தவணை ₹2,200க்குள்' : 'Collateral-free credit up to ₹1,40,000 with 36-month tenure',
        indicative_interest_rate: '6.0% - 6.5% p.a.',
        participating_institutions: 'TABCEDCO / Primary Agricultural Cooperative Credit Societies (PACCS)',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
      });
    } else if (cat === 'sc') {
      schemes.push({
        scheme_id: 'TAHDCO_MICRO_ENTERPRISE',
        scheme_name: isTa ? 'தாட்கோ (TAHDCO) சிறுதொழில் கடன் திட்டம்' : 'TAHDCO Micro Enterprise Scheme (Illustrative)',
        category: 'bank_specific',
        target_beneficiary_match: isTa ? 'கிராமப்புற SC சிறு வணிகர்கள்' : 'Rural SC micro-retail entrepreneurs',
        illustrative_benefit: isTa ? '₹2,00,000 வரை கடன், 30% நேரடி அரசு மானியம்' : 'Up to ₹2,00,000 credit with 30% government capital subsidy',
        indicative_interest_rate: '6.0% p.a.',
        participating_institutions: 'TAHDCO / Lead District Bank',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
      });
    }

    // 3. Trade / Enterprise Sector-Linked Scheme
    const isArtisan = bizCat.includes('wood') || bizCat.includes('craft') || bizCat.includes('tailor') || bizCat.includes('barber') || bizCat.includes('carpenter') || bizCat.includes('mason');
    const isDairy = bizCat.includes('dairy') || bizCat.includes('milk') || bizCat.includes('cattle');

    if (isArtisan) {
      schemes.push({
        scheme_id: 'PM_VISHWAKARMA_YOJANA',
        scheme_name: isTa ? 'பிரதான் மந்திரி விஸ்வகர்மா திட்டம்' : 'PM Vishwakarma Scheme (Illustrative)',
        category: 'business_linked',
        target_beneficiary_match: isTa ? 'பாரம்பரிய கைவினைஞர்கள், தச்சர்கள் மற்றும் தையல் கலைஞர்கள்' : 'Traditional Artisans & Tradesmen',
        illustrative_benefit: isTa ? '₹3.00 லட்சம் பிணையில்லா கடன் (5% வட்டி) + ₹15,000 இலவச கருவித்தொகுப்பு மானியம்' : 'Collateral-free enterprise loan up to ₹3.00 Lakh @ 5.0% + ₹15,000 tool kit grant',
        indicative_interest_rate: '5.0% p.a. (subsidized)',
        participating_institutions: 'Ministry of MSME / All Scheduled Commercial Banks',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
      });
    } else if (isDairy) {
      schemes.push({
        scheme_id: 'AHIDF_DAIRY_LOAN',
        scheme_name: isTa ? 'பால்பண்ணை உள்கட்டமைப்பு மேம்பாட்டு நிதி (AHIDF)' : 'Animal Husbandry & Dairy Infrastructure Fund (AHIDF)',
        category: 'business_linked',
        target_beneficiary_match: isTa ? 'பால் உற்பத்தி மற்றும் கால்நடை பராமரிப்பு தொழில்' : 'Dairy & Livestock Enterprise',
        illustrative_benefit: isTa ? '90% வங்கி கடன் மற்றும் 3% நேரடி வட்டி மானியம், 25% மூலதன மானியம்' : 'Up to 90% bank loan with 3% interest subvention and capital subsidy',
        indicative_interest_rate: '6.5% - 7.5% p.a.',
        participating_institutions: 'NABARD / District Cooperative Milk Union',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
      });
    } else {
      schemes.push({
        scheme_id: 'MUDRA_KISHORE_TARUN',
        scheme_name: isTa ? 'பிரதான் மந்திரி முத்ரா யோஜனா - கிஷோர்/தருண்' : 'Pradhan Mantri MUDRA Yojana - Kishore / Tarun',
        category: 'business_linked',
        target_beneficiary_match: isTa ? 'மளிகை, சில்லறை வணிகம் மற்றும் நுகர்வோர் கடைகள்' : 'Matching for Grocery, Retail Store & Commercial Trade',
        illustrative_benefit: isTa ? '₹50,000 முதல் ₹10,00,000 வரை பிணையில்லா மூலதன கடன் மற்றும் ரூபே கார்டு' : 'Collateral-free working capital loan up to ₹10 Lakh with RuPay business debit card',
        indicative_interest_rate: '8.5% - 9.5% p.a.',
        participating_institutions: 'All Public Sector Banks & Regional Rural Banks',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
      });
    }

    // 4. Central Capital Subsidy (PMEGP)
    schemes.push({
      scheme_id: 'PMEGP_RURAL_GRANT',
      scheme_name: isTa ? 'பிரதமரின் வேலைவாய்ப்பு உருவாக்கும் திட்டம் (PMEGP)' : 'Prime Minister Employment Generation Programme (PMEGP)',
      category: 'bank_specific',
      target_beneficiary_match: isTa ? 'கிராமப்புற சிறு தொழில் மற்றும் உற்பத்தி நிறுவனங்கள்' : 'Rural Micro-Enterprise & Service Units',
      illustrative_benefit: isTa ? 'கிராமப்புற சிறப்பு பிரிவினருக்கு 35% வரை திரும்ப செலுத்த வேண்டாத மூலதன மானியம்' : 'Up to 35% non-repayable margin money government subsidy in rural areas',
      indicative_interest_rate: 'Standard bank lending rate with back-ended subsidy',
      participating_institutions: 'KVIC / KVIB / District Industries Centre (DIC)',
      is_illustrative: true,
      mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
    });

    // 5. Gender / PwD Special Support
    if (isDisab) {
      schemes.push({
        scheme_id: 'NDFDC_SWAVALAMBAN',
        scheme_name: isTa ? 'திவ்யாங்ஜன் ஸ்வாவலம்பன் யோஜனா (மாற்றுத்திறனாளிகள்)' : 'Divyangjan Swavalamban Yojana (Illustrative)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'மாற்றுத்திறனாளி தொழில்முனைவோர்' : 'Persons with Benchmark Disabilities (PwD)',
        illustrative_benefit: isTa ? '₹5,00,000 வரை 5% சலுகைக் கடன் மற்றும் பெண்களுக்கு கூடுதல் 0.5% தள்ளுபடி' : '100% concessional credit up to ₹5,00,000 with 0.5% special rebate for women',
        indicative_interest_rate: '5.0% p.a.',
        participating_institutions: 'National Divyangjan Finance and Development Corporation (NDFDC)',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
      });
    } else if (isFemale) {
      schemes.push({
        scheme_id: 'MAHILA_SAMRIDDHI_SCHEME',
        scheme_name: isTa ? 'மகிளா சம்ரித்தி யோஜனா (மகளிர் சிறப்பு சலுகை கடன்)' : 'Mahila Samriddhi Yojana (Illustrative)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'மகளிர் தொழில்முனைவோர் மற்றும் மகளிர் சுயஉதவிக்குழுக்கள்' : 'Women Micro-Entrepreneurs & SHG Members',
        illustrative_benefit: isTa ? '₹1,40,000 வரை கடன், 1% கூடுதல் வட்டி தள்ளுபடி மற்றும் முன்னுரிமை ஒதுக்கீடு' : 'Up to ₹1,40,000 credit limit with special 1.0% interest rebate and priority SCA quota',
        indicative_interest_rate: '4.0% - 6.0% p.a.',
        participating_institutions: 'State Channelizing Agencies (TABCEDCO / TAHDCO) / RRBs',
        is_illustrative: true,
        mandatory_disclosure: isTa ? 'AI-உருவாக்கிய மாதிரி திட்டம் — சரிபார்க்கவும்' : 'AI-generated illustrative match — verify before applying'
      });
    }

    setResults({
      session_id: Date.now(),
      assessment_id: assessmentId || 101,
      is_illustrative: true,
      mandatory_global_disclosure: isTa 
        ? 'AI-உருவாக்கிய மாதிரி பரிந்துரைகள் — விண்ணப்பிக்கும் முன் அருகில் உள்ள அரசு முகமை அல்லது வங்கியில் உறுதிப்படுத்தவும்.'
        : 'AI-generated illustrative match — verify with your nearest SCA or bank before applying. These matches do NOT constitute statutory sanction.',
      household_strategy_insight: isTa
        ? (isFemale 
            ? `${applicantName} (பெண்) பெயரில் நிறுவனத்தைப் பதிவு செய்வதன் மூலம் கூடுதல் 1% வட்டி தள்ளுபடி மற்றும் PMEGP திட்டத்தில் 35% நேரடி மானிய முன்னுரிமை பெற முடியும்.`
            : `${applicantName} பெயரில் நிறுவனத்தை பதிவு செய்வதன் மூலம் உங்கள் ${socialCategory} சமூக பிரிவிற்கான நேரடி சலுகை வட்டி பொருந்தும். குடும்ப பெண் உறுப்பினர் பெயரில் அல்லது கூட்டாக பதிவு செய்தால் மகளிர் சம்ரித்தி கூடுதல் 1% வட்டி தள்ளுபடியும் கிடைக்கும்.`)
        : (isFemale
            ? `Registering the enterprise under ${applicantName} (Female) unlocks an additional 1.0% concessional interest rebate and higher rural subsidy priority under apex corporation schemes.`
            : `Registering the enterprise under ${applicantName} qualifies the business for direct statutory MoSJE schemes at concessional single-digit rates. If registered jointly with an eligible female family member, the enterprise also unlocks an additional 1.0% Mahila Samriddhi subvention and highest PMEGP grant margins.`),
      recommended_schemes: schemes
    });
  };

  const filteredSchemes = results?.recommended_schemes?.filter(s => {
    if (activeBucket === 'all') return true;
    return s.category === activeBucket;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Search for Concessional Schemes (Illustrative)
              </h2>
              <p className="text-[11px] text-slate-500">
                Progressive Household Questionnaire • Apex Corporations Alignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode: Questionnaire vs Results */}
        {!results ? (
          <div>
            {/* Step Progress Stepper */}
            <div className="py-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span className={step >= 1 ? 'text-blue-700' : ''}>1. Ownership</span>
                <span className={step >= 2 ? 'text-blue-700' : ''}>2. Demographics</span>
                <span className={step >= 3 ? 'text-blue-700' : ''}>3. Household History</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: Ownership */}
            {step === 1 && (
              <div className="space-y-4 py-2">
                <h3 className="text-sm font-bold text-slate-800">
                  Who will be the primary owner and operator of this business?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Me (Primary Applicant)",
                    "My Spouse",
                    "Joint / Family Enterprise",
                    "Not Decided Yet"
                  ].map((opt) => (
                    <label
                      key={opt}
                      onClick={() => setOwnership(opt)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                        ownership === opt
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xs">{opt}</span>
                      <input
                        type="radio"
                        name="ownership"
                        checked={ownership === opt}
                        onChange={() => setOwnership(opt)}
                        className="accent-blue-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Demographics (Pre-filled Seed Data from Assessment Step 3 + Fresh Income & Education) */}
            {step === 2 && (
              <div className="space-y-4 py-2 text-xs">
                {/* Pre-filled from Assessment Step 3 Verification Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-cyan-50/80 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                      <span className="text-xs font-black text-blue-950">Pre-filled from Assessment Step 3</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditPrefilled(!showEditPrefilled)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                    >
                      {showEditPrefilled ? 'Collapse' : 'Edit Seed Data'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-blue-200/80 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-semibold block">Age:</span>
                      <strong className="text-slate-900 text-xs">{age} Years</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Gender:</span>
                      <strong className="text-slate-900 text-xs">{gender}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Category:</span>
                      <strong className="text-slate-900 text-xs">{socialCategory}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Special Status:</span>
                      <strong className="text-slate-900 text-xs">
                        {disability ? 'PwD' : ''}{exServicemen ? (disability ? ' • Ex-Serv.' : 'Ex-Serv.') : (!disability ? 'General' : '')}
                      </strong>
                    </div>
                  </div>

                  {showEditPrefilled && (
                    <div className="mt-4 pt-3 border-t border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Age</label>
                        <input
                          type="number"
                          min="18"
                          max="75"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white font-semibold"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Category</label>
                        <select
                          value={socialCategory}
                          onChange={(e) => setSocialCategory(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white font-semibold"
                        >
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="Safai Karamchari">Safai Karamchari</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fresh Fields (Never collected in Step 3 - Asked Fresh in PRD-06) */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-1">
                    Fresh Questionnaire Details (MoSJE Scheme Criteria)
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">
                    These parameters determine exact apex corporation subsidy tiers and income eligibility cutoffs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Annual Household Income Band *
                    </label>
                    <select
                      value={incomeBand}
                      onChange={(e) => setIncomeBand(e.target.value)}
                      className="w-full p-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none bg-white font-semibold text-xs"
                    >
                      <option value="< ₹1.5 Lakh">&lt; ₹1.50 Lakh (BPL / Priority Tier)</option>
                      <option value="₹1.5L - ₹3.0L">₹1.50 Lakh - ₹3.00 Lakh (Double Poverty Line)</option>
                      <option value="₹3.0L - ₹6.0L">₹3.00 Lakh - ₹6.00 Lakh</option>
                      <option value="> ₹6.0L">&gt; ₹6.00 Lakh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Education Level *
                    </label>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none bg-white font-semibold text-xs"
                    >
                      <option value="No formal education">No formal education</option>
                      <option value="Primary">Primary (Up to 5th standard)</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Graduate">Graduate or Higher</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Household History */}
            {step === 3 && (
              <div className="space-y-4 py-2 text-xs">
                <h3 className="text-sm font-bold text-slate-800">
                  Household Business History & Prior Loans
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Does anyone in your family own an existing registered business?
                    </label>
                    <div className="flex gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setHasBusiness(true)}
                        className={`flex-1 py-2 rounded-xl border font-bold ${
                          hasBusiness ? 'bg-blue-50 border-blue-600 text-blue-800' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasBusiness(false)}
                        className={`flex-1 py-2 rounded-xl border font-bold ${
                          !hasBusiness ? 'bg-blue-50 border-blue-600 text-blue-800' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Prior Government Subsidy or Concessional Loan
                    </label>
                    <select
                      value={prevSubsidies}
                      onChange={(e) => setPrevSubsidies(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="None">None (First-time applicant)</option>
                      <option value="MUDRA">PM MUDRA Loan</option>
                      <option value="PMEGP">PMEGP Subsidy</option>
                      <option value="SCA Loan">State Corporation (SCA) Loan</option>
                      <option value="Other">Other Bank Loan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Co-Applicant Relationship</label>
                    <select
                      value={coApplicantRelation}
                      onChange={(e) => setCoApplicantRelation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="None">None (Individual application)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Co-Applicant Gender</label>
                    <select
                      value={coApplicantGender}
                      onChange={(e) => setCoApplicantGender(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Bottom Controls */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteSearch}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Find Illustrative Schemes</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* RESULTS VIEW */
          <div className="space-y-4 py-2">
            {/* Mandatory Non-Removable Global Amber Disclaimer Banner (FR-6.8) */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Demonstration & Advisory Notice:</strong>
                <p className="mt-0.5 leading-relaxed text-[11px] text-amber-800">
                  The schemes shown below are AI-generated illustrative recommendations based on typical government programs. VyapaarSathi does not connect to live scheme databases or guarantee loan approval. Always take this report to your local District Channelizing Agency or bank branch to verify current program availability and eligibility guidelines.
                </p>
              </div>
            </div>

            {/* Household Strategy Insight Ribbon (FR-6.5) */}
            {results.household_strategy_insight && (
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Family Strategy Recommendation: </span>
                  <span>{results.household_strategy_insight}</span>
                </div>
              </div>
            )}

            {/* Categorization Filter Chips (FR-6.7) */}
            <div className="flex gap-2 border-b border-slate-100 pb-2 text-xs">
              <button
                onClick={() => setActiveBucket('all')}
                className={`px-3 py-1 rounded-full font-bold transition ${
                  activeBucket === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Schemes ({results.recommended_schemes?.length || 0})
              </button>
              <button
                onClick={() => setActiveBucket('loan_type_specific')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  activeBucket === 'loan_type_specific' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Subsidy & Special Tiers
              </button>
              <button
                onClick={() => setActiveBucket('business_linked')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  activeBucket === 'business_linked' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Business-Linked
              </button>
              <button
                onClick={() => setActiveBucket('bank_specific')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  activeBucket === 'bank_specific' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Bank & SCA
              </button>
            </div>

            {/* Scheme Cards Stream */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {filteredSchemes.map((scheme, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{scheme.scheme_name}</h4>
                      <p className="text-[11px] text-blue-700 font-medium">{scheme.target_beneficiary_match}</p>
                    </div>

                    {/* Non-Removable Card Level Badge (FR-6.9) */}
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Illustrative Match
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {scheme.illustrative_benefit}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Rate: <strong className="text-emerald-700">{scheme.indicative_interest_rate}</strong></span>
                    <span>Channel: <strong className="text-slate-700">{scheme.participating_institutions}</strong></span>
                  </div>

                  <div className="text-[9px] text-slate-400 italic">
                    * {scheme.mandatory_disclosure}
                  </div>
                </div>
              ))}
            </div>

            {/* Results Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setResults(null);
                  setStep(1);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                ← Modify Answers & Re-run
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                Close & Return to Dossier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
