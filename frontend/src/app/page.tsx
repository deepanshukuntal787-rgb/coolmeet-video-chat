"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoChat from "@/components/VideoChat";
import { Globe, Zap, Shield, ArrowRight, Users } from "lucide-react";
import Background from "@/components/Background";

export default function Home() {
  const [entered, setEntered] = useState(false);

  if (entered) {
    return (
      <AnimatePresence>
        <motion.main
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex h-screen flex-col bg-[#060610] text-white overflow-hidden"
        >
          {/* Ambient gradient orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#FF6B35] opacity-[0.05] blur-[120px] animate-blob" />
            <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#7B2FBE] opacity-[0.05] blur-[120px] animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-[#00D4FF] opacity-[0.03] blur-[120px] animate-blob animation-delay-4000" />
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none z-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }} />

          <Background />

          {/* App Header */}
          <motion.header
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="flex-shrink-0 h-[65px] px-6 flex justify-between items-center border-b border-white/[0.06] relative z-50"
            style={{ background: "linear-gradient(180deg, rgba(6,6,16,0.95) 0%, rgba(6,6,16,0.8) 100%)", backdropFilter: "blur(20px)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/5 via-transparent to-[#7B2FBE]/5 pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF6B35] via-[#FF3CAC] to-[#7B2FBE] flex items-center justify-center shadow-[0_0_20px_rgba(255,60,172,0.5)]">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Cool<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF3CAC]">Meet</span>
              </span>
              <div className="hidden md:flex items-center gap-1.5 ml-4 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-green-400">Online</span>
              </div>
            </div>

            <button
              onClick={() => setEntered(false)}
              className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all active:scale-95 relative z-10"
            >
              Leave
            </button>
          </motion.header>

          <div className="flex-1 relative overflow-hidden">
            <VideoChat />
          </div>
        </motion.main>
      </AnimatePresence>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060610] text-white flex flex-col noise">
      <Background />

      {/* Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex items-center justify-between px-6 py-3 bg-white/[0.04] backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF6B35] via-[#FF3CAC] to-[#7B2FBE] flex items-center justify-center shadow-[0_0_20px_rgba(255,60,172,0.4)]">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Cool<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF3CAC]">Meet</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
            {["Product", "Features", "Privacy", "Blog"].map((item) => (
              <span key={item} className="hover:text-white cursor-pointer transition-colors duration-200">{item}</span>
            ))}
          </div>
          <button
            onClick={() => setEntered(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF3CAC] text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,60,172,0.3)]"
          >
            Start Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20 min-h-screen">
        


        <div className="relative z-10 max-w-6xl mx-auto text-center flex flex-col items-center mt-8 gap-16 md:gap-24">

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/80">No Sign-up · No Login · Instant Access</span>
          </motion.div>

          <motion.h1
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-[120px] font-black tracking-tighter leading-[1.1]"
          >
            Meet Anyone.
            <br />
            <span className="animated-gradient-text">Anywhere.</span>
            <br />
            <span className="text-white/20">Anytime.</span>
          </motion.h1>

          {/* CTA & Online Status Container */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="flex flex-col items-center gap-10 w-full"
          >
            {/* The Main CTA Button */}
            <motion.button
              onClick={() => setEntered(true)}
              className="group relative w-full max-w-[340px] py-5 rounded-[2rem] font-black text-2xl text-white overflow-hidden btn-glow flex items-center justify-center"
              style={{ 
                background: "linear-gradient(-45deg, #FF6B35, #FF3CAC, #7B2FBE, #00D4FF)",
                backgroundSize: "400% 400%",
                boxShadow: "0 0 60px rgba(255,60,172,0.5), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -4px 12px rgba(0,0,0,0.3)" 
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, ease: "linear", repeat: Infinity }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 80px rgba(255,60,172,0.7), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -4px 12px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Shimmer line passing through */}
              <motion.div 
                className="absolute inset-0 z-0 opacity-50"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", width: "50%", transform: "skewX(-20deg)" }}
                animate={{ left: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
              />
              
              <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-lg w-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Globe className="w-7 h-7 flex-shrink-0" />
                </motion.div>
                Start Chatting
              </span>
            </motion.button>

            {/* Online Counter Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="inline-flex flex-col items-center justify-center min-w-[180px] px-8 py-3 rounded-full border border-white/[0.05] bg-white/[0.02] backdrop-blur-md shadow-none mt-4"
            >
              <span className="text-white/70 text-sm font-semibold leading-none mb-1.5">1 Lakh+ Users</span>
              <span className="text-green-400/80 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
                Online Now
              </span>
            </motion.div>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mt-24"
          >
            {[
              { icon: Zap, label: "Instant Matching", color: "#FF6B35" },
              { icon: Shield, label: "Encrypted", color: "#7B2FBE" },
              { icon: Globe, label: "50+ Countries", color: "#00D4FF" },
              { icon: Users, label: "No Account Needed", color: "#FF3CAC" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="group relative flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.01] border border-white/[0.03] hover:border-white/10 transition-all cursor-default overflow-hidden">
                <Icon className="w-3.5 h-3.5 relative z-10 opacity-70" style={{ color }} />
                <span className="text-xs font-medium text-white/40 group-hover:text-white/70 relative z-10 transition-colors">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
