"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Send, SkipForward, Globe, X, Mic, MicOff, Video, VideoOff } from "lucide-react";
import Background from "@/components/Background";

const ICE = { 
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" }
  ] 
};

interface Msg { id: string; text: string; fromMe: boolean; }

export default function VideoChat() {
  const { isMatchmaking, setMatchmaking, matchFound, setMatch, clearMatch, roomId } = useStore();

  const [socket, setSocket] = useState<Socket | null>(null);
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const iceQueue = useRef<RTCIceCandidateInit[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  useEffect(() => { chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    if (matchFound) {
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      // If remote stream arrived before video element mounted, attach it now
      if (remoteRef.current && remoteStreamRef.current) {
        remoteRef.current.srcObject = remoteStreamRef.current;
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [matchFound]);

  useEffect(() => {
    const s = io("https://coolmeet-video-chat.onrender.com");
    setSocket(s);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localRef.current) localRef.current.srcObject = stream;
      }).catch(console.error);
    return () => { s.disconnect(); };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("match_found", async (data: { roomId: string; peerId: string; initiator: boolean }) => {
      iceQueue.current = [];
      remoteStreamRef.current = null;
      setMatch(data.roomId, data.peerId);
      socket.emit("join_room", data.roomId);
      setMsgs([{ id: "sys", text: "You are now connected with a stranger.", fromMe: false }]);

      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      if (localStream) localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
      
      pc.ontrack = e => { 
        remoteStreamRef.current = e.streams[0];
        if (remoteRef.current) remoteRef.current.srcObject = e.streams[0]; 
      };
      
      pc.onicecandidate = e => { if (e.candidate) socket.emit("ice-candidate", { roomId: data.peerId, candidate: e.candidate }); };

      if (data.initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId: data.peerId, sdp: pc.localDescription }); // Send directly to peer's socket ID
      }
    });

    socket.on("offer", async ({ sdp }) => {
      const pc = pcRef.current; if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const ans = await pc.createAnswer();
      await pc.setLocalDescription(ans);
      socket.emit("answer", { roomId: useStore.getState().peerId, sdp: pc.localDescription });
      
      // Flush ICE queue
      for (const cand of iceQueue.current) await pc.addIceCandidate(new RTCIceCandidate(cand));
      iceQueue.current = [];
    });

    socket.on("answer", async ({ sdp }) => { 
      const pc = pcRef.current; if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp)); 
      
      // Flush ICE queue
      for (const cand of iceQueue.current) await pc.addIceCandidate(new RTCIceCandidate(cand));
      iceQueue.current = [];
    });
    
    socket.on("ice-candidate", async ({ candidate }) => { 
      const pc = pcRef.current; if (!pc) return;
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)); 
      } else {
        iceQueue.current.push(candidate);
      }
    });
    
    socket.on("peer_left", () => doNext());
    socket.on("chat_message", ({ text }: { text: string }) => {
      setMsgs(p => [...p, { id: Date.now().toString(), text, fromMe: false }]);
    });

    return () => { ["match_found","offer","answer","ice-candidate","peer_left","chat_message"].forEach(e => socket.off(e)); };
  }, [socket, localStream]);

  const doStart = useCallback(() => { if (socket) { setMatchmaking(true); socket.emit("start_matchmaking"); } }, [socket]);
  const doStop  = useCallback(() => { if (socket) { setMatchmaking(false); socket.emit("stop_matchmaking"); } }, [socket]);
  const doNext  = useCallback(() => {
    const state = useStore.getState();
    if (socket && state.roomId) socket.emit("leave_room", state.roomId);
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (remoteRef.current) remoteRef.current.srcObject = null;
    remoteStreamRef.current = null;
    clearMatch(); setMsgs([]);
    if (socket) { setMatchmaking(true); socket.emit("start_matchmaking"); }
  }, [socket]);

  const sendMsg = () => {
    if (!input.trim() || !socket || !roomId) return;
    setMsgs(p => [...p, { id: Date.now().toString(), text: input.trim(), fromMe: true }]);
    socket.emit("chat_message", { roomId, text: input.trim() });
    setInput("");
  };

  const toggleMic = () => { const t = localStream?.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; setMicOn(t.enabled); } };
  const toggleCam = () => { const t = localStream?.getVideoTracks()[0]; if (t) { t.enabled = !t.enabled; setCamOn(t.enabled); } };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden relative">

      <Background />

      {/* ─────────── MAIN CONTENT AREA ─────────── */}
      <div className="flex-[3] flex gap-3 p-3 overflow-hidden min-h-0 relative z-10">

        {/* LEFT COLUMN: Stranger Video + Actions */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* STRANGER */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0e0e1c] border border-white/[0.05] group shadow-2xl">
            <AnimatePresence>
              {matchFound ? (
                <motion.video key="rv" ref={remoteRef} autoPlay playsInline
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <motion.div key="rw" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-5"
                >
                  {isMatchmaking ? (
                    <>
                      <div className="relative w-20 h-20">
                        {[0,1,2].map(i => (
                          <motion.div key={i} className="absolute inset-0 rounded-full border border-[#FF3CAC]/25"
                            animate={{ scale: [1, 3], opacity: [0.6, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                          />
                        ))}
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full"
                          style={{ background: "conic-gradient(from 0deg, transparent 60%, #FF6B35 80%, #FF3CAC 100%)" }}
                        />
                        <div className="absolute inset-[3px] rounded-full bg-[#0e0e1c] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#FF3CAC] animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-white/60 text-sm font-semibold tracking-wide">Finding someone...</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl border border-white/5 bg-white/[0.03] flex items-center justify-center mx-auto">
                        <Globe className="w-8 h-8 text-white/10" />
                      </div>
                      <p className="text-white/20 text-sm font-medium">Stranger&apos;s feed</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top-left label */}
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl"
                style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {matchFound ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_#4ade80] animate-pulse" /><span className="text-white/80">{fmt(duration)}</span></>
                ) : (
                  <span className="text-white/25">Stranger</span>
                )}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            {matchFound && (
              <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 4, repeat: Infinity }}
                style={{ boxShadow: "inset 0 0 40px rgba(255,60,172,0.12)" }}
              />
            )}
          </div>

          {/* SKIP / START BUTTON (BELOW STRANGER TILE) */}
          <div className="flex-shrink-0">
            <AnimatePresence mode="wait">
              {!isMatchmaking && !matchFound && (
                <motion.button key="start"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={doStart}
                  className="w-full flex items-center justify-center py-3.5 rounded-xl font-bold text-white relative overflow-hidden btn-glow shadow-lg"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #FF3CAC, #7B2FBE)", boxShadow: "0 0 20px rgba(255,60,172,0.3), inset 0 2px 0 rgba(255,255,255,0.2)" }}
                >
                  <span className="text-base font-extrabold tracking-tight drop-shadow-md">Start Chat</span>
                </motion.button>
              )}
              {isMatchmaking && !matchFound && (
                <motion.button key="stop"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={doStop}
                  className="w-full py-3.5 rounded-xl border border-white/20 bg-white/[0.08] text-white hover:bg-white/[0.12] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <X className="w-4 h-4 text-red-400" /> <span className="text-sm font-bold text-red-400 drop-shadow-md">Stop Search</span>
                </motion.button>
              )}
              {matchFound && (
                <motion.button key="next"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={doNext}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white relative overflow-hidden btn-glow shadow-lg"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #FF3CAC, #7B2FBE)", boxShadow: "0 0 20px rgba(255,60,172,0.3), inset 0 2px 0 rgba(255,255,255,0.2)" }}
                >
                  <SkipForward className="w-4 h-4 drop-shadow-md" />
                  <span className="text-base font-extrabold tracking-tight drop-shadow-md">Skip & Next</span>
                  <span className="ml-1 text-[10px] text-white/70 font-medium bg-black/20 px-2 py-0.5 rounded-full">ESC</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: You Video + Toggles */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* YOU */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0e0e1c] border border-white/[0.05] shadow-2xl">
            <video ref={localRef} autoPlay muted playsInline
              className={`absolute inset-0 w-full h-full object-cover mirror transition-opacity duration-300 ${camOn ? "opacity-100" : "opacity-0"}`}
            />
            {!camOn && (
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoOff className="w-10 h-10 text-white/10" />
              </div>
            )}
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl"
                style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_#60a5fa]" />
                <span className="text-white/80">You</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5, repeat: Infinity }}
              style={{ boxShadow: "inset 0 0 40px rgba(123,47,190,0.12)" }}
            />
          </div>

          {/* MIC / CAM TOGGLES (BELOW YOU TILE) */}
          <div className="flex-shrink-0 flex items-center gap-2 justify-end">
            <button onClick={toggleMic}
              className={`flex-1 max-w-[120px] py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm font-semibold ${micOn ? "text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/5" : "text-red-400 bg-red-500/20 border border-red-500/30"}`}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {micOn ? "Mic On" : "Mic Off"}
            </button>
            <button onClick={toggleCam}
              className={`flex-1 max-w-[120px] py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm font-semibold ${camOn ? "text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/5" : "text-red-400 bg-red-500/20 border border-red-500/30"}`}
            >
              {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              {camOn ? "Cam On" : "Cam Off"}
            </button>
          </div>
        </div>
      </div>

      {/* ─────────── CHAT AREA (Messages + Input) ─────────── */}
      <div className="flex-[1] px-3 pb-3 flex flex-col gap-2 relative z-10 min-h-0">
        
        {/* Chat Input (Moved to Top) */}
        <div className="flex-shrink-0 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl shadow-lg px-3 py-2.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMsg()}
            placeholder={matchFound ? "Type a message..." : "Connect with someone first..."}
            disabled={!matchFound}
            className="flex-1 bg-white/[0.02] hover:bg-white/[0.05] focus:bg-white/[0.08] border border-transparent focus:border-white/10 transition-all text-sm text-white placeholder-white/40 outline-none disabled:opacity-30 rounded-xl px-4 py-3 shadow-inner min-w-0"
          />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={sendMsg} disabled={!matchFound || !input.trim()}
            className="flex-shrink-0 p-3 rounded-xl transition-all shadow-md flex items-center justify-center"
            style={matchFound && input.trim() ? { background: "linear-gradient(135deg,#FF6B35,#FF3CAC)", opacity: 1 } : { background: "rgba(255,255,255,0.05)", opacity: 0.5, cursor: "not-allowed" }}
          >
            <Send className="w-4 h-4 text-white" style={{ transform: "translateX(1px)" }} />
          </motion.button>
        </div>

        {/* Chat Log / Note (Dynamic Height based on 5:1 ratio) */}
        <div className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-lg overflow-hidden flex flex-col min-h-0">
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            {msgs.length === 0 && (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-white/20 text-[11px] font-medium text-center">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF3CAC] font-bold">CoolMeet</span>.
                  {" "}<span className="text-white/10">·</span> Be respectful. No harassment.
                </p>
              </div>
            )}
            {msgs.map(m => (
              <div key={m.id} className={`flex items-start gap-2 ${m.fromMe ? "flex-row-reverse" : ""}`}>
                {!m.fromMe && (
                  <div className="flex-shrink-0 w-4 h-4 rounded-full mt-0.5 flex items-center justify-center text-[8px] font-bold text-white"
                    style={m.id === "sys" ? { background: "rgba(255,255,255,0.1)" } : { background: "linear-gradient(135deg,#FF6B35,#FF3CAC)" }}
                  >
                    {m.id === "sys" ? "·" : "S"}
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-1 rounded-2xl text-[11px] font-medium leading-relaxed
                  ${m.id === "sys" ? "text-white/30 italic bg-transparent px-1" :
                    m.fromMe ? "rounded-br-sm text-white" : "bg-white/[0.07] text-white/80 rounded-bl-sm"}`}
                  style={m.fromMe && m.id !== "sys" ? { background: "linear-gradient(135deg,#FF6B35,#FF3CAC)" } : {}}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx>{`.mirror { transform: scaleX(-1); }`}</style>
    </div>
  );
}
