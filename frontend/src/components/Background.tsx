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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#04040A]">
      
      {/* Static Beautiful Lo-Fi Cyberpunk Background (Removed animations and mix-blend to fix mobile flickering) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: 'url("/lofi_couple_bg.jpg")' }}
      />

      {/* Dark gradient overlay for extreme contrast and UI legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060610]/95 via-[#060610]/60 to-[#060610]/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FF3CAC]/10 via-transparent to-transparent opacity-30" />

      {/* Static Ambient Large Gradient Orbs (No animations or heavy blur to save mobile GPU) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#FF6B35] opacity-[0.04]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#00D4FF] opacity-[0.04]" />
      
      {/* Static Cyber Grid */}
      <div className="absolute inset-[-100%] opacity-[0.05]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          transformOrigin: "center center",
          transform: "perspective(500px) rotateX(60deg) translateY(-100px)",
        }} 
      />
      
    </div>
  );
}
