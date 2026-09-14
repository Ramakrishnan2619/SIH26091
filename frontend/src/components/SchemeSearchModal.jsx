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

    const schemes = [];

    // Archetype 1: Women / SC apex scheme
    if (isFemale || cat === 'sc') {
      schemes.push({
        scheme_id: 'NSFDC_MAHILA_SAMRIDDHI',
        scheme_name: 'NSFDC Mahila Samriddhi Yojana (Illustrative)',
        category: 'loan_type_specific',
        target_beneficiary_match: `Recommended for ${gender} ${socialCategory} entrepreneur`,
        illustrative_benefit: 'Up to ₹1,40,000 credit limit with special 1.5% interest subvention for rural women SHG members',
        indicative_interest_rate: '4.0% - 6.5% p.a. concessional',
        participating_institutions: 'State Channelizing Agencies (SCAs) / NSFDC / Regional Rural Banks',
        is_illustrative: true,
        mandatory_disclosure: 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    }

    // Archetype 2: Business-linked
    if (bizCat.includes('dairy') || bizCat.includes('milk') || bizCat.includes('cattle')) {
      schemes.push({
        scheme_id: 'MICRO_WOMEN_DAIRY',
        scheme_name: 'Women Rural Dairy Cooperative Scheme (Illustrative)',
        category: 'business_linked',
        target_beneficiary_match: 'Specific matching for Dairy & Milk Production enterprise',
        illustrative_benefit: 'Working capital and milch cattle financing with milk collection tie-up and 25% back-ended capital subsidy',
        indicative_interest_rate: '5.0% - 6.5% p.a.',
        participating_institutions: 'District Cooperative Milk Producers Union / NABARD',
        is_illustrative: true,
        mandatory_disclosure: 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    } else {
      schemes.push({
        scheme_id: 'MUDRA_SHISHU_RETAIL',
        scheme_name: 'Pradhan Mantri MUDRA Yojana - Shishu (Illustrative)',
        category: 'business_linked',
        target_beneficiary_match: 'Matching for Grocery, Provisions, and Micro Retail Trade',
        illustrative_benefit: 'Collateral-free working capital loan up to ₹50,000 with RuPay business debit card',
        indicative_interest_rate: '7.5% - 9.0% p.a.',
        participating_institutions: 'All Public Sector Banks & Regional Rural Banks',
        is_illustrative: true,
        mandatory_disclosure: 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    }

    // Archetype 3: Apex corp term loan — category-specific
    if (cat === 'obc') {
      schemes.push({
        scheme_id: 'NBCFDC_GENERAL_TERM_LOAN',
        scheme_name: 'NBCFDC General Term Loan Scheme (Illustrative)',
        category: 'bank_specific',
        target_beneficiary_match: 'Other Backward Classes (OBC) target demographic',
        illustrative_benefit: '90% concessional credit up to ₹50 Lakh with 84-month repayment tenure and 6-month moratorium',
        indicative_interest_rate: '8.0% p.a. (reducing balance)',
        participating_institutions: 'State Backward Classes Economic Development Corporation',
        is_illustrative: true,
        mandatory_disclosure: 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    } else if (cat === 'safai karamchari') {
      schemes.push({
        scheme_id: 'NSKFDC_SWACCHTA_UDYAMI',
        scheme_name: 'NSKFDC Swacchta Udyami Yojana (Illustrative)',
        category: 'bank_specific',
        target_beneficiary_match: 'Safai Karamchari & Sanitation Workers Community',
        illustrative_benefit: 'Capital subsidy up to ₹3,25,000 with 4.0% concessional interest rate',
        indicative_interest_rate: '4.0% - 6.0% p.a.',
        participating_institutions: 'National Safai Karamcharis Finance & Development Corporation',
        is_illustrative: true,
        mandatory_disclosure: 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    } else {
      schemes.push({
        scheme_id: 'PMEGP_RURAL_ARTISAN',
        scheme_name: 'Prime Minister Employment Generation Programme (PMEGP)',
        category: 'bank_specific',
        target_beneficiary_match: 'Rural Micro-Enterprise & Service Units',
        illustrative_benefit: 'Up to 35% margin money government subsidy in rural areas for special category beneficiaries',
        indicative_interest_rate: 'Standard bank lending rate with back-ended subsidy',
        participating_institutions: 'KVIC / KVIB / District Industries Centre (DIC)',
        is_illustrative: true,
        mandatory_disclosure: 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    }

    // Archetype 4: PwD or Stand-Up India for women
    if (isDisab) {
      schemes.push({
        scheme_id: 'NHFDC_DIVYANGJAN_SWAVALAMBAN',
        scheme_name: 'Divyangjan Swavalamban Yojana (Illustrative)',
        category: 'bank_specific',
        target_beneficiary_match: 'Persons with Benchmark Disabilities (PwD)',
        illustrative_benefit: '100% concessional credit up to ₹5,00,000 with 0.5% special rebate for women',
        indicative_interest_rate: '5.0% p.a.',
        participating_institutions: 'National Handicapped Finance and Development Corporation (NHFDC)',
        is_illustrative: true,
        mandatory_disclosure: 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    } else if (isFemale) {
      schemes.push({
        scheme_id: 'STANDUP_INDIA_SC_WOMEN',
        scheme_name: 'Stand-Up India Scheme (Illustrative)',
        category: 'loan_type_specific',
        target_beneficiary_match: 'Women & SC/ST Greenfield Enterprise Promotion',
        illustrative_benefit: 'Composite term and working capital finance from ₹10 Lakh to ₹1 Crore',
        indicative_interest_rate: 'MCLR + 3% concessional ceiling',
        participating_institutions: 'All Scheduled Commercial Bank branches (2 loans mandated per branch)',
        is_illustrative: true,
        mandatory_disclosure: 'AI-generated illustrative match — verify with your nearest SCA/bank before applying'
      });
    }

    setResults({
      session_id: 801,
      assessment_id: assessmentId || 101,
      is_illustrative: true,
      mandatory_global_disclosure: 'AI-generated illustrative match — verify with your nearest SCA or bank before applying. These matches do NOT constitute statutory sanction.',
      household_strategy_insight: isFemale
        ? `Registering the enterprise under ${applicantName} (Female) unlocks an additional 0.5% to 1.5% concessional interest rebate and higher rural subsidy priority under apex corporation schemes.`
        : `Registering the enterprise under ${applicantName} positions the business for targeted concessional schemes. If registered jointly with an eligible female family member, the enterprise may also qualify for enhanced Mahila Samriddhi subvention and higher subsidy margins.`,
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
