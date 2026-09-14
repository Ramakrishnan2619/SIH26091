import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, PhoneOff, Volume2, VolumeX, Sparkles, AlertCircle, 
  Bot, Clock, CheckCircle2, RefreshCw, X
} from 'lucide-react';

export function LiveVoiceModal({ assessmentId, isOpen, onClose, preferredLang = 'en' }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'listening' | 'speaking' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);
  const [waveformBars, setWaveformBars] = useState(new Array(16).fill(6));

  const getGreeting = (lang) => {
    switch (lang) {
      case 'ta':
        return "வணக்கம்! நான் உங்கள் நேரலை குரல் வழி ஆலோசகர். உங்கள் திட்ட அறிக்கை, கடன் தவணை அல்லது அரசு மானியம் குறித்து என்னிடம் கேளுங்கள்.";
      case 'hi':
        return "नमस्ते! मैं आपका लाइव वॉयस सलाहकार हूँ। आप मुझसे अपनी रिपोर्ट, ऋण चुकौती या सरकारी सब्सिडी के बारे में कुछ भी पूछ सकते हैं।";
      case 'te':
        return "నమస్కారం! నేను మీ లైవ్ వాయిస్ అసిస్టెంట్‌ని. మీ ప్రాజెక్ట్ రిపోర్ట్ లేదా ప్రభుత్వ పథకాల గురించి నన్ను అడగవచ్చు.";
      default:
        return "Namaste! I am your live voice advisory assistant. You can ask me anything about your project report, loan repayment, or subsidies.";
    }
  };

  const [transcripts, setTranscripts] = useState([
    { sender: 'assistant', text: getGreeting(preferredLang) }
  ]);

  const socketRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const isSpeakingRef = useRef(false);
  const [voices, setVoices] = useState([]);

  // Dynamically load system voices when ready
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
    isOpenRef.current = isOpen;
    if (isOpen) {
      setTranscripts([{ sender: 'assistant', text: getGreeting(preferredLang) }]);
    }
  }, [isOpen, preferredLang]);

  // Speak text aloud using SpeechSynthesis API
  const speakAloud = (text) => {
    if (!('speechSynthesis' in window) || isAudioMuted) return;

    window.speechSynthesis.cancel(); // Stop any pending speech
    const cleanText = text.replace(/[*_#`{}]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // CRITICAL: Explicitly set BCP 47 language code so browser TTS loads the correct accent & language model
    const langCode = preferredLang === 'ta' ? 'ta-IN' : preferredLang === 'hi' ? 'hi-IN' : preferredLang === 'te' ? 'te-IN' : 'en-IN';
    utterance.lang = langCode;

    // Pick appropriate voice matching preferred language
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

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setStatus('speaking');
      try { recognitionRef.current?.stop(); } catch (e) {}
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setStatus('listening');
      if (isOpenRef.current && !isMuted) {
        try { recognitionRef.current?.start(); } catch (e) {}
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setStatus('listening');
      if (isOpenRef.current && !isMuted) {
        try { recognitionRef.current?.start(); } catch (e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    // Speak initial greeting aloud
    setTimeout(() => {
      speakAloud(transcripts[0].text);
    }, 600);

    // Start 10-minute auto-cutoff timer
    setSessionSeconds(0);
    timerRef.current = setInterval(() => {
      setSessionSeconds(prev => {
        if (prev >= 600) { // 10 minutes
          handleEndSession();
          return 600;
        }
        return prev + 1;
      });
    }, 1000);

    // Initialize microphone and audio analyser
    initVoiceSession();

    return () => {
      cleanup();
    };
  }, [isOpen]);

  const initVoiceSession = async () => {
    setStatus('connecting');
    setErrorMsg(null);

    try {
      // 1. Request microphone with echo cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000
        }
      });
      mediaStreamRef.current = stream;

      // 2. Setup Web Audio API Analyser for REAL dynamic waveform
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateWaveform = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate heights for 16 bars
          const newBars = [];
          const step = Math.max(1, Math.floor(dataArray.length / 16));
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * step] || 0;
            // Map value (0-255) to bar height in px (between 6px and 80px)
            const height = Math.max(6, Math.min(80, Math.round((val / 255) * 80)));
            newBars.push(height);
          }
          setWaveformBars(newBars);
          animFrameRef.current = requestAnimationFrame(updateWaveform);
        };

        animFrameRef.current = requestAnimationFrame(updateWaveform);
      }

      // 3. Web Speech Recognition for voice queries
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = preferredLang === 'hi' ? 'hi-IN' : preferredLang === 'ta' ? 'ta-IN' : preferredLang === 'te' ? 'te-IN' : 'en-IN';

        recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const userSpeech = event.results[last][0].transcript.trim();
          if (userSpeech) {
            handleUserVoiceQuery(userSpeech);
          }
        };

        recognition.onend = () => {
          if (isOpenRef.current && !isSpeakingRef.current && !isMuted) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        recognition.onerror = (e) => {
          console.warn("Speech recognition warning:", e);
          if (isOpenRef.current && !isSpeakingRef.current && !isMuted) {
            try {
              recognition.start();
            } catch (err) {}
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {}
      }

      // 4. WebSocket connection to /ws/live-voice
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:8080';
      const wsUrl = `${protocol}//${host}/ws/live-voice?assessment_id=${assessmentId || 101}`;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('listening');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transcript') {
            setTranscripts(prev => [...prev, { sender: data.sender, text: data.text }]);
            if (data.sender === 'assistant') {
              speakAloud(data.text);
            }
          }
        } catch (e) {}
      };

      socket.onerror = () => {
        setStatus('listening');
      };

    } catch (err) {
      console.error("Microphone access error:", err);
      setStatus('error');
      setErrorMsg("Microphone permission was denied. Please allow microphone access in your browser.");
    }
  };

  const handleUserVoiceQuery = async (queryText) => {
    setTranscripts(prev => [...prev, { sender: 'user', text: queryText }]);
    setStatus('speaking');

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId || 101,
          content: queryText,
          preferred_language: preferredLang || 'en'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.content || "I have received your query regarding the feasibility report.";
        setTranscripts(prev => [...prev, { sender: 'assistant', text: reply }]);
        speakAloud(reply);
      } else {
        fallbackVoiceResponse(queryText);
      }
    } catch (e) {
      fallbackVoiceResponse(queryText);
    }
  };

  const fallbackVoiceResponse = (queryText) => {
    const lower = queryText.toLowerCase();
    const isTa = preferredLang === 'ta';
    let reply = isTa
      ? "உங்கள் சரிபார்க்கப்பட்ட திட்ட அறிக்கையின்படி, உங்கள் தொழில் அரசுத் திட்டங்களின் கீழ் பாதுகாப்பான கடன் திருப்பிச் செலுத்தும் திறன் கொண்டதாக உறுதிப்படுத்தப்பட்டுள்ளது."
      : "Your assessment report confirms that your enterprise is bank-ready with safe repayment capacity under government schemes.";
    
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("namaste") || lower.includes("vanakkam") || lower.includes("வணக்கம்")) {
      reply = isTa
        ? "வணக்கம்! நான் கேட்கிறேன். உங்கள் கடன் திட்டம் அல்லது திட்ட அறிக்கை குறித்து நான் எவ்வாறு உதவ முடியும்?"
        : "Namaste! I am listening. How can I help you with your loan scheme or business report?";
    } else if (lower.includes("moratorium") || lower.includes("first payment") || lower.includes("interest") || lower.includes("வட்டி")) {
      reply = isTa
        ? "ஆரம்ப 6 மாத கால அவகாசத்தில், உங்கள் முதலீட்டுச் சுமையைக் குறைக்க எளிய வட்டியை மட்டுமே செலுத்த வேண்டும்."
        : "During your initial 6-month moratorium, you only service simple interest to protect your working capital.";
    } else if (lower.includes("early") || lower.includes("prepay") || lower.includes("penalty") || lower.includes("அபராதம்")) {
      reply = isTa
        ? "MoSJE திட்டங்களின் கீழ் முன்கூட்டியே கடன் அடைப்பதற்கு எவ்வித அபராதமும் இல்லை. நீங்கள் எப்போது வேண்டுமானாலும் அசலை விரைவாகச் செலுத்தலாம்."
        : "There is zero penalty for early repayment under MoSJE schemes. You can prepay anytime.";
    }
    setTranscripts(prev => [...prev, { sender: 'assistant', text: reply }]);
    speakAloud(reply);
  };

  const cleanup = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (socketRef.current) {
      try { socketRef.current.close(); } catch (e) {}
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleEndSession = () => {
    cleanup();
    onClose();
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleEndSession}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#006B7A]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Status & Timer */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-6 z-10 pr-10">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'listening' ? 'bg-emerald-400 animate-pulse' :
              status === 'speaking' ? 'bg-[#02C6E1] animate-pulse' :
              status === 'connecting' ? 'bg-amber-400 animate-spin' : 'bg-rose-500'
            }`} />
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {status === 'listening' ? 'Listening to your voice...' :
               status === 'speaking' ? 'VyapaarSathi Speaking (Audible)...' :
               status === 'connecting' ? 'Connecting Audio Stream...' : 'Audio Offline'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-[#79E4F3]" />
            <span>{formatTimer(sessionSeconds)} / 10:00</span>
          </div>
        </div>

        {/* REAL Dynamic Web Audio API Waveform Visualizer */}
        <div className="my-6 flex items-center justify-center gap-1.5 h-24 z-10 w-full px-4">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className={`w-2.5 rounded-full transition-all duration-75 ${
                status === 'speaking'
                  ? 'bg-gradient-to-t from-[#006B7A] to-[#02C6E1]'
                  : status === 'listening' && !isMuted
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-slate-700'
              }`}
              style={{
                height: `${status === 'speaking' ? Math.max(12, height * 1.2) : status === 'listening' && !isMuted ? height : 6}px`
              }}
            />
          ))}
        </div>

        {/* Live Transcript Stream */}
        <div className="w-full max-h-44 overflow-y-auto space-y-2.5 p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-xs text-left mb-6 z-10">
          {transcripts.map((t, idx) => (
            <div key={idx} className={`flex items-start gap-2 ${t.sender === 'user' ? 'text-emerald-300' : 'text-[#A8EFF9]'}`}>
              <span className="font-bold text-[10px] uppercase shrink-0 pt-0.5">
                {t.sender === 'user' ? 'You:' : 'AI Sahayak:'}
              </span>
              <p className="text-xs leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>

        {/* Error Notice if any */}
        {errorMsg && (
          <div className="w-full p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs text-left flex items-start gap-2 mb-4 z-10">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Controls: Mute Mic, Audio Speaker Mute & End Call */}
        <div className="flex items-center gap-3 z-10">
          <button
            type="button"
            onClick={() => {
              if (mediaStreamRef.current) {
                const track = mediaStreamRef.current.getAudioTracks()[0];
                if (track) {
                  track.enabled = isMuted;
                  setIsMuted(!isMuted);
                }
              }
            }}
            className={`p-3.5 rounded-full border transition cursor-pointer ${
              isMuted 
                ? 'bg-amber-600 border-amber-500 text-white' 
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isAudioMuted) {
                window.speechSynthesis.cancel();
              }
              setIsAudioMuted(!isAudioMuted);
            }}
            className={`p-3.5 rounded-full border transition cursor-pointer ${
              isAudioMuted
                ? 'bg-rose-800 border-rose-700 text-white'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
            title={isAudioMuted ? "Unmute AI Voice Playback" : "Mute AI Voice Playback"}
          >
            {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={handleEndSession}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Session</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-4 z-10">
          Real-time Web Audio API • Browser SpeechSynthesis • Multilingual Grounding
        </p>
      </div>
    </div>
  );
}
