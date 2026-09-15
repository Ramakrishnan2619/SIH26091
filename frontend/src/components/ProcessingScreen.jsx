import React, { useEffect, useState, useRef } from 'react';
import {
  Database,
  Coins,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
  Terminal,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const STAGE_ICONS = [Database, MapPin, Coins, Sparkles, CheckCircle2];

const PROCESSING_TRANSLATIONS = {
  en: {
    headerTitle: "Creating Your Business Project Report",
    evaluating: (name, cat, village) => `Evaluating ${name} • ${cat} in ${village}`,
    completedTitle: "Project Report Completed Successfully!",
    completedDesc: "All evaluation steps verified. Tap below to view your full feasibility report.",
    viewReportBtn: "View Project Report",
    stepPrefix: "Step",
    statusProcessing: "Processing",
    statusDone: "Done ✓",
    logTitle: (count) => `Live Creation Progress Log (${count} events)`,
    collapse: "Collapse",
    expand: "Expand",
    evaluationPaused: "Evaluation Paused",
    retryBtn: "Retry Evaluation",
    retryingBtn: "Retrying Evaluation...",
    editBtn: "Edit Assessment Details",
    stages: [
      {
        id: 1,
        title: 'Village Population & Customer Demand',
        desc: 'Checking village population, number of families, and local spending capacity',
        subtasks: [
          'Reading official village census records (Population & Households)',
          'Calculating local working families and potential daily customers',
          'Checking district purchasing power for your village'
        ],
        liveMetrics: [
          { label: 'Demographics', val: 'Census Verified' },
          { label: 'Market Area', val: '10 km Radius' }
        ]
      },
      {
        id: 2,
        title: 'Local Market & Nearby Shops',
        desc: 'Locating nearby shops and direct competitors within your 10 km area',
        subtasks: [
          'Mapping other shops in your local area on Google Maps',
          'Identifying direct competitor businesses selling similar products',
          'Verifying unfulfilled market demand in your village cluster'
        ],
        liveMetrics: [
          { label: 'Map Directory', val: 'Google Maps Active' },
          { label: 'Coverage', val: '10 km Area' }
        ]
      },
      {
        id: 3,
        title: 'Govt Low-Interest Loan & Monthly EMI',
        desc: 'Structuring 90% government loan with 6-month grace period',
        subtasks: [
          'Applying Ministry low-interest concessional scheme guidelines',
          'Structuring 90% loan with 6-month grace period (no principal due initially)',
          'Checking loan safety so monthly repayment stays well within profit'
        ],
        liveMetrics: [
          { label: 'Loan Share', val: '90% Govt Loan' },
          { label: 'Grace Period', val: '6 Months' }
        ]
      },
      {
        id: 4,
        title: 'Business Plan & Profit Forecast',
        desc: 'Estimating recommended selling prices, daily sales, and monthly net profit',
        subtasks: [
          'Recommending competitive selling price suited for local customers',
          'Estimating daily sales volume and seasonal demand patterns',
          'Calculating monthly raw material costs, expenses, and net profit'
        ],
        liveMetrics: [
          { label: 'Advisor', val: 'AI Business Engine' },
          { label: 'Guidance', val: 'Tailored to Category' }
        ]
      },
      {
        id: 5,
        title: 'Finalizing Project Report',
        desc: 'Preparing official bank-ready appraisal report for government scheme submission',
        subtasks: [
          'Compiling complete project cost and margin breakdown',
          'Verifying government scheme eligibility criteria for your category',
          'Packaging bank-ready report for loan sanction and verification'
        ],
        liveMetrics: [
          { label: 'Status', val: 'Bank Ready' },
          { label: 'Compliance', val: 'MoSJE Aligned' }
        ]
      }
    ],
    logs: [
      (name, cat) => `Starting business analysis for ${name} (${cat})`,
      (lat, lng) => `Target village coordinates set: lat=${lat}, lng=${lng}`,
      (vName) => `Loaded Census records for village: ${vName} (Population & Household count verified)`,
      () => `Searching Google Maps directory within 10 km market area`,
      () => `Mapped nearby establishments and competitor units in this local cluster`,
      () => `Checking government low-interest loan eligibility for applicant category`,
      () => `Calculated 90% loan with 6-month grace period; monthly repayment is safe`,
      (cat) => `AI generating category-specific profit forecast and pricing strategy for ${cat}`,
      () => `Synthesizing loan approval index across credit, market, and business readiness`,
      () => `Final bank-ready project report compiled successfully!`
    ]
  },
  ta: {
    headerTitle: "உங்கள் வணிக திட்ட அறிக்கை உருவாக்கப்படுகிறது",
    evaluating: (name, cat, village) => `${name} • ${village}-ல் ${cat} மதிப்பீடு செய்யப்படுகிறது`,
    completedTitle: "திட்ட அறிக்கை வெற்றிகரமாக தயாரானது!",
    completedDesc: "அனைத்து மதிப்பீட்டு படிநிலைகளும் சரிபார்க்கப்பட்டன. உங்கள் முழு திட்ட அறிக்கையைக் காண கீழே தொடவும்.",
    viewReportBtn: "திட்ட அறிக்கையைக் காண்க",
    stepPrefix: "படி",
    statusProcessing: "செயலாக்கத்தில் உள்ளது...",
    statusDone: "முடிந்தது ✓",
    logTitle: (count) => `நேரடி திட்ட அறிக்கை பதிவுகள் (${count} நிகழ்வுகள்)`,
    collapse: "சுருக்குக",
    expand: "விரிவாக்குக",
    evaluationPaused: "மதிப்பீடு இடைநிறுத்தப்பட்டது",
    retryBtn: "மீண்டும் முயற்சிக்கவும்",
    retryingBtn: "மறுமுயற்சி செய்கிறது...",
    editBtn: "விவரங்களை மாற்றவும்",
    stages: [
      {
        id: 1,
        title: 'கிராம மக்கள் தொகை & நுகர்வோர் தேவை',
        desc: 'கிராம மக்கள் தொகை, குடும்பங்களின் எண்ணிக்கை மற்றும் வாங்கும் திறன் கணக்கிடப்படுகிறது',
        subtasks: [
          'அரசு மக்கள் தொகை கணக்கெடுப்பு பதிவேடுகளை ஆய்வு செய்தல் (மக்கள் தொகை & குடும்பங்கள்)',
          'தினசரி நுகர்வோர் மற்றும் சாத்தியமான வாடிக்கையாளர்கள் கணக்கீடு',
          'உங்கள் கிராமத்திற்கான மாவட்ட நுகர்வு மற்றும் வாங்கும் திறன் சரிபார்ப்பு'
        ],
        liveMetrics: [
          { label: 'மக்கள் தொகையியல்', val: 'அரசு தரவு சரிபார்க்கப்பட்டது' },
          { label: 'சந்தை பகுதி', val: '10 கி.மீ சுற்றளவு' }
        ]
      },
      {
        id: 2,
        title: 'உள்ளூர் சந்தை & அருகிலுள்ள கடைகள்',
        desc: 'உங்கள் 10 கி.மீ சுற்றளவில் உள்ள பிற கடைகள் மற்றும் நேரடி போட்டியாளர்கள் கண்டறியப்படுகின்றனர்',
        subtasks: [
          'கூகுள் மேப்ஸில் உங்கள் உள்ளூர் பகுதியில் உள்ள பிற கடைகளை வரைபடமாக்குதல்',
          'இதே போன்ற பொருட்களை விற்கும் நேரடி போட்டி நிறுவனங்களை அடையாளம் காணுதல்',
          'உங்கள் பகுதியில் பூர்த்தி செய்யப்படாத சந்தை தேவையை உறுதி செய்தல்'
        ],
        liveMetrics: [
          { label: 'வரைபட அடைவு', val: 'கூகுள் மேப்ஸ் நேரடி' },
          { label: 'பரப்பளவு', val: '10 கி.மீ பகுதி' }
        ]
      },
      {
        id: 3,
        title: 'அரசு சலுகை கடன் & மாதாந்திர தவணை (EMI)',
        desc: '6 மாத அசல் விலக்குடன் 90% அரசு சலுகைக் கடன் கணக்கிடப்படுகிறது',
        subtasks: [
          'மத்திய அமைச்சகத்தின் குறைந்த வட்டி சலுகை திட்ட வழிகாட்டுதல்களைப் பயன்படுத்துதல்',
          '6 மாத சலுகைக் காலத்துடன் 90% கடன் ஒதுக்கீடு (தொடக்கத்தில் அசல் செலுத்த வேண்டியதில்லை)',
          'மாதாந்திர தவணை லாப வரம்பிற்குள் பாதுகாப்பாக இருப்பதை உறுதி செய்தல்'
        ],
        liveMetrics: [
          { label: 'கடன் பங்கு', val: '90% அரசு கடன்' },
          { label: 'அசல் விலக்கு', val: '6 மாதங்கள்' }
        ]
      },
      {
        id: 4,
        title: 'வணிக திட்டம் & லாப மதிப்பீடு',
        desc: 'பரிந்துரைக்கப்பட்ட விற்பனை விலை, தினசரி விற்பனை மற்றும் மாதாந்திர நிகர லாப மதிப்பீடு',
        subtasks: [
          'உள்ளூர் வாடிக்கையாளர்களுக்கு ஏற்ற போட்டி விற்பனை விலையை பரிந்துரைத்தல்',
          'தினசரி விற்பனை அளவு மற்றும் பருவ கால தேவை போக்குகளை கணித்தல்',
          'மாதாந்திர மூலப்பொருள் செலவுகள், பிற செலவுகள் மற்றும் நிகர லாபம் கணக்கிடுதல்'
        ],
        liveMetrics: [
          { label: 'ஆலோசகர்', val: 'AI வணிக வழிகாட்டி (Gemini)' },
          { label: 'வழிகாட்டல்', val: 'வணிக வகைக்கு ஏற்றது' }
        ]
      },
      {
        id: 5,
        title: 'திட்ட அறிக்கையை இறுதி செய்தல்',
        desc: 'அரசு திட்ட விண்ணப்பத்திற்கு வங்கியில் சமர்ப்பிக்கக்கூடிய திட்ட அறிக்கை தயாரித்தல்',
        subtasks: [
          'முழு திட்ட செலவு மற்றும் மூலதன விபரங்களை தொகுத்தல்',
          'உங்கள் பிரிவிற்கான அரசு திட்ட தகுதி வரம்புகளை சரிபார்த்தல்',
          'கடன் ஒப்புதலுக்காக வங்கிக்கு ஏற்ற முழு அறிக்கையை உருவாக்குதல்'
        ],
        liveMetrics: [
          { label: 'நிலை', val: 'வங்கி ஏற்பு பெற்றது' },
          { label: 'விதிமுறை', val: 'MoSJE அங்கீகாரம்' }
        ]
      }
    ],
    logs: [
      (name, cat) => `${name} (${cat}) க்கான வணிக பகுப்பாய்வு தொடங்குகிறது...`,
      (lat, lng) => `இலக்கு கிராம ஜிபிஎஸ் ஆயங்கள்: அட்சரேகை=${lat}, தீர்க்கரேகை=${lng}`,
      (vName) => `கிராம கணக்கெடுப்பு பதிவுகள் பெறப்பட்டன: ${vName} (மக்கள் தொகை & குடும்பங்கள் சரிபார்க்கப்பட்டன)`,
      () => `10 கி.மீ சந்தை பகுதியில் கூகுள் மேப்ஸ் அடைவு தேடப்படுகிறது...`,
      () => `உள்ளூர் பகுதியில் உள்ள பிற கடைகள் மற்றும் போட்டி நிறுவனங்கள் வரைபடமாக்கப்பட்டன`,
      () => `விண்ணப்பதாரர் சமூகப் பிரிவிற்கான அரசு சலுகைக் கடன் தகுதி சரிபார்க்கப்படுகிறது...`,
      () => `6 மாத அசல் விலக்குடன் 90% கடன் கணக்கிடப்பட்டது; மாதாந்திர தவணை பாதுகாப்பானது`,
      (cat) => `AI (Gemini) ${cat} க்கான பிரத்யேக லாப கணிப்பு மற்றும் விலை உத்தியை உருவாக்குகிறது`,
      () => `கடன், சந்தை மற்றும் வணிகத் தயார்நிலை குறியீடுகள் ஒருங்கிணைக்கப்படுகின்றன...`,
      () => `முழுமையான வங்கி திட்ட அறிக்கை வெற்றிகரமாக தொகுக்கப்பட்டது!`
    ]
  },
  hi: {
    headerTitle: "आपकी व्यावसायिक परियोजना रिपोर्ट तैयार की जा रही है",
    evaluating: (name, cat, village) => `${village} में ${name} • ${cat} का मूल्यांकन किया जा रहा है`,
    completedTitle: "परियोजना रिपोर्ट सफलतापूर्वक तैयार हो गई!",
    completedDesc: "सभी मूल्यांकन चरण सत्यापित। अपनी पूरी रिपोर्ट देखने के लिए नीचे क्लिक करें।",
    viewReportBtn: "परियोजना रिपोर्ट देखें",
    stepPrefix: "चरण",
    statusProcessing: "प्रक्रिया जारी...",
    statusDone: "सम्पन्न ✓",
    logTitle: (count) => `लाइव प्रगति लॉग (${count} घटनाएं)`,
    collapse: "छोटा करें",
    expand: "विस्तार करें",
    evaluationPaused: "मूल्यांकन रुका",
    retryBtn: "पुनः प्रयास करें",
    retryingBtn: "प्रयास किया जा रहा है...",
    editBtn: "विवरण संपादित करें",
    stages: [
      {
        id: 1,
        title: 'ग्राम जनसंख्या एवं उपभोक्ता मांग',
        desc: 'ग्राम जनसंख्या, परिवारों की संख्या और स्थानीय क्रय क्षमता की जांच',
        subtasks: [
          'आधिकारिक ग्राम जनगणना अभिलेखों का विश्लेषण (जनसंख्या और परिवार)',
          'स्थानीय कामकाजी परिवारों और दैनिक संभावित ग्राहकों की गणना',
          'आपके गांव के लिए जिला स्तरीय क्रय शक्ति सत्यापन'
        ],
        liveMetrics: [
          { label: 'जनसांख्यिकी', val: 'जनगणना सत्यापित' },
          { label: 'बाजार क्षेत्र', val: '10 किमी दायरा' }
        ]
      },
      {
        id: 2,
        title: 'स्थानीय बाजार एवं निकटवर्ती दुकानें',
        desc: '10 किमी क्षेत्र के भीतर निकटवर्ती दुकानों और प्रत्यक्ष प्रतिस्पर्धियों का पता लगाना',
        subtasks: [
          'गूगल मैप्स पर आपके स्थानीय क्षेत्र की दुकानों का मानचित्रण',
          'समान उत्पाद बेचने वाले प्रतिस्पर्धी व्यवसायों की पहचान',
          'आपके गांव समूह में असंतुष्ट बाजार मांग का सत्यापन'
        ],
        liveMetrics: [
          { label: 'मानचित्र निर्देशिका', val: 'गूगल मैप्स सक्रिय' },
          { label: 'कवरेज', val: '10 किमी क्षेत्र' }
        ]
      },
      {
        id: 3,
        title: 'सरकारी कम ब्याज ऋण एवं मासिक ईएमआई',
        desc: '6 महीने की छूट अवधि के साथ 90% सरकारी ऋण संरचना',
        subtasks: [
          'मंत्रालय के कम ब्याज रियायती योजना दिशानिर्देश लागू करना',
          '6 महीने की मोहलत के साथ 90% ऋण संरचना (शुरुआत में कोई मूलधन नहीं)',
          'मासिक ईएमआई की सुरक्षा जांच ताकि यह लाभ सीमा में रहे'
        ],
        liveMetrics: [
          { label: 'ऋण हिस्सा', val: '90% सरकारी ऋण' },
          { label: 'मोहलत अवधि', val: '6 महीने' }
        ]
      },
      {
        id: 4,
        title: 'व्यापार योजना एवं लाभ पूर्वानुमान',
        desc: 'अनुशंसित बिक्री मूल्य, दैनिक बिक्री और मासिक शुद्ध लाभ का अनुमान',
        subtasks: [
          'स्थानीय ग्राहकों के अनुकूल प्रतिस्पर्धी बिक्री मूल्य की सिफारिश',
          'दैनिक बिक्री मात्रा और मौसमी मांग का पूर्वानुमान',
          'मासिक कच्चा माल लागत, खर्च और शुद्ध लाभ की गणना'
        ],
        liveMetrics: [
          { label: 'सलाहकार', val: 'AI बिजनेस इंजन (Gemini)' },
          { label: 'मार्गदर्शन', val: 'श्रेणी के अनुकूल' }
        ]
      },
      {
        id: 5,
        title: 'परियोजना रिपोर्ट को अंतिम रूप देना',
        desc: 'सरकारी योजना में जमा करने हेतु बैंक-स्वीकार्य रिपोर्ट तैयार करना',
        subtasks: [
          'कुल परियोजना लागत और मार्जिन विवरण संकलित करना',
          'आपकी श्रेणी हेतु सरकारी योजना पात्रता मानदंडों की पुष्टि',
          'ऋण स्वीकृति हेतु बैंक-स्वीकार्य रिपोर्ट तैयार करना'
        ],
        liveMetrics: [
          { label: 'स्थिति', val: 'बैंक तैयार' },
          { label: 'अनुपालन', val: 'MoSJE अनुरूप' }
        ]
      }
    ],
    logs: [
      (name, cat) => `${name} (${cat}) हेतु व्यावसायिक विश्लेषण प्रारंभ...`,
      (lat, lng) => `लक्षित गांव निर्देशांक: अक्षांश=${lat}, देशांतर=${lng}`,
      (vName) => `गांव जनगणना अभिलेख लोड हुए: ${vName}`,
      () => `10 किमी बाजार क्षेत्र में गूगल मैप्स निर्देशिका खोजी जा रही है...`,
      () => `निकटवर्ती प्रतिष्ठानों और प्रतिस्पर्धियों का मानचित्रण सम्पन्न`,
      () => `आवेदक श्रेणी हेतु सरकारी रियायती ऋण पात्रता जांची जा रही है...`,
      () => `6 महीने की छूट के साथ 90% ऋण गणना पूर्ण; मासिक ईएमआई सुरक्षित`,
      (cat) => `AI (Gemini) ${cat} हेतु लाभ पूर्वानुमान और मूल्य निर्धारण तैयार कर रहा है`,
      () => `क्रेडिट, बाजार और व्यावसायिक तत्परता सूचकांक का संश्लेषण...`,
      () => `अंतिम बैंक-स्वीकार्य परियोजना रिपोर्ट सफलतापूर्वक तैयार!`
    ]
  },
  te: {
    headerTitle: "మీ వ్యాపార ప్రాజెక్ట్ నివేదిక రూపొందించబడుతోంది",
    evaluating: (name, cat, village) => `${village} లో ${name} • ${cat} మూల్యాంకనం జరుగుతోంది`,
    completedTitle: "ప్రాజెక్ట్ నివేదిక విజయవంతంగా పూర్తయింది!",
    completedDesc: "అన్ని మూల్యాంకన దశలు ధృవీకరించబడ్డాయి. పూర్తి నివేదిక చూడటానికి క్రింద క్లిక్ చేయండి.",
    viewReportBtn: "ప్రాజెక్ట్ నివేదికను వీక్షించండి",
    stepPrefix: "దశ",
    statusProcessing: "పురోగతిలో ఉంది...",
    statusDone: "పూర్తయింది ✓",
    logTitle: (count) => `ప్రత్యక్ష పురోగతి లాగ్ (${count} ఈవెంట్లు)`,
    collapse: "కుదించు",
    expand: "విస్తరించు",
    evaluationPaused: "మూల్యాంకనం నిలిపివేయబడింది",
    retryBtn: "మళ్లీ ప్రయత్నించండి",
    retryingBtn: "ప్రయత్నిస్తోంది...",
    editBtn: "వివరాలను సవరించండి",
    stages: [
      {
        id: 1,
        title: 'గ్రామ జనాభా & వినియోగదారుల డిమాండ్',
        desc: 'గ్రామ జనాభా, కుటుంబాల సంఖ్య మరియు ఖర్చు సామర్థ్యం విశ్లేషణ',
        subtasks: [
          'అధికారిక గ్రామ జనాభా లెక్కల రికార్డుల పరిశీలన',
          'స్థానిక రోజువారీ సంభావ్య కస్టమర్ల లెక్కింపు',
          'మీ గ్రామానికి జిల్లా కొనుగోలు శక్తి తనిఖీ'
        ],
        liveMetrics: [
          { label: 'జనాభా వివరాలు', val: 'ధృవీకరించబడింది' },
          { label: 'మార్కెట్ ప్రాంతం', val: '10 కి.మీ పరిధి' }
        ]
      },
      {
        id: 2,
        title: 'స్థానిక మార్కెట్ & సమీప దుకాణాలు',
        desc: '10 కి.మీ పరిధిలోని సమీప దుకాణాలు మరియు పోటీదారులను గుర్తించడం',
        subtasks: [
          'గూగుల్ మ్యాప్స్‌లో స్థానిక దుకాణాల మ్యాపింగ్',
          'సారూప్య ఉత్పత్తులను విక్రయించే పోటీదారులను గుర్తించడం',
          'మీ గ్రామ క్లస్టర్‌లో తీరని మార్కెట్ డిమాండ్‌ను ధృవీకరించడం'
        ],
        liveMetrics: [
          { label: 'మ్యాప్ డైరెక్టరీ', val: 'గూగుల్ మ్యాప్స్ యాక్టివ్' },
          { label: 'పరిధి', val: '10 కి.మీ ప్రాంతం' }
        ]
      },
      {
        id: 3,
        title: 'ప్రభుత్వ రాయితీ రుణం & నెలవారీ EMI',
        desc: '6 నెలల గ్రేస్ పీరియడ్‌తో 90% ప్రభుత్వ రుణ కేటాయింపు',
        subtasks: [
          'మంత్రిత్వ శాఖ తక్కువ వడ్డీ రాయితీ పథకం మార్గదర్శకాలు',
          '6 నెలల మారటోరియంతో 90% రుణం (ప్రారంభంలో అసలు చెల్లించాల్సిన పనిలేదు)',
          'నెలవారీ చెల్లింపు సురక్షిత పరిమితిలో ఉండేలా తనిఖీ'
        ],
        liveMetrics: [
          { label: 'రుణ వాటా', val: '90% ప్రభుత్వ రుణం' },
          { label: 'గ్రేస్ పీరియడ్', val: '6 నెలలు' }
        ]
      },
      {
        id: 4,
        title: 'వ్యాపార ప్రణాళిక & లాభ అంచనా',
        desc: 'సిఫార్సు చేయబడిన విక్రయ ధర, రోజువారీ అమ్మకాలు మరియు నికర లాభం',
        subtasks: [
          'స్థానిక కస్టమర్లకు సరిపోయే పోటీ ధరల సిఫార్సు',
          'రోజువారీ అమ్మకాల పరిమాణం మరియు డిమాండ్ ధోరణుల అంచనా',
          'నెలవారీ ముడిసరుకు ఖర్చులు మరియు నికర లాభాల లెక్కింపు'
        ],
        liveMetrics: [
          { label: 'సలహాదారు', val: 'AI బిజినెస్ ఇంజిన్ (Gemini)' },
          { label: 'మార్గదర్శకత్వం', val: 'వర్గానికి అనుకూలం' }
        ]
      },
      {
        id: 5,
        title: 'ప్రాజెక్ట్ నివేదికను ఖరారు చేయడం',
        desc: 'ప్రభుత్వ పథకం సమర్పణ కోసం బ్యాంక్-సిద్ధంగా ఉన్న నివేదిక తయారీ',
        subtasks: [
          'మొత్తం ప్రాజెక్ట్ వ్యయం మరియు మార్జిన్ వివరాల సంకలనం',
          'మీ వర్గానికి ప్రభుత్వ పథక అర్హత ప్రమాణాల ధృవీకరణ',
          'రుణ మంజూరు కోసం బ్యాంక్ నివేదిక ప్యాకేజింగ్'
        ],
        liveMetrics: [
          { label: 'స్థితి', val: 'బ్యాంక్ సిద్ధం' },
          { label: 'నిబంధనలు', val: 'MoSJE ప్రమాణం' }
        ]
      }
    ],
    logs: [
      (name, cat) => `${name} (${cat}) కొరకు వ్యాపార విశ్లేషణ ప్రారంభం...`,
      (lat, lng) => `టార్గెట్ గ్రామ కోఆర్డినేట్‌లు: అక్షాంశం=${lat}, రేఖాంశం=${lng}`,
      (vName) => `గ్రామ జనాభా రికార్డులు లోడ్ చేయబడ్డాయి: ${vName}`,
      () => `10 కి.మీ మార్కెట్ ప్రాంతంలో గూగుల్ మ్యాప్స్ శోధన...`,
      () => `సమీప దుకాణాలు మరియు పోటీదారుల మ్యాపింగ్ పూర్తయింది`,
      () => `దరఖాస్తుదారు వర్గానికి ప్రభుత్వ రాయితీ రుణ అర్హత తనిఖీ...`,
      () => `6 నెలల గ్రేస్ పీరియడ్‌తో 90% రుణం లెక్కించబడింది; EMI సురక్షితం`,
      (cat) => `AI (Gemini) ${cat} కోసం లాభాల అంచనా మరియు ధర వ్యూహాన్ని రూపొందిస్తోంది`,
      () => `క్రెడిట్, మార్కెట్ మరియు వ్యాపార సంసిద్ధత సూచికల సంశ్లేషణ...`,
      () => `చివరి బ్యాంక్ నివేదిక విజయవంతంగా సంకలనం చేయబడింది!`
    ]
  }
};

export function ProcessingScreen({ payload, onSuccess, onError, selectedLang = 'en' }) {
  const langKey = selectedLang || payload?.preferredLanguage || 'en';
  const t = PROCESSING_TRANSLATIONS[langKey] || PROCESSING_TRANSLATIONS.en;

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [completedReport, setCompletedReport] = useState(null);

  const terminalBoxRef = useRef(null);

  const applicantName = payload?.ownerName || 'Applicant';
  const businessCategory = payload?.businessCategory || 'Micro Enterprise';
  const villageName = payload?.villageName || 'Selected Revenue Village';
  const latStr = payload?.latitude ? Number(payload.latitude).toFixed(4) : '10.0524';
  const lngStr = payload?.longitude ? Number(payload.longitude).toFixed(4) : '78.3344';

  const runAssessment = async () => {
    setIsRetrying(true);
    setErrorMsg(null);
    setLogs(prev => [...prev, `[INFO] ${t.logs[0](applicantName, businessCategory)}`]);
    try {
      const token = localStorage.getItem('vyapaarsathi_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Sanitize payload so brief descriptions or missing codes never cause validation errors
      const sanitizedPayload = {
        ...payload,
        ownerName: payload?.ownerName || 'Applicant',
        age: Number(payload?.age) || 34,
        gender: payload?.gender || 'Female',
        socialCategory: payload?.socialCategory || 'OBC',
        marginCapital: Number(payload?.marginCapital) || 100000,
        businessCategory: payload?.businessCategory || 'Grocery & Daily Provisions',
        businessIdeaDescription: (payload?.businessIdeaDescription && payload.businessIdeaDescription.trim().length >= 3)
          ? payload.businessIdeaDescription.trim()
          : `${payload?.businessCategory || 'Rural'} micro-enterprise setup providing essential local services and goods.`,
        villageLgdCode: payload?.villageLgdCode || 639842,
        latitude: Number(payload?.latitude) || 10.0524,
        longitude: Number(payload?.longitude) || 78.3344,
        preferredLanguage: langKey
      };

      const res = await fetch('/api/assess/complete', {
        method: 'POST',
        headers,
        body: JSON.stringify(sanitizedPayload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setCurrentStep(t.stages.length);
      setLogs(prev => [...prev, `[SUCCESS] ${t.logs[9]()}`]);
      setCompletedReport(data);
    } catch (err) {
      console.error('Assessment execution failed:', err);
      setErrorMsg(err.message || 'Failed to generate assessment. Please check network connectivity or try again.');
      setLogs(prev => [...prev, `[ERROR] Process halted: ${err.message}`]);
    } finally {
      setIsRetrying(false);
    }
  };

  // Dynamic log emitter with translated plain language
  useEffect(() => {
    const logTemplates = [
      { time: 200, step: 0, text: t.logs[0](applicantName, businessCategory) },
      { time: 600, step: 0, text: t.logs[1](latStr, lngStr) },
      { time: 1100, step: 0, text: t.logs[2](villageName) },
      { time: 1800, step: 1, text: t.logs[3]() },
      { time: 2500, step: 1, text: t.logs[4]() },
      { time: 3300, step: 2, text: t.logs[5]() },
      { time: 4100, step: 2, text: t.logs[6]() },
      { time: 5000, step: 3, text: t.logs[7](businessCategory) },
      { time: 6000, step: 4, text: t.logs[8]() },
      { time: 7000, step: 4, text: t.logs[9]() }
    ];

    const logTimeouts = logTemplates.map(item => {
      return setTimeout(() => {
        setLogs(prev => [...prev, item.text]);
        setCurrentStep(prev => Math.max(prev, item.step));
      }, item.time);
    });

    runAssessment();

    return () => {
      logTimeouts.forEach(clearTimeout);
    };
  }, [langKey]);

  // ONLY scroll internal terminal box — NEVER scroll the main browser window!
  useEffect(() => {
    if (terminalBoxRef.current) {
      terminalBoxRef.current.scrollTop = terminalBoxRef.current.scrollHeight;
    }
  }, [logs]);

  // Gentle progress percentage
  const isFinished = completedReport || currentStep >= t.stages.length;
  const progressPct = completedReport 
    ? 100 
    : Math.min(95, Math.round(((currentStep + 1) / (t.stages.length + 1)) * 100));

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-slate-50 min-h-[700px]">
      <div className="max-w-3xl w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
        {/* 1. Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#006B7A] flex items-center justify-center shadow-md shrink-0">
              <img src="/favicon.svg" alt="VyapaarSathi" className="w-8 h-8 rounded-full" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {t.headerTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.evaluating(applicantName, businessCategory, villageName)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stationary percentage text with circular ring (stops spinning when 100%) */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-4 ${
                  isFinished
                    ? 'border-emerald-500'
                    : 'border-[#CBF9FF] border-t-[#006B7A] animate-spin'
                }`}
              />
              <span className={`relative text-xs font-black ${isFinished ? 'text-emerald-700' : 'text-[#006B7A]'}`}>
                {progressPct}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Completion Banner & Action Button when 100% Ready (Requires user click) */}
        {completedReport && (
          <div className="my-5 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">
                  {t.completedTitle}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {t.completedDesc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSuccess(completedReport)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#006B7A] hover:bg-[#005561] text-white text-sm font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{t.viewReportBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overall Progress Bar */}
        <div className="my-4">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#006B7A] via-[#009DB3] to-[#02C6E1] h-2 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 3. Detailed 5-Step Telemetry */}
        <div className="space-y-3 mb-6">
          {t.stages.map((step, idx) => {
            const isDone = currentStep > idx || completedReport;
            const isCurrent = currentStep === idx && !completedReport;
            const IconComp = STAGE_ICONS[idx] || Database;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isCurrent
                    ? 'bg-[#E5F6F8] border-[#79E4F3] shadow-sm ring-2 ring-[#CBF9FF]'
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-[#006B7A] animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-[#006B7A]' : isDone ? 'text-emerald-900' : 'text-slate-600'}`}>
                          {t.stepPrefix} {step.id}: {step.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006B7A] text-white animate-pulse">
                            {t.statusProcessing}
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {t.statusDone}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {step.desc}
                      </div>

                      {/* Subtasks breakdown */}
                      {(isCurrent || isDone) && (
                        <div className="mt-2 space-y-1">
                          {step.subtasks.map((st, i) => (
                            <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-[#009DB3]'}`} />
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right-hand Metric Badges */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    {step.liveMetrics.map((m, mIdx) => (
                      <span key={mIdx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {m.label}: <strong className="text-[#006B7A]">{m.val}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Real-Time Execution Log Box (Self-scrolling internally without window jerk) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden text-left shadow-lg">
          <button
            type="button"
            onClick={() => setShowTerminal(!showTerminal)}
            className="w-full px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#02C6E1]" />
              <span>{t.logTitle(logs.length)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{showTerminal ? t.collapse : t.expand}</span>
              {showTerminal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showTerminal && (
            <div 
              ref={terminalBoxRef}
              className="p-4 font-mono text-[11px] text-emerald-400 max-h-40 overflow-y-auto space-y-1 bg-slate-950 scroll-smooth"
            >
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed flex items-start gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={log.includes('[ERROR]') ? 'text-rose-400 font-bold' : log.includes('[SUCCESS]') ? 'text-[#02C6E1] font-bold' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Alert & Retry Action Bar */}
        {errorMsg && (
          <div className="mt-5 p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-950">{t.evaluationPaused}</h4>
                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                  {errorMsg.includes('validation')
                    ? 'Some input fields required adjustment. You can retry now with standard village market defaults, or return to edit your details.'
                    : errorMsg}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-200">
              <button
                type="button"
                onClick={runAssessment}
                disabled={isRetrying}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? t.retryingBtn : t.retryBtn}</span>
              </button>

              <button
                type="button"
                onClick={onError}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.editBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
