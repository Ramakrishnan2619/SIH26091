import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Mic, Sparkles, Bot, User, Volume2, 
  VolumeX, ShieldCheck, X, RefreshCw, ChevronRight, HelpCircle
} from 'lucide-react';

// Formatter to strip JSON syntax or unformatted raw brackets if returned by LLM
function formatMessageContent(raw) {
  if (!raw) return '';
  let text = raw.trim();

  // Handle markdown code block JSON
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  // If text is valid JSON, parse and extract relevant field
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.content) return parsed.content;
      if (parsed.reply) return parsed.reply;
      if (parsed.message) return parsed.message;
      if (parsed.text) return parsed.text;
      // Convert object keys into clean bullet points
      return Object.entries(parsed)
        .map(([k, v]) => `• **${k.replace(/_/g, ' ')}**: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n');
    } catch {}
  }

  return text;
}

export function ChatDrawer({ assessmentId, preferredLang = 'en', onOpenLiveVoice }) {
  const [isOpen, setIsOpen] = useState(false);

  const getInitialGreeting = (lang) => {
    switch (lang) {
      case 'ta':
        return "வணக்கம்! நான் வியாபார்சாதி, உங்கள் AI கடன் மற்றும் வணிக உதவியாளர். உங்கள் திட்ட அறிக்கை, தவணை அட்டவணை அல்லது அரசு மானியம் குறித்து என்னிடம் கேளுங்கள்.";
      case 'hi':
        return "नमस्ते! मैं व्यापारसाथी, आपका AI क्रेडिट और बिज़नेस सहायक हूँ। अपनी व्यवहार्यता रिपोर्ट, चुकौती अनुसूची या सरकारी सब्सिडी के बारे में कुछ भी पूछें।";
      case 'te':
        return "నమస్కారం! నేను వ్యాపార్‌సాథి, మీ AI క్రెడిట్ & బిజినెస్ సహాయకుడిని. మీ నివేదిక, వాయిదాల షెడ్యూల్ లేదా సబ్సిడీల గురించి నన్ను అడగండి.";
      default:
        return "Namaste! I am VyapaarSathi, your AI Business & Credit Sahayak. Ask me anything about your feasibility report, repayment schedule, or government subsidies.";
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      content: getInitialGreeting(preferredLang),
      isVoice: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [voices, setVoices] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) setVoices(v);
      }
    };
    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [{ ...prev[0], content: getInitialGreeting(preferredLang) }];
      }
      return prev;
    });
  }, [preferredLang]);

  const suggestionChips = preferredLang === 'ta' ? [
    "முதல் காலாண்டில் வட்டி மட்டும் செலுத்துவது ஏன்?",
    "முன்கூட்டியே கடனை அடைத்தால் அபராதம் உண்டா?",
    "இலவச உத்யம் பதிவு செய்வது எப்படி?",
    "பெண்கள் மற்றும் OBC பிரிவினருக்கு என்ன மானியம் உண்டு?"
  ] : preferredLang === 'hi' ? [
    "Q1 में केवल ब्याज का भुगतान क्यों?",
    "क्या समय से पहले ऋण चुकाने पर पेनल्टी है?",
    "मुफ्त उद्यम प्रमाणपत्र कैसे प्राप्त करें?",
    "महिला/ओबीसी हेतु क्या सब्सिडी उपलब्ध है?"
  ] : preferredLang === 'te' ? [
    "మొదటి త్రైమాసికంలో వడ్డీ మాత్రమే ఎందుకు?",
    "ముందుగానే రుణం చెల్లిస్తే జరిమానా ఉంటుందా?",
    "ఉచిత ఉద్యమ్ సర్టిఫికేట్ ఎలా పొందాలి?",
    "మహిళలకు/బీసీలకు ఏ సబ్సిడీలు వర్తిస్తాయి?"
  ] : [
    "Why is my Q1 payment only interest?",
    "Can I repay early without penalty?",
    "How to get free Udyam certificate?",
    "What subsidies apply for women/OBC?"
  ];

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Load chat history if assessmentId exists
  useEffect(() => {
    if (!assessmentId) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history/${assessmentId}`);
        if (res.ok) {
          const history = await res.json();
          if (Array.isArray(history) && history.length > 0) {
            setMessages(history.map(m => ({
              id: m.message_id || Math.random().toString(),
              sender: m.sender,
              content: formatMessageContent(m.content),
              isVoice: m.is_voice,
              timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
          }
        }
      } catch (err) {
        // Fallback to default greeting
      }
    };
    fetchHistory();
  }, [assessmentId]);

  // Read message aloud using Web Speech API
  const handleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const langCode = preferredLang === 'ta' ? 'ta-IN' : preferredLang === 'hi' ? 'hi-IN' : preferredLang === 'te' ? 'te-IN' : 'en-IN';
    utterance.lang = langCode;

    const allVoices = (voices && voices.length > 0) ? voices : window.speechSynthesis.getVoices();
    let preferredVoice = allVoices.find(v => {
      const l = (v.lang || '').replace('_', '-').toLowerCase();
      const n = (v.name || '').toLowerCase();
      if (preferredLang === 'ta') {
        return l === 'ta-in' || l.startsWith('ta') || n.includes('tamil') || n.includes('valluvar') || n.includes('தமிழ்');
      }
      if (preferredLang === 'hi') {
        return l === 'hi-in' || l.startsWith('hi') || n.includes('hindi') || n.includes('हिन्दी') || n.includes('kalpana') || n.includes('hemant');
      }
      if (preferredLang === 'te') {
        return l === 'te-in' || l.startsWith('te') || n.includes('telugu') || n.includes('తెలుగు');
      }
      return l === 'en-in' || l.startsWith('en');
    });

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setSpeakingId(msgId);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    const trimmed = text.trim();
    const cleanLower = trimmed.toLowerCase().trim();

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: trimmed,
      isVoice: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    const isGreetingWord = [
      'hello', 'hi', 'hey', 'namaste', 'vanakkam', 'namaskaram',
      'வணக்கம்', 'ஹலோ', 'வணக்கங்க',
      'नमस्ते', 'हेलो', 'नमस्कार',
      'నమస్కారం', 'హలో'
    ].includes(cleanLower) || cleanLower.startsWith('வணக்கம்') || cleanLower.startsWith('नमस्ते');

    // Fast-path simple greetings without long financial dump
    if (isGreetingWord) {
      const greetingContent = preferredLang === 'ta' || ['வணக்கம்', 'ஹலோ', 'வணக்கங்க', 'vanakkam'].includes(cleanLower)
        ? "வணக்கம்! நான் வியாபார்சாதி, உங்கள் AI கடன் மற்றும் வணிக உதவியாளர். உங்கள் தொழில் அறிக்கை, கடன் தவணை அல்லது அரசு திட்டங்கள் குறித்து என்னிடம் கேளுங்கள்."
        : preferredLang === 'hi' || ['नमस्ते', 'हेलो', 'नमस्कार', 'namaste'].includes(cleanLower)
        ? "नमस्ते! मैं व्यापारसाथी, आपका AI क्रेडिट और बिज़नेस सहायक हूँ। मैं आपकी रिपोर्ट, ऋण चुकौती या सरकारी योजनाओं में किस प्रकार सहायता कर सकता हूँ?"
        : preferredLang === 'te' || ['నమస్కారం', 'హలో', 'namaskaram'].includes(cleanLower)
        ? "నమస్కారం! నేను వ్యాపార్‌సాథి, మీ AI బిజినెస్ మరియు క్రెడిట్ సహాయకుడిని. మీ ప్రాజెక్ట్ నివేదిక లేదా ప్రభుత్వ పథకాల గురించి நான் మీకు ఎలా సహాయపడగలను?"
        : "Namaste! I am VyapaarSathi, your AI Credit & Business Sahayak. How can I assist you with your business report or loan scheme today?";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: greetingContent,
        isVoice: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId || 101,
          content: trimmed,
          preferred_language: preferredLang || 'en'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const formatted = formatMessageContent(data.content);
        setMessages(prev => [...prev, {
          id: data.message_id || (Date.now() + 1).toString(),
          sender: 'assistant',
          content: formatted,
          isVoice: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        fallbackReply(trimmed);
      }
    } catch (e) {
      fallbackReply(trimmed);
    } finally {
      setLoading(false);
    }
  };

  const fallbackReply = (userQuery) => {
    const lower = userQuery.toLowerCase();
    const isTa = preferredLang === 'ta';
    let reply = isTa
      ? "உங்கள் சரிபார்க்கப்பட்ட திட்ட அறிக்கையின்படி, ஆரம்ப 6 மாத கால அவகாசத்துடன் மூலதனச் சுமையைக் குறைக்கும் வகையில் கடன் தவணை அமைக்கப்பட்டுள்ளது."
      : "Based on your verified feasibility report, your loan installment is structured with a 6-month moratorium to protect your working capital.";
    
    if (lower.includes("q1") || lower.includes("interest") || lower.includes("moratorium") || lower.includes("வட்டி")) {
      reply = isTa
        ? "ஆரம்ப 6 மாத கால அவகாசத்தில் நீங்கள் குறைந்த எளிய வட்டியை மட்டுமே செலுத்த வேண்டும், இதனால் தொடக்க காலத்தில் மூலதனப் பாதுகாப்பு கிடைக்கும்."
        : "During your initial 6-month moratorium period, you only service simple interest so your working capital is protected while setting up operations.";
    } else if (lower.includes("early") || lower.includes("prepay") || lower.includes("penalty") || lower.includes("அபராதம்") || lower.includes("முன்கூட்டியே")) {
      reply = isTa
        ? "MoSJE உச்ச நிறுவனங்களின் (NSFDC / NBCFDC) கீழ், கடனை முன்கூட்டியே அடைப்பதற்கு பூஜ்ஜிய அபராதம் (zero foreclosure penalty). நீங்கள் எப்போது வேண்டுமானாலும் அசலை விரைவாகச் செலுத்தலாம்."
        : "Under MoSJE apex corporations (NSFDC / NBCFDC), there is zero foreclosure or prepayment penalty. You can clear your principal faster anytime.";
    } else if (lower.includes("udyam") || lower.includes("register") || lower.includes("பதிவு")) {
      reply = isTa
        ? "ஆதார் அட்டை மூலம் உத்யம் பதிவு (Udyam Registration) 100% இலவசம். கிராம பஞ்சாயத்து வணிக தடையில்லா சான்றிதழுடன் இது கடன் வழங்கலுக்கான தகுதியை நிறைவு செய்கிறது."
        : "Udyam Registration is 100% free online using your Aadhaar. Along with a Gram Panchayat trade NOC, this completes your statutory eligibility for disbursement.";
    } else if (lower.includes("subsidy") || lower.includes("women") || lower.includes("sc") || lower.includes("obc") || lower.includes("மானியம்")) {
      reply = isTa
        ? "தகுதியான பெண் தொழில்முனைவோருக்கு 0.5% வட்டி சலுகை மற்றும் சரிபார்ப்புக்குப் பின் பின்னேற்பு மூலதன மானியம் நேரடியாக உங்கள் கடன் கணக்கில் வரவு வைக்கப்படும்."
        : "Eligible women entrepreneurs receive a 0.5% interest concession, and back-ended capital subsidies are credited directly into your loan account upon verification.";
    }

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      content: reply,
      isVoice: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <>
      {/* 1. Compact Floating Circular Button (FAB) at Bottom-Right */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 no-print flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#006B7A] via-[#009DB3] to-[#02C6E1] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer border-2 border-white"
            title="Open AI Business Sahayak"
          >
            <img
              src="/favicon.svg"
              alt="VyapaarSathi AI"
              className="w-8 h-8 rounded-full p-0.5 bg-white/20 group-hover:rotate-12 transition-transform duration-200"
            />
            {/* Pulsing online badge */}
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </button>
        </div>
      )}

      {/* 2. Sleek Sliding Right-Hand Side Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 border-l border-slate-200 no-print">
          {/* Header */}
          <div className="bg-[#006B7A] text-white p-4 flex items-center justify-between shadow-md border-b border-[#005561]">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt="VyapaarSathi"
                className="w-9 h-9 rounded-full bg-white p-1 border border-[#79E4F3] shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight">VyapaarSathi AI Sahayak</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-[#A8EFF9] font-medium">Grounded Advisory • Multilingual</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Voice Mode Button */}
              {onOpenLiveVoice && (
                <button
                  type="button"
                  onClick={onOpenLiveVoice}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#A8EFF9] hover:text-white transition cursor-pointer"
                  title="Launch Live Voice Call"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              {/* Close Side Panel Button */}
              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="text-[11px] font-semibold whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-[#E5F6F8] hover:text-[#006B7A] hover:border-[#79E4F3] transition cursor-pointer shrink-0 shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <img
                    src="/favicon.svg"
                    alt="AI"
                    className="w-7 h-7 rounded-full bg-white p-0.5 border border-[#79E4F3] shrink-0 mt-0.5 shadow-2xs"
                  />
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#006B7A] text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  <div className={`flex items-center justify-between gap-3 mt-1.5 text-[10px] ${
                    msg.sender === 'user' ? 'text-[#A8EFF9]' : 'text-slate-400'
                  }`}>
                    {msg.sender === 'assistant' ? (
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className="flex items-center gap-1 text-[#006B7A] hover:text-[#004e59] font-bold cursor-pointer"
                        title="Listen Aloud"
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-rose-600 animate-pulse" />
                            <span className="text-rose-600 text-[9px]">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span className="text-[9px]">Listen</span>
                          </>
                        )}
                      </button>
                    ) : <span />}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 italic max-w-[80%]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#006B7A]" />
                <span>Consulting your credit dossier...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            {onOpenLiveVoice && (
              <button
                type="button"
                onClick={onOpenLiveVoice}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                title="Launch Live Voice"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about your loan, subsidies, or shop..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:border-[#006B7A] focus:outline-none transition text-slate-900"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 rounded-xl bg-[#006B7A] hover:bg-[#005561] disabled:opacity-40 text-white transition shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
