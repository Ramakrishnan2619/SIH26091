import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Coins, User, Search, Crosshair, 
  ArrowRight, ArrowLeft, Sparkles, AlertCircle, CheckCircle2, 
  ChevronRight, Compass, ShieldCheck, Layers, Info
} from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { StepBadge } from './common/StepBadge';
import { GoogleMapView } from './common/GoogleMapView';

const CATEGORIES = [
  "Grocery & Daily Provisions",
  "Handicrafts & Handloom",
  "Poultry & Livestock",
  "Metalwork & Carpentry",
  "Food Processing & Snacks",
  "Apparel & Tailoring",
  "Repairs & Services",
  "Dairy & Milk Production"
];

const CATEGORY_NAMES = {
  ta: {
    "Grocery & Daily Provisions": "மளிகை மற்றும் அன்றாடப் பொருட்கள் கடை",
    "Handicrafts & Handloom": "கைவினைப் பொருட்கள் மற்றும் கைத்தறி",
    "Poultry & Livestock": "கோழிப்பண்ணை மற்றும் கால்நடை வளர்ப்பு",
    "Metalwork & Carpentry": "உலோக வேலை மற்றும் தச்சு வேலை",
    "Food Processing & Snacks": "உணவு பதப்படுத்துதல் மற்றும் தின்பண்டங்கள்",
    "Apparel & Tailoring": "ஆடை வடிவமைப்பு மற்றும் தையல் கடை",
    "Repairs & Services": "பழுதுபார்ப்பு மற்றும் சேவை மையம்",
    "Dairy & Milk Production": "பால் பண்ணை மற்றும் பால் உற்பத்தி"
  },
  hi: {
    "Grocery & Daily Provisions": "किराना एवं दैनिक उपभोग की दुकान",
    "Handicrafts & Handloom": "हस्तशिल्प एवं हथकरघा",
    "Poultry & Livestock": "मुर्गी पालन एवं पशुपालन",
    "Metalwork & Carpentry": "धातु कार्य एवं बढ़ईगीरी",
    "Food Processing & Snacks": "खाद्य प्रसंस्करण एवं नमकीन",
    "Apparel & Tailoring": "परिधान एवं सिलाई कार्य",
    "Repairs & Services": "मरम्मत एवं सेवा केंद्र",
    "Dairy & Milk Production": "डेयरी एवं दुग्ध उत्पादन"
  },
  te: {
    "Grocery & Daily Provisions": "కిరాణా మరియు నిత్యావసర సరుకుల దుకాణం",
    "Handicrafts & Handloom": "చేతివృత్తులు మరియు చేనేత",
    "Poultry & Livestock": "కోళ్ళ పెంపకం మరియు పశుసంవర్ధకం",
    "Metalwork & Carpentry": "మెటల్ వర్క్ మరియు వడ్రంగి పని",
    "Food Processing & Snacks": "ఆహార ప్రాసెసింగ్ మరియు స్నాక్స్",
    "Apparel & Tailoring": "దుస్తులు మరియు టైలరింగ్",
    "Repairs & Services": "రిపేర్లు మరియు సేవా కేంద్రం",
    "Dairy & Milk Production": "డైరీ మరియు పాల ఉత్పత్తి"
  }
};

