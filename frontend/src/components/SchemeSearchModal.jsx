import React, { useState } from 'react';
import { 
  Sparkles, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, 
  Building2, Landmark, CreditCard, ShoppingBag, ShieldAlert, RefreshCw, X, Info, FileText
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
    // 1. Domicile & Demographic Targeted Master Schemes (Tamil Nadu Grounded)
    if (cat === 'sc') {
      schemes.push({
        scheme_id: 'TN-004',
        scheme_name: isTa ? 'AABCS – அண்ணல் அம்பேத்கர் தொழில் முன்னோடிகள் திட்டம்' : 'AABCS – Annal Ambedkar Business Champions Scheme (Official TN-004)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? '100% பட்டியலின (SC/ST) தொழில்முனைவோருக்கான நேரடி தகுதி' : '100% SC/ST owned enterprise demographic in Tamil Nadu',
        illustrative_benefit: isTa ? '35% நேரடி மூலதன மானியம் (அதிகபட்சம் ₹1.50 கோடி) + 6% அரசு வட்டி மானியம் (Interest Subvention)' : '35% capital subsidy up to ₹1.50 Crore + 6% interest subvention for machinery loan up to 10 years',
        indicative_interest_rate: isTa ? 'வங்கி விகிதத்தில் 6% அரசு வட்டி மானியம்' : 'Bank rate with 6% interest subvention',
        participating_institutions: 'District Industries Centre (DIC) / District Level Committee',
        official_url: 'https://msmeonline.tn.gov.in/aabcs/',
        application_channel: 'Online AABCS portal / DIC',
        subsidy_percentage: '35% (Max ₹1.50 Crore)',
        max_loan_amount: '65% Bank Finance',
        own_contribution: '5% - 10%',
        tenure: 'Up to 10 years',
        required_documents: 'Aadhaar / KYC; SC/ST Community Certificate; Detailed Project Report (DPR); Machinery Quotations; Bank Account Proof',
        is_illustrative: false,
        mandatory_disclosure: 'Official Tamil Nadu Government Scheme — Apply via msmeonline.tn.gov.in/aabcs/'
      });

      schemes.push({
        scheme_id: 'CEN-001',
        scheme_name: isTa ? 'நுண்கடன் திட்டம் (MFS) – NSFDC / தாட்கோ' : 'Micro Finance Scheme (MFS) – NSFDC (Official CEN-001)',
        category: 'bank_specific',
        target_beneficiary_match: isTa ? 'SC சிறு தொழில்முனைவோர் (ஆண்டு வருமானம் <= ₹5 லட்சம்)' : 'SC individuals with annual family income <= ₹5 Lakh',
        illustrative_benefit: isTa ? 'திட்ட மதிப்பீடு ₹1.40 லட்சம் வரை, 90% கடன் பங்கு (அதிகபட்சம் ₹1.25 லட்சம்), 6.5% சலுகை வட்டி' : 'Project cost up to ₹1.40 Lakh, 90% loan up to ₹1.25 Lakh, at 6.5% concessional interest rate',
        indicative_interest_rate: '6.5% p.a. (Fixed)',
        participating_institutions: 'TAHDCO / PM-SURAJ / Authorised SCAs',
        official_url: 'https://nsfdc.nic.in/',
        application_channel: 'PM-SURAJ / TAHDCO',
        subsidy_percentage: '90% Concessional Credit',
        max_loan_amount: '₹1.25 Lakh',
        own_contribution: 'Up to 10%',
        tenure: 'Up to 3 years (3-month moratorium)',
        required_documents: 'Aadhaar / KYC; SC Caste Certificate; Family Income Proof (<= ₹5 Lakh); Micro Business Estimate; Bank Passbook',
        is_illustrative: false,
        mandatory_disclosure: 'Official Central Scheme under MoSJE — Apply via PM-SURAJ portal'
      });

      schemes.push({
        scheme_id: 'CEN-007',
        scheme_name: isTa ? 'ஸ்டாண்ட்-அப் இந்தியா திட்டம் (Stand-Up India)' : 'Stand-Up India Scheme (Official CEN-007)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'பட்டியலின (SC/ST) மற்றும் மகளிர் தொழில்முனைவோர்' : 'SC/ST and Women entrepreneurs (greenfield unit)',
        illustrative_benefit: isTa ? '₹10 லட்சம் முதல் ₹1 கோடி வரை பசுமை தொழில் கடன், 15% சொந்த முதலீடு' : 'Composite loan between ₹10 Lakh and ₹1 Crore with credit guarantee',
        indicative_interest_rate: 'MCLR + 3% + Tenor Premium',
        participating_institutions: 'Scheduled Commercial Banks / Stand-Up Mitra',
        official_url: 'https://www.standupmitra.in/',
        application_channel: 'Stand-Up Mitra Portal / Banks',
        max_loan_amount: '₹1.00 Crore',
        own_contribution: '15%',
        tenure: 'Up to 7 years',
        required_documents: 'Aadhaar & PAN Card; SC/ST / Women Ownership Proof (51%+); Greenfield DPR; Machinery Quotations; Bank Account Details',
        is_illustrative: false,
        mandatory_disclosure: 'Official Central Scheme — Apply via standupmitra.in'
      });
    } else if (isFemale) {
      schemes.push({
        scheme_id: 'TN-003',
        scheme_name: isTa ? 'TWEES – தமிழ்நாடு மகளிர் தொழில்முனைவோர் மேம்பாட்டு திட்டம்' : 'TWEES – Tamil Nadu Women Entrepreneurs Empowerment Scheme (Official TN-003)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'தமிழ்நாடு பெண் தொழில்முனைவோர்' : 'Women entrepreneurs with Tamil Nadu domicile',
        illustrative_benefit: isTa ? '95% வங்கி கடன், வெறும் 5% சொந்த முதலீடு, 25% மூலதன மானியம் (அதிகபட்சம் ₹2.00 லட்சம்), பிணையில்லா கடன்' : '95% bank loan with only 5% promoter margin, 25% capital subsidy up to ₹2.00 Lakh, collateral-free',
        indicative_interest_rate: 'Bank lending rate',
        participating_institutions: 'District Industries Centre (DIC) / Commercial Banks',
        official_url: 'https://msmeonline.tn.gov.in/twees/',
        application_channel: 'Online TWEES portal / DIC / Banks',
        subsidy_percentage: '25% (Max ₹2.00 Lakh)',
        max_loan_amount: '95% of project cost (Project up to ₹10 Lakh)',
        own_contribution: '5% Promoter Contribution',
        tenure: 'As per bank',
        required_documents: 'Aadhaar / KYC; TN Residence Proof; Business Project Report (DPR); Machinery Invoices; Bank Account Passbook',
        is_illustrative: false,
        mandatory_disclosure: 'Official Tamil Nadu Government Scheme for Women — Apply via msmeonline.tn.gov.in/twees/'
      });

      schemes.push({
        scheme_id: 'TN-001',
        scheme_name: isTa ? 'NEEDS – புதிய தொழில்முனைவோர் மேம்பாட்டு திட்டம்' : 'NEEDS – New Entrepreneur-cum-Enterprise Development Scheme (Official TN-001)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'பெண் தொழில்முனைவோருக்கான சிறப்பு சலுகை (5% முதலீடு, 55 வயது வரை)' : 'Women entrepreneurs (5% promoter margin, age up to 55)',
        illustrative_benefit: isTa ? '25% மூலதன மானியம் (அதிகபட்சம் ₹75 லட்சம்) + 3% வட்டி மானியம்' : '25% capital subsidy up to ₹75 Lakh + 3% interest subvention',
        indicative_interest_rate: 'Bank rate with 3% Government interest subvention',
        participating_institutions: 'TIIC / Commercial Banks / DIC',
        official_url: 'https://msmeonline.tn.gov.in/needs/',
        application_channel: 'Online NEEDS portal / TIIC / DIC',
        subsidy_percentage: '25% (Max ₹75 Lakh)',
        max_loan_amount: 'Project cost up to ₹5 Crore',
        own_contribution: '5% (Special Category)',
        tenure: 'As per bank / TIIC',
        required_documents: 'Aadhaar / KYC; Degree / Diploma Certificate; First-Gen Certificate; DPR; Machinery Quotations; Bank Documents',
        is_illustrative: false,
        mandatory_disclosure: 'Official Tamil Nadu Government Scheme — Apply via msmeonline.tn.gov.in/needs/'
      });
    } else {
      schemes.push({
        scheme_id: 'TN-001',
        scheme_name: isTa ? 'NEEDS – புதிய தொழில்முனைவோர் மேம்பாட்டு திட்டம்' : 'NEEDS – New Entrepreneur-cum-Enterprise Development Scheme (Official TN-001)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'முதல் தலைமுறை தொழில்முனைவோர் (21-45 வயது, உற்பத்தி மற்றும் சேவை)' : 'First-generation entrepreneurs (Age 21-45, manufacturing & services)',
        illustrative_benefit: isTa ? '₹10 லட்சம் முதல் ₹5 கோடி திட்டங்களுக்கு 25% மூலதன மானியம் (அதிகபட்சம் ₹75 லட்சம்) + 3% வட்டி மானியம்' : '25% capital subsidy up to ₹75 Lakh + 3% interest subvention for projects between ₹10 Lakh and ₹5 Crore',
        indicative_interest_rate: 'Bank lending rate with 3% Government interest subvention',
        participating_institutions: 'TIIC / Commercial Banks / DIC',
        official_url: 'https://msmeonline.tn.gov.in/needs/',
        application_channel: 'Online NEEDS portal / TIIC / Commercial Banks / DIC',
        subsidy_percentage: '25% (Max ₹75 Lakh)',
        max_loan_amount: 'Project cost up to ₹5 Crore',
        own_contribution: '10% General / 5% Special',
        tenure: 'As per bank / TIIC',
        required_documents: 'Aadhaar / KYC; Degree / Diploma Certificate; First-Gen Certificate; Detailed Project Report (DPR); Machinery Quotations',
        is_illustrative: false,
        mandatory_disclosure: 'Official Tamil Nadu Government Scheme — Apply via msmeonline.tn.gov.in/needs/'
      });

      schemes.push({
        scheme_id: 'TN-002',
        scheme_name: isTa ? 'UYEGP – இளைஞர் வேலைவாய்ப்பு உருவாக்கும் திட்டம்' : 'UYEGP – Unemployed Youth Employment Generation Programme (Official TN-002)',
        category: 'bank_specific',
        target_beneficiary_match: isTa ? 'சுயதொழில் இளைஞர்கள் (18-45 வயது, வர்த்தகம்/வணிக திட்டங்கள்)' : 'Self-employment youth in Tamil Nadu for trading/business projects up to ₹15 Lakh',
        illustrative_benefit: isTa ? '₹15 லட்சம் வரை திட்ட மதிப்பீடு, 25% மூலதன மானியம் (அதிகபட்சம் ₹3.75 லட்சம்), 90-95% வங்கி கடன்' : '25% capital subsidy up to ₹3.75 Lakh with 90-95% bank finance for projects up to ₹15 Lakh',
        indicative_interest_rate: 'Bank lending rate',
        participating_institutions: 'District Industries Centre (DIC) / Commercial Banks',
        official_url: 'https://msmeonline.tn.gov.in/uyegp/',
        application_channel: 'Online UYEGP portal / DIC',
        subsidy_percentage: '25% (Max ₹3.75 Lakh)',
        max_loan_amount: '90% - 95% of project cost (Max ₹15 Lakh)',
        own_contribution: '10% General / 5% Special',
        tenure: 'As per bank',
        required_documents: 'Aadhaar / KYC; 8th Pass Transfer Certificate; Community Certificate; Project Quotation; Bank Documents',
        is_illustrative: false,
        mandatory_disclosure: 'Official Tamil Nadu Government Scheme — Apply via msmeonline.tn.gov.in/uyegp/'
      });
    }

    // 2. Business Trade-Specific Scheme
    const isArtisan = bizCat.includes('wood') || bizCat.includes('craft') || bizCat.includes('tailor') || bizCat.includes('barber') || bizCat.includes('carpenter') || bizCat.includes('mason');
    const isVending = bizCat.includes('vending') || bizCat.includes('street') || bizCat.includes('pushcart');

    if (isArtisan) {
      schemes.push({
        scheme_id: 'TN-005',
        scheme_name: isTa ? 'கலைஞர் கைவினைத் திட்டம் (KKT) – தமிழ்நாடு அரசு' : 'Kalaignar Kaivinai Thittam (KKT Official TN-005)',
        category: 'business_linked',
        target_beneficiary_match: isTa ? 'பாரம்பரிய கைவினைஞர்கள் மற்றும் கைவினை கலைஞர்கள்' : 'Traditional artisans and craftsmen in Tamil Nadu',
        illustrative_benefit: isTa ? '25% நேரடி அரசு மூலதன மானியம் மற்றும் கடன் இணைப்பு உதவி' : 'Credit-linked term loan with 25% capital subsidy for artisan self-employment',
        indicative_interest_rate: 'Subsidized cooperative/bank rate',
        participating_institutions: 'DIC / Tamil Nadu Handicrafts Development',
        official_url: 'https://www.tn.gov.in/',
        application_channel: 'District Industries Centre (DIC)',
        subsidy_percentage: '25% Capital Subsidy',
        max_loan_amount: 'Trade-based credit linkage',
        own_contribution: '5% - 10%',
        tenure: '3 to 5 years',
        required_documents: 'Aadhaar; Artisan Welfare Board Registration Card; Trade Experience Proof; DPR; Bank Passbook',
        is_illustrative: false,
        mandatory_disclosure: 'Official Tamil Nadu Artisan Scheme — Apply via DIC'
      });
    } else if (isVending) {
      schemes.push({
        scheme_id: 'CEN-011',
        scheme_name: isTa ? 'பிரதமர் ஸ்வாநிதி திட்டம் (PM SVANidhi)' : 'PM SVANidhi – Street Vendor AtmaNirbhar Nidhi (Official CEN-011)',
        category: 'business_linked',
        target_beneficiary_match: isTa ? 'தெருவோர வியாபாரிகள் மற்றும் தள்ளுவண்டி சிறு வணிகர்கள்' : 'Street vendors in urban and peri-urban rural growth centres',
        illustrative_benefit: isTa ? '₹15,000 / ₹25,000 / ₹50,000 பிணையில்லா நடைமுறை மூலதனம், 7% வட்டி மானியம், டிஜிட்டல் கேஷ்பேக்' : 'Collateral-free working capital (₹15k, ₹25k, ₹50k) with 7% interest subsidy & UPI cashback',
        indicative_interest_rate: 'Market rate with 7% direct interest subsidy',
        participating_institutions: 'Urban Local Bodies / Commercial Banks',
        official_url: 'https://pmsvanidhi.mohua.gov.in/',
        application_channel: 'PM SVANidhi portal / ULBs / Banks',
        subsidy_percentage: '7% Interest Subsidy',
        max_loan_amount: '₹15,000 (1st) / ₹25,000 (2nd) / ₹50,000 (3rd)',
        own_contribution: '0% (Nil)',
        tenure: '12 to 36 months',
        required_documents: 'Aadhaar; Vending Certificate / LOR / Survey ID; Bank Account Details; Aadhaar-linked Mobile',
        is_illustrative: false,
        mandatory_disclosure: 'Official Central Scheme — Apply via pmsvanidhi.mohua.gov.in'
      });
    } else {
      schemes.push({
        scheme_id: 'CEN-004',
        scheme_name: isTa ? 'பிரதமர் முத்ரா யோஜனா (PMMY) – கிஷோர் & தருண்' : 'Pradhan Mantri MUDRA Yojana (PMMY Official CEN-004)',
        category: 'business_linked',
        target_beneficiary_match: isTa ? 'சில்லறை வர்த்தகம், மளிகை, பல்பொருள் அங்காடி மற்றும் சிறு சேவை நிறுவனங்கள்' : 'Grocery, provisions, retail trade, and service units',
        illustrative_benefit: isTa ? '₹50,000 முதல் ₹10 லட்சம் வரை (தருண் பிளஸ் ₹20 லட்சம் வரை) பிணையில்லா கடன் மற்றும் RuPay வணிக கார்டு' : 'Collateral-free credit up to ₹10 Lakh with RuPay business card',
        indicative_interest_rate: '8.5% - 9.5% p.a.',
        participating_institutions: 'All Commercial Banks / Regional Rural Banks',
        official_url: 'https://www.mudra.org.in/',
        application_channel: 'Mudra Portal / Udyamimitra / All Bank Branches',
        subsidy_percentage: 'Credit Guarantee (CGFMU)',
        max_loan_amount: 'Up to ₹10 Lakh (Tarun) / ₹20 Lakh (Tarun Plus)',
        own_contribution: '0% (Shishu/Kishore) / up to 15% (Tarun)',
        tenure: 'Up to 5 years',
        required_documents: 'Aadhaar & PAN Card; Business Proof / Udyam; Passport Size Photos; Quotation for Machinery / Stock; 6 Months Bank Statement',
        is_illustrative: false,
        mandatory_disclosure: 'Official Central MSME Scheme — Apply at any commercial bank'
      });
    }

    // 3. Central Capital Grant: CEN-005 PMEGP
    schemes.push({
      scheme_id: 'CEN-005',
      scheme_name: isTa ? 'பிரதமரின் வேலைவாய்ப்பு உருவாக்கும் திட்டம் (PMEGP)' : 'Prime Minister Employment Generation Programme (PMEGP Official CEN-005)',
      category: 'bank_specific',
      target_beneficiary_match: isTa ? 'கிராமப்புற சிறு உற்பத்தி மற்றும் சேவை தொழில்முனைவோர்' : 'Rural micro-enterprises in manufacturing & services',
      illustrative_benefit: isTa ? 'கிராமப்புற சிறப்பு பிரிவினருக்கு 35% வரை திரும்ப செலுத்த வேண்டாத மூலதன மானியம், 5% சொந்த முதலீடு' : 'Up to 35% rural margin money subsidy for special category with only 5% promoter margin',
      indicative_interest_rate: isTa ? 'வங்கி வட்டி விகிதத்தில் 35% நேரடி மூலதன மானியம்' : 'Normal bank rate with 35% back-ended capital grant',
      participating_institutions: 'KVIC / KVIB / District Industries Centre (DIC)',
      official_url: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
      application_channel: 'Online PMEGP e-Portal / KVIC / DIC',
      subsidy_percentage: '35% Rural Special / 25% Urban Special',
      max_loan_amount: 'Up to ₹50 Lakh (Mfg) / ₹20 Lakh (Services)',
      own_contribution: '5% (Special) / 10% (General)',
      tenure: '3 to 7 years',
      required_documents: 'Aadhaar & PAN Card; Passport Size Photos; Detailed Project Report (DPR); Special Category / Caste Certificate; Bank Account Details',
      is_illustrative: false,
      mandatory_disclosure: 'Official Central Scheme — Apply via kviconline.gov.in'
    });

    // 4. Gender / PwD Special Support
    if (isDisab) {
      schemes.push({
        scheme_id: 'NDFDC-001',
        scheme_name: isTa ? 'திவ்யாங்ஜன் ஸ்வாவலம்பன் யோஜனா (மாற்றுத்திறனாளிகள்)' : 'Divyangjan Swavalamban Yojana – NDFDC (Official)',
        category: 'loan_type_specific',
        target_beneficiary_match: isTa ? 'மாற்றுத்திறனாளி தொழில்முனைவோர் (40%+ சான்று)' : 'Persons with Benchmark Disabilities (PwD 40%+)',
        illustrative_benefit: isTa ? '₹5,00,000 வரை 5% சலுகைக் கடன் மற்றும் பெண்களுக்கு கூடுதல் 0.5% தள்ளுபடி' : '100% concessional credit up to ₹5,00,000 with 0.5% special rebate for women',
        indicative_interest_rate: '5.0% p.a.',
        participating_institutions: 'National Divyangjan Finance and Development Corporation (NDFDC)',
        official_url: 'https://nhfdc.nic.in/',
        application_channel: 'NDFDC / SCAs',
        subsidy_percentage: 'Interest concession down to 5.0% p.a.',
        max_loan_amount: 'Up to ₹5.00 Lakh',
        own_contribution: 'Nil up to ₹50,000 / 5% above',
        tenure: 'Up to 7 years',
        is_illustrative: false,
        mandatory_disclosure: 'Official MoSJE Concessional Credit Scheme for PwD'
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
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition space-y-2 text-xs shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{scheme.scheme_name}</h4>
                        {scheme.scheme_id && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                            {scheme.scheme_id}
                          </span>
                        )}
                        {scheme.subsidy_percentage && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {scheme.subsidy_percentage}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-700 font-medium mt-0.5">{scheme.target_beneficiary_match}</p>
                    </div>

                    {scheme.is_illustrative ? (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Illustrative Match
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Official Scheme
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {scheme.illustrative_benefit}
                  </p>

                  {/* Metadata Chips: Loan amount, margin, tenure, moratorium */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {scheme.max_loan_amount && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        Loan: <strong>{scheme.max_loan_amount}</strong>
                      </span>
                    )}
                    {scheme.own_contribution && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        Margin: <strong>{scheme.own_contribution}</strong>
                      </span>
                    )}
                    {scheme.tenure && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        Tenure: <strong>{scheme.tenure}</strong>
                      </span>
                    )}
                    {scheme.moratorium && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        Moratorium: <strong>{scheme.moratorium}</strong>
                      </span>
                    )}
                  </div>

                  {/* Required Documents Section */}
                  {scheme.required_documents && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Required Documents (தேவையான ஆவணங்கள்):</span>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {scheme.required_documents.split(';').map((doc, dIdx) => (
                          <span key={dIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1">
                            <span className="text-emerald-600 font-bold">✓</span> {doc.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Rate: <strong className="text-emerald-700">{scheme.indicative_interest_rate}</strong></span>
                    <span className="truncate max-w-[220px]" title={scheme.application_channel || scheme.participating_institutions}>
                      Channel: <strong className="text-slate-700">{scheme.application_channel || scheme.participating_institutions}</strong>
                    </span>
                    {scheme.official_url && (
                      <a 
                        href={scheme.official_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition shrink-0"
                      >
                        Official Portal ↗
                      </a>
                    )}
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
