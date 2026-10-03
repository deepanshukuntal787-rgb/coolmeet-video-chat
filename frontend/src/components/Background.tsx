"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ["#FF6B35", "#7B2FBE", "#00D4FF", "#FF3CAC"];

export default function Background() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate 40 random floating elements
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 40 + 10, // 10px to 50px
      x: Math.random() * 100, // 0 to 100%
      y: Math.random() * 100, // 0 to 100%
      duration: Math.random() * 20 + 15, // 15s to 35s
      delay: Math.random() * -20, // Start at different animation phases
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      blur: Math.random() * 15 + 5, // 5px to 20px blur
      type: Math.random() > 0.5 ? "circle" : "square",
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#04040A]">
      
      {/* Beautiful Lo-Fi Cyberpunk Background with Breathing Effect */}
      <motion.div 
        className="absolute inset-[-5%] bg-cover bg-center bg-no-repeat mix-blend-screen opacity-50"
        style={{ backgroundImage: 'url("/lofi_couple_bg.jpg")' }}
        animate={{ scale: [1, 1.05, 1], rotate: [0, 0.5, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dark gradient overlay for extreme contrast and UI legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060610]/90 via-[#060610]/50 to-[#060610]/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FF3CAC]/10 via-transparent to-transparent opacity-50" />

      {/* Ambient Large Gradient Orbs (Pulse Slowly) */}
      <div className="absolute inset-0 mix-blend-screen">
        <motion.div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#FF6B35] opacity-[0.03] blur-[100px]" 
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }} transition={{ duration: 15, repeat: Infinity }} />
        <motion.div className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#7B2FBE] opacity-[0.03] blur-[120px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 18, repeat: Infinity, delay: 2 }} />
        <motion.div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[#00D4FF] opacity-[0.04] blur-[100px]"
          animate={{ scale: [1, 1.4, 1], opacity: [0.04, 0.07, 0.04] }} transition={{ duration: 20, repeat: Infinity, delay: 5 }} />
      </div>

      {/* Cyber Dust Particles (Rising Embers) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width: p.size * 0.7, // Slightly smaller for elegance
            height: p.size * 0.7,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            borderRadius: "50%",
            filter: `blur(${p.blur * 0.8}px)`,
            opacity: 0.15,
            mixBlendMode: "screen",
            boxShadow: `0 0 ${p.size}px ${p.color}`, // Added inner glow
          }}
          animate={{
            y: [0, -300 - Math.random() * 200], // Always float upwards like embers
            x: [0, Math.random() * 100 - 50, 0], // Gentle sway
            scale: [0, 1.5, 0], // Fade in and out
          }}
          transition={{
            duration: p.duration * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
      
      {/* Animated Cyber Grid */}
      <motion.div className="absolute inset-[-100%] opacity-[0.08]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          transformOrigin: "center center",
          transform: "perspective(500px) rotateX(60deg) translateY(-100px)",
        }} 
      />
      
    </div>
  );
}