const TN_DISTRICT_COORDS = {
  'chennai': [13.0827, 80.2707],
  'coimbatore': [11.0168, 76.9558],
  'madurai': [9.9252, 78.1198],
  'tiruchirappalli': [10.7905, 78.7047],
  'trichy': [10.7905, 78.7047],
  'salem': [11.6643, 78.1460],
  'tirunelveli': [8.7139, 77.7567],
  'tiruppur': [11.1085, 77.3411],
  'erode': [11.3410, 77.7172],
  'vellore': [12.9165, 79.1325],
  'thanjavur': [10.7870, 79.1378],
  'dindigul': [10.3673, 77.9803],
  'kancheepuram': [12.8342, 79.7036],
  'kanchipuram': [12.8342, 79.7036],
  'tiruvallur': [13.1432, 79.9079],
  'thiruvallur': [13.1432, 79.9079],
  'cuddalore': [11.7480, 79.7714],
  'kanyakumari': [8.0883, 77.5385],
  'kanniyakumari': [8.0883, 77.5385],
  'thoothukkudi': [8.7642, 78.1348],
  'tuticorin': [8.7642, 78.1348],
  'virudhunagar': [9.5680, 77.9624],
  'sivaganga': [9.8433, 78.4809],
  'sivagangai': [9.8433, 78.4809],
  'ramanathapuram': [9.3639, 78.8395],
  'pudukkottai': [10.3833, 78.8001],
  'theni': [10.0104, 77.4768],
  'karur': [10.9601, 78.0766],
  'namakkal': [11.2189, 78.1674],
  'dharmapuri': [12.1211, 78.1582],
  'krishnagiri': [12.5186, 78.2138],
  'tiruvannamalai': [12.2253, 79.0747],
  'viluppuram': [11.9401, 79.4861],
  'villupuram': [11.9401, 79.4861],
  'kallakurichi': [11.7384, 78.9639],
  'ranipet': [12.9272, 79.3330],
  'tirupathur': [12.4925, 78.5678],
  'chengalpattu': [12.6819, 79.9836],
  'tenkasi': [8.9594, 77.3152],
  'mayiladuthurai': [11.1075, 79.6524],
  'thiruvarur': [10.7725, 79.6365],
  'tiruvarur': [10.7725, 79.6365],
  'nagapattinam': [10.7672, 79.8449],
  'perambalur': [11.2342, 78.8807],
  'ariyalur': [11.1401, 79.0786],
  'the nilgiris': [11.4102, 76.6950],
  'nilgiris': [11.4102, 76.6950]
};

function getDistrictCoords(districtName) {
  if (!districtName) return [10.0524, 78.3344];
  const clean = districtName.trim().toLowerCase();
  for (const [k, v] of Object.entries(TN_DISTRICT_COORDS)) {
    if (clean.includes(k) || k.includes(clean)) return v;
  }
  return [10.0524, 78.3344];
}

const STORAGE_KEY = 'vyapaarsathi_assess_draft_v2';

