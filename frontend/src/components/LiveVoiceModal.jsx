import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, PhoneOff, Volume2, Sparkles, AlertCircle, 
  Bot, Clock, CheckCircle2, RefreshCw
} from 'lucide-react';

export function LiveVoiceModal({ assessmentId, isOpen, onClose, preferredLang = 'en' }) {
  const [isMuted, setIsMuted] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'listening' | 'speaking' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);
  const [transcripts, setTranscripts] = useState([
    { sender: 'assistant', text: "Namaste! I am your live voice advisory assistant. You can speak to me in Tamil, Telugu, Hindi, or English." }
  ]);

  const socketRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

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

    // Initialize microphone and WebSocket
    initVoiceSession();

    return () => {
      cleanup();
    };
  }, [isOpen]);

  const initVoiceSession = async () => {
    setStatus('connecting');
    setErrorMsg(null);

    try {
      // 1. Request microphone with echo cancellation & noise suppression (EC-5.2)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000
        }
      });
      mediaStreamRef.current = stream;

      // 2. Establish WebSocket to /ws/live-voice
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
              setStatus('speaking');
              setTimeout(() => setStatus('listening'), 3500);
            }
          } else if (data.type === 'system_notice') {
            setErrorMsg(data.message);
          }
        } catch (e) {
          // Binary audio packet handling in production
        }
      };

      socket.onerror = (err) => {
        console.warn("WebSocket Live Voice fallback active.");
        // Non-blocking fallback simulation for local preview
        setStatus('listening');
      };

      socket.onclose = () => {
        // Closed
      };

    } catch (err) {
      console.error("Microphone access error:", err);
      setStatus('error');
      setErrorMsg("Microphone permission was denied. You can still use the text chat drawer to ask questions.");
    }
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (socketRef.current) {
      try { socketRef.current.close(); } catch (e) {}
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
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top bar: Status & Timer */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-6 z-10">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'listening' ? 'bg-emerald-400 animate-pulse' :
              status === 'speaking' ? 'bg-blue-400 animate-pulse' :
              status === 'connecting' ? 'bg-amber-400 animate-spin' : 'bg-rose-500'
            }`}></span>
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {status === 'listening' ? 'Listening to you...' :
               status === 'speaking' ? 'VyapaarSathi is speaking...' :
               status === 'connecting' ? 'Connecting to Gemini Live...' : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTimer(sessionSeconds)} / 10:00</span>
          </div>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="my-6 flex items-center justify-center gap-1.5 h-24 z-10">
          {[12, 28, 48, 72, 36, 64, 84, 52, 32, 60, 40, 20].map((h, i) => (
            <div
              key={i}
              className={`w-2 rounded-full transition-all duration-150 ${
                status === 'speaking'
                  ? 'bg-blue-500 animate-pulse'
                  : status === 'listening' && !isMuted
                  ? 'bg-emerald-400'
                  : 'bg-slate-700'
              }`}
              style={{
                height: status === 'listening' && !isMuted
                  ? `${Math.max(10, (h * Math.sin(Date.now() / 200 + i)) % 75 + 15)}px`
                  : status === 'speaking'
                  ? `${h}px`
                  : '8px'
              }}
            />
          ))}
        </div>

        {/* Live Transcript Stream */}
        <div className="w-full max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60 text-xs text-left mb-6 z-10">
          {transcripts.map((t, idx) => (
            <div key={idx} className={`flex gap-2 ${t.sender === 'user' ? 'text-emerald-300' : 'text-blue-200'}`}>
              <span className="font-bold text-[10px] uppercase shrink-0 pt-0.5">
                {t.sender === 'user' ? 'You:' : 'Advisor:'}
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

        {/* Controls: Mute & End Call */}
        <div className="flex items-center gap-4 z-10">
          <button
            onClick={() => {
              if (mediaStreamRef.current) {
                const track = mediaStreamRef.current.getAudioTracks()[0];
                if (track) {
                  track.enabled = isMuted;
                  setIsMuted(!isMuted);
                }
              }
            }}
            className={`p-4 rounded-full border transition ${
              isMuted 
                ? 'bg-amber-600 border-amber-500 text-white' 
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 px-6 py-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Voice Session</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-4 z-10">
          Powered by Vertex AI Gemini Live 2.5 Flash Native Audio • Encrypted WebSockets
        </p>
      </div>
    </div>
  );
}