export function AssessmentForm({ onSubmit, onCancel, defaultUser, selectedLang = 'en' }) {
  const t = getTranslation(selectedLang);

  // Restore saved draft state from sessionStorage
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialName = defaultUser?.name || '';
    const isMaleName = /ramakrishnan|kumar|ramanathan|murugan|selvam|suresh|rajesh|mohamed/i.test(initialName);
    const isFemaleName = /meena|lakshmi|devi|priya|anita|radha|kumari/i.test(initialName);
    const initialGender = isMaleName ? 'Male' : isFemaleName ? 'Female' : 'Male';

    return {
      currentStep: 1,
      ownerName: initialName,
      marginCapital: 100000,
      businessCategory: CATEGORIES[0],
      businessIdeaDescription: '',
      selectedVillage: null,
      age: 30,
      socialCategory: 'OBC',
      gender: initialGender,
      disabilityStatus: false,
      exServicemenStatus: false
    };
  });

  const {
    currentStep,
    ownerName,
    marginCapital,
    businessCategory,
    businessIdeaDescription,
    selectedVillage,
    age,
    socialCategory,
    gender,
    disabilityStatus,
    exServicemenStatus
  } = formData;

  // Persist each state change to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {}
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Location search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Search village via live autocomplete API
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/assess/location/autocomplete?q=${encodeURIComponent(searchQuery.trim())}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.warn('Village autocomplete fallback to local search:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [isGeocodingVillage, setIsGeocodingVillage] = useState(false);

  // Accurate forward geocoding when village is selected from database search
  const handleSelectVillage = async (v) => {
    setIsGeocodingVillage(true);
    setSearchQuery('');
    setSearchResults([]);
    setValidationError('');

    // 1. Immediately jump map to district center so user sees responsive feedback
    const initialCoords = getDistrictCoords(v.districtName);
    let finalLat = initialCoords[0];
    let finalLng = initialCoords[1];

    updateField('selectedVillage', {
      ...v,
      latitude: finalLat,
      longitude: finalLng
    });

    // 2. High-precision pinpointing for specific village
    const query = `${v.villageName}, ${v.subdistrictName || ''}, ${v.districtName}, Tamil Nadu, India`;

    try {
      const res = await fetch(`/api/assess/location/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude && Number(data.latitude) !== 0) {
          finalLat = Number(data.latitude);
          finalLng = Number(data.longitude);
        }
      } else {
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData) && nomData.length > 0) {
            finalLat = parseFloat(nomData[0].lat);
            finalLng = parseFloat(nomData[0].lon);
          }
        }
      }
    } catch (err) {
      console.warn('Geocoding village fallback:', err);
    } finally {
      updateField('selectedVillage', {
        ...v,
        latitude: finalLat,
        longitude: finalLng
      });
      setIsGeocodingVillage(false);
    }
  };

  // Geolocation detector with accurate reverse geocoding
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setValidationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let villageName = 'Detected Location';
        let subdistrictName = 'Local Block';
        let districtName = 'Local District';
        let stateName = 'India';
        let lgdCode = 639842;

        try {
          // 1. Query backend Google Maps reverse-geocode
          const res = await fetch('/api/assess/location/reverse-geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.villageName && data.villageName !== 'Melavalavu') {
              villageName = data.villageName;
              subdistrictName = data.subdistrictName || subdistrictName;
              districtName = data.districtName || districtName;
              lgdCode = data.nearestVillageLgdCode || lgdCode;
            } else {
              // 2. High-accuracy reverse geocode via Nominatim OSM
              const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`);
              if (nomRes.ok) {
                const nomData = await nomRes.json();
                const addr = nomData.address || {};
                villageName = addr.village || addr.suburb || addr.town || addr.city || addr.neighbourhood || villageName;
                subdistrictName = addr.county || addr.subdistrict || addr.state_district || subdistrictName;
                districtName = addr.state_district || addr.district || addr.city || districtName;
                stateName = addr.state || stateName;
              }
            }
          } else {
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`);
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              const addr = nomData.address || {};
              villageName = addr.village || addr.suburb || addr.town || addr.city || addr.neighbourhood || villageName;
              subdistrictName = addr.county || addr.subdistrict || addr.state_district || subdistrictName;
              districtName = addr.state_district || addr.district || addr.city || districtName;
              stateName = addr.state || stateName;
            }
          }
        } catch (e) {
          console.warn('Reverse geocode fallback:', e);
        }

        updateField('selectedVillage', {
          villageName,
          subdistrictName,
          districtName,
          stateName,
          villageLgdCode: lgdCode,
          latitude,
          longitude
        });
        setIsDetectingLocation(false);
      },
      (error) => {
        console.warn('Geolocation failed or denied:', error);
        alert('Could not detect location. Please allow browser location access or select a village from the search bar.');
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Derived Project Cost & 90% Loan (Strictly non-editable per Module 2 specification)
  const derivedProjectCost = Math.max(0, Number(marginCapital) * 10);
  const derivedLoanAmount = Math.max(0, derivedProjectCost - Number(marginCapital));

  // Step Validation logic
  const handleNext = () => {
    setValidationError('');
    if (currentStep === 1) {
      if (!ownerName.trim()) {
        setValidationError('Please enter the full name of the applicant.');
        return;
      }
      if (!marginCapital || marginCapital < 5000) {
        setValidationError('Please specify a valid margin investment (minimum ₹5,000).');
        return;
      }
      if (!businessIdeaDescription.trim()) {
        setValidationError('Please provide a brief description of your business concept.');
        return;
      }
      updateField('currentStep', 2);
    } else if (currentStep === 2) {
      if (!selectedVillage) {
        setValidationError('Please select your revenue village or tap "Use Current GPS Location".');
        return;
      }
      updateField('currentStep', 3);
    }
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) {
      updateField('currentStep', currentStep - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedVillage) {
      updateField('currentStep', 2);
      setValidationError('Please select your village location before submitting.');
      return;
    }

    const safeDesc = (businessIdeaDescription && businessIdeaDescription.trim().length >= 3)
      ? businessIdeaDescription.trim()
      : `${businessCategory} rural enterprise setup focused on serving village consumers and local market demand.`;

    const payload = {
      ownerName: (ownerName && ownerName.trim().length >= 2) ? ownerName.trim() : 'Sharon Varghese',
      age: parseInt(age, 10) || 34,
      marginCapital: parseFloat(marginCapital) || 50000,
      businessCategory,
      businessIdeaDescription: safeDesc,
      villageLgdCode: selectedVillage.villageLgdCode || 639842,
      latitude: Number(selectedVillage.latitude) || 10.0524,
      longitude: Number(selectedVillage.longitude) || 78.3344,
      villageName: selectedVillage.villageName || 'Selected Revenue Village',
      subdistrictName: selectedVillage.subdistrictName || '',
      districtName: selectedVillage.districtName || 'District',
      radiusKm: 10,
      socialCategory: socialCategory || 'OBC',
      gender: gender || 'Female',
      disabilityStatus: !!disabilityStatus,
      exServicemenStatus: !!exServicemenStatus,
      preferredLanguage: selectedLang || 'en'
    };

    sessionStorage.removeItem(STORAGE_KEY);
    onSubmit(payload);
  };

  const handleResetForm = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    const initialName = defaultUser?.name || '';
    const isMaleName = /ramakrishnan|kumar|ramanathan|murugan|selvam|suresh|rajesh|mohamed/i.test(initialName);
    const isFemaleName = /meena|lakshmi|devi|priya|anita|radha|kumari/i.test(initialName);
    const initialGender = isMaleName ? 'Male' : isFemaleName ? 'Female' : 'Male';

    setFormData({
      currentStep: 1,
      ownerName: initialName,
      marginCapital: 50000,
      businessCategory: CATEGORIES[0],
      businessIdeaDescription: '',
      selectedVillage: null,
      age: 30,
      socialCategory: 'OBC',
      gender: initialGender,
      disabilityStatus: false,
      exServicemenStatus: false
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      {/* 1. Sovereign Government Header & Stepper */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[#006B7A] uppercase tracking-wider mb-2">
          <span>{selectedLang === 'ta' ? 'தொழில் மதிப்பீடு' : selectedLang === 'hi' ? 'उद्यम मूल्यांकन' : selectedLang === 'te' ? 'వ్యాపార అంచనా' : 'Enterprise Assessment'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#009DB3]" />
          <span>{selectedLang === 'ta' ? `படி ${currentStep} / 3` : selectedLang === 'hi' ? `चरण ${currentStep} / 3` : selectedLang === 'te' ? `దశ ${currentStep} / 3` : `Step ${currentStep} of 3`}</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#006B7A] tracking-tight">
          {t.assessHeaderTitle || 'Rural Business Feasibility & Concessional Credit Intake'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl font-medium">
          {t.assessHeaderSubtitle || 'Complete these 3 progressive steps to check local village demand, calculate your 90% loan eligibility, and synthesize an official bank-ready credit dossier.'}
        </p>

        {/* 3-Step Visual Progress Bar */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 mt-5 sm:mt-6">
          <div className={`p-2 sm:p-3 rounded-2xl border-2 transition-all ${
            currentStep === 1 
              ? 'bg-[#CBF9FF]/60 border-[#006B7A] shadow-xs text-[#006B7A]' 
              : currentStep > 1 
              ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900' 
              : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <StepBadge 
                state={currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'upcoming'} 
                stepNumber={1} 
                size="sm"
              />
              <span className="text-[11px] sm:text-xs font-bold truncate">
                1. {selectedLang === 'ta' ? 'தொழில் யோசனை' : selectedLang === 'hi' ? 'व्यवसाय विचार' : selectedLang === 'te' ? 'వ్యాపార ఆలోచన' : 'Idea'}
              </span>
            </div>
          </div>

          <div className={`p-2 sm:p-3 rounded-2xl border-2 transition-all ${
            currentStep === 2 
              ? 'bg-[#CBF9FF]/60 border-[#006B7A] shadow-xs text-[#006B7A]' 
              : currentStep > 2 
              ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900' 
              : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <StepBadge 
                state={currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'upcoming'} 
                stepNumber={2} 
                size="sm"
              />
              <span className="text-[11px] sm:text-xs font-bold truncate">
                2. {selectedLang === 'ta' ? 'இருப்பிடம்' : selectedLang === 'hi' ? 'स्थान' : selectedLang === 'te' ? 'ప్రదేశం' : 'Location'}
              </span>
            </div>
          </div>

          <div className={`p-2 sm:p-3 rounded-2xl border-2 transition-all ${
            currentStep === 3 
              ? 'bg-[#CBF9FF]/60 border-[#006B7A] shadow-xs text-[#006B7A]' 
              : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <StepBadge 
                state={currentStep === 3 ? 'active' : 'upcoming'} 
                stepNumber={3} 
                size="sm"
              />
              <span className="text-[11px] sm:text-xs font-bold truncate">
                3. {selectedLang === 'ta' ? 'சுயவிவரம்' : selectedLang === 'hi' ? 'प्रोफ़ाइल' : selectedLang === 'te' ? 'ప్రొఫైల్' : 'Profile'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Error Banner (Shows only on failed action) */}
      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-xs font-bold text-rose-900 flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 2. Progressive Wizard Form Container */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* STEP 1: Core Enterprise Idea & Margin Investment */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card padding="spacious" hoverable={false} className="space-y-6 border-2 border-[#79E4F3]">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-[#CBF9FF] text-[#006B7A] flex items-center justify-center shrink-0 border border-[#79E4F3]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#006B7A]">Step 1: Entrepreneur & Business Concept</h2>
                  <p className="text-xs text-slate-600 font-medium">Provide your basic enterprise details and self-investment savings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    Applicant Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={e => updateField('ownerName', e.target.value)}
                    placeholder="Enter full name of applicant"
                    className="w-full px-4 rounded-xl border-2 border-slate-300 focus:border-[#009DB3] bg-white text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    Business Sector / Category *
                  </label>
                  <select
                    value={businessCategory}
                    onChange={e => updateField('businessCategory', e.target.value)}
                    className="w-full px-4 rounded-xl border-2 border-slate-300 focus:border-[#009DB3] bg-white text-sm font-bold text-slate-900 focus:outline-none min-h-[48px] shadow-xs cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Your Available Margin Savings (₹) *
                </label>
                <input
                  type="number"
                  required
                  step={5000}
                  min={5000}
                  value={marginCapital}
                  onChange={e => updateField('marginCapital', parseFloat(e.target.value) || 0)}
                  placeholder="100000"
                  className="w-full px-4 rounded-xl border-2 border-slate-300 focus:border-[#009DB3] bg-white text-base font-black text-slate-900 focus:outline-none min-h-[48px] shadow-xs"
                />
                <p className="text-xs text-slate-600 font-medium mt-2">
                  Under standard concessional schemes, your contribution represents 10% promoter equity. Total project cost will be automatically derived as <strong className="text-[#006B7A]">₹{(marginCapital * 10).toLocaleString('en-IN')}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Describe Your Business Idea & Operations *
                </label>
                <textarea
                  required
                  rows={4}
                  value={businessIdeaDescription}
                  onChange={e => updateField('businessIdeaDescription', e.target.value)}
                  placeholder="Describe what products or services you will provide, equipment needed, and your target rural customer base..."
                  className="w-full p-4 rounded-xl border-2 border-slate-300 focus:border-[#009DB3] bg-white text-sm font-medium text-slate-900 focus:outline-none leading-relaxed shadow-xs"
                />
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Used by our advisory engine to evaluate raw material supply, local competition, and revenue potential.
                </p>
              </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Location & Rapido-Style 5-10km Catchment Map */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border-2 border-[#79E4F3] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#CBF9FF] text-[#006B7A] flex items-center justify-center shrink-0 border border-[#79E4F3]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#006B7A]">Step 2: Business Location & Local Market Area</h2>
                    <p className="text-xs text-slate-600 font-medium">Select your village or town to analyze consumer demand within a 5-10 km radius</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#006B7A] hover:bg-[#00525E] text-white transition-all shadow-xs min-h-[48px] cursor-pointer"
                >
                  <Crosshair className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Locating...' : 'Get my location'}</span>
                </button>
              </div>

              {/* Village Search Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Search Revenue Village / Gram Panchayat *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Type village name, e.g. Melavalavu, Madurai..."
                    className="w-full pl-11 pr-4 rounded-xl border-2 border-slate-300 focus:border-[#009DB3] bg-white text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px] shadow-xs"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  {isSearching && (
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500 animate-pulse">Searching DB...</span>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 border-2 border-slate-300 rounded-xl bg-white shadow-xl overflow-hidden max-h-56 overflow-y-auto z-30">
                    {searchResults.map((v) => (
                      <button
                        key={v.villageLgdCode}
                        type="button"
                        onClick={() => handleSelectVillage(v)}
                        className="w-full text-left px-4 py-3 hover:bg-[#CBF9FF]/40 border-b border-slate-100 last:border-none flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">{v.villageName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{v.subdistrictName}, {v.districtName}, {v.stateName}</div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Real Interactive Google Catchment Map (No competitor shop marks during location selection) */}
              <div className="relative">
                <GoogleMapView
                  latitude={selectedVillage?.latitude || 10.0524}
                  longitude={selectedVillage?.longitude || 78.3344}
                  radiusKm={10}
                  originName={selectedVillage?.villageName || "Proposed Business Location"}
                  showRadius={true}
                  showPlaces={false}
                  places={[]}
                  height="320px"
                />
                {isGeocodingVillage && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#009DB3] shadow-md flex items-center gap-2 text-xs font-bold text-[#006B7A] animate-pulse z-20">
                    <Crosshair className="w-3.5 h-3.5 animate-spin text-[#006B7A]" />
                    <span>Pinpointing village coordinates on Google Maps...</span>
                  </div>
                )}
              </div>

              {/* Selected Village Card */}
              {selectedVillage ? (
                <div className="p-4 sm:p-5 rounded-xl bg-[#CBF9FF]/40 border-2 border-[#009DB3] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#006B7A] flex items-center gap-2">
                        <span>Selected Revenue Village:</span>
                        {isGeocodingVillage && (
                          <span className="text-[11px] font-semibold text-sky-700 animate-pulse">
                            (Updating GPS location...)
                          </span>
                        )}
                      </div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {selectedVillage.villageName}, {selectedVillage.subdistrictName || 'Block'}, {selectedVillage.districtName} ({selectedVillage.stateName || 'India'})
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                        LGD Code: {selectedVillage.villageLgdCode} • GPS: {Number(selectedVillage.latitude || 0).toFixed(4)}°N, {Number(selectedVillage.longitude || 0).toFixed(4)}°E
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateField('selectedVillage', null)}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                  >
                    Change Village
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Search your village name above or use your device's location to see your 5-10 km local market area.</span>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Beneficiary Eligibility Profile & Auto-Derived Loan */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border-2 border-[#79E4F3] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-[#CBF9FF] text-[#006B7A] flex items-center justify-center shrink-0 border border-[#79E4F3]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#006B7A]">Step 3: Beneficiary Eligibility & Loan Structuring</h2>
                  <p className="text-xs text-slate-600 font-medium">Demographic parameters and auto-derived concessional loan calculations</p>
                </div>
              </div>

              {/* Dynamic Age Selector & Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-900">
                      Age of Applicant *
                    </label>
                    <span className="text-xs font-black text-[#006B7A]">{age} Years</span>
                  </div>
                  {/* Peanav Interactive Age Slider */}
                  <input
                    type="range"
                    min={18}
                    max={75}
                    value={age}
                    onChange={e => updateField('age', parseInt(e.target.value, 10))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#009DB3]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-bold">
                    <span>18</span>
                    <span>35</span>
                    <span>50</span>
                    <span>75</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    Social Category *
                  </label>
                  <select
                    value={socialCategory}
                    onChange={e => updateField('socialCategory', e.target.value)}
                    className="w-full px-4 rounded-xl border-2 border-slate-300 focus:border-[#009DB3] bg-white text-sm font-bold text-slate-900 focus:outline-none min-h-[48px] shadow-xs cursor-pointer"
                  >
                    <option value="OBC">Other Backward Classes (OBC)</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="Safai Karamchari">Safai Karamchari / Sanitation</option>
                    <option value="General">General / Open</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={e => updateField('gender', e.target.value)}
                    className="w-full px-4 rounded-xl border-2 border-slate-300 focus:border-[#009DB3] bg-white text-sm font-bold text-slate-900 focus:outline-none min-h-[48px] shadow-xs cursor-pointer"
                  >
                    <option value="Male">{selectedLang === 'ta' ? 'ஆண் (Male)' : selectedLang === 'hi' ? 'पुरुष (Male)' : selectedLang === 'te' ? 'పురుషుడు (Male)' : 'Male'}</option>
                    <option value="Female">{selectedLang === 'ta' ? 'பெண் (Female - கூடுதல் வட்டி சலுகை)' : selectedLang === 'hi' ? 'महिला (Female - विशेष छूट)' : selectedLang === 'te' ? 'మహిళ (Female - ప్రత్యేక రాయితీ)' : 'Female (Priority Rebate)'}</option>
                    <option value="Other">{selectedLang === 'ta' ? 'இதர (Other)' : selectedLang === 'hi' ? 'अन्य (Other)' : selectedLang === 'te' ? 'ఇతర (Other)' : 'Other'}</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={disabilityStatus}
                      onChange={e => updateField('disabilityStatus', e.target.checked)}
                      className="rounded border-slate-300 text-[#009DB3] focus:ring-[#009DB3] w-4 h-4"
                    />
                    <span>Person with Disability (Divyangjan)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={exServicemenStatus}
                      onChange={e => updateField('exServicemenStatus', e.target.checked)}
                      className="rounded border-slate-300 text-[#009DB3] focus:ring-[#009DB3] w-4 h-4"
                    />
                    <span>Ex-Servicemen Dependent</span>
                  </label>
                </div>
              </div>

              {/* Functional Bug Fix: Derived Read-Only Project Cost & 90% Loan Display */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-[#CBF9FF]/50 to-emerald-50/80 border-2 border-[#79E4F3] shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#006B7A]" />
                  <h3 className="text-sm font-black text-[#006B7A] uppercase tracking-wide">
                    Live Concessional Financing Breakdown (Auto-Derived)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-white border-2 border-slate-200">
                    <div className="text-xs text-slate-500 font-bold">Your Margin Investment (10%)</div>
                    <div className="text-xl font-black text-slate-900 mt-1">
                      ₹{Number(marginCapital).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">Promoter equity contribution</div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border-2 border-[#009DB3] shadow-xs">
                    <div className="text-xs text-[#006B7A] font-bold">Estimated Total Project Cost (100%)</div>
                    <div className="text-xl font-black text-[#006B7A] mt-1">
                      ₹{Number(derivedProjectCost).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-600 font-semibold mt-1">Derived: Margin Capital ÷ 0.10</div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border-2 border-emerald-500 shadow-xs">
                    <div className="text-xs text-emerald-800 font-bold">Concessional Loan Sanction (90%)</div>
                    <div className="text-xl font-black text-emerald-700 mt-1">
                      ₹{Number(derivedLoanAmount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">8.0% p.a. • 84 Mo. (6 Mo. Grace)</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Action Buttons & Navigation Footer */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={handleBack}
            icon={ArrowLeft}
            iconPosition="left"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous Step'}
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleNext}
              icon={ArrowRight}
              className="px-8 shadow-md"
            >
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="default"
              icon={Sparkles}
              className="px-8 shadow-lg shadow-[#006B7A]/20"
            >
              Generate Project Dossier
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
