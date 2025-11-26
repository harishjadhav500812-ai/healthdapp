
import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { User, Stethoscope, ArrowRight, ShieldCheck, Database, Lock, Globe, Zap, Cpu, Activity, Scan, Fingerprint, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppPath } from '../types';

interface LandingProps {
  onNavigate: (path: AppPath) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-neonCyan/30 selection:text-white overflow-x-hidden">
      
      {/* HUD Decorative Lines */}
      <div className="fixed top-24 left-8 bottom-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block pointer-events-none"></div>
      <div className="fixed top-24 right-8 bottom-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block pointer-events-none"></div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-12 px-4 md:px-12 flex flex-col items-center justify-center min-h-[85vh]">
        
        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto w-full relative">
          
          {/* Top Label */}
          <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-center mb-8"
          >
             <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-neonCyan/20 bg-neonCyan/5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-xs font-mono text-neonCyan tracking-widest uppercase">System Operational • v2.4.0</span>
             </div>
          </motion.div>

          {/* Big Typography */}
          <div className="text-center relative z-20">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 leading-[0.9] mb-6"
            >
              IMMUTABLE<br/>
              <span className="text-neonCyan drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">LIFE LEDGER</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
            >
              Decentralized biological data verification protocol. <br/>
              <span className="text-white font-medium">Own your DNA. Control your access. Verified forever.</span>
            </motion.p>
          </div>

          {/* Floating HUD Elements */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1 }}
             className="absolute top-10 left-0 hidden lg:block"
          >
             <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-500 border-l border-slate-700 pl-3">
               <span>LAT: 34.0522 N</span>
               <span>LNG: 118.2437 W</span>
               <span>NODE: US-WEST-1</span>
             </div>
          </motion.div>

           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1 }}
             className="absolute top-10 right-0 hidden lg:block text-right"
          >
             <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-500 border-r border-slate-700 pr-3">
               <span>BLOCK HEIGHT: #9,281,102</span>
               <span>HASH RATE: 145 TH/s</span>
               <span>DIFFICULTY: 24.12 T</span>
             </div>
          </motion.div>
          
        </div>

        {/* --- PORTAL TERMINALS --- */}
        <div className="w-full max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 relative z-20">
          
          {/* Patient Terminal */}
          <motion.div 
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.6 }}
             onClick={() => onNavigate('/patient/login')}
             className="group relative h-[360px] bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-neonCyan/50 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 flex flex-col justify-between p-8"
          >
             {/* Scanning Effect */}
             <div className="absolute inset-0 bg-gradient-to-b from-neonCyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 translate-y-[-100%] group-hover:translate-y-[100%] transition-all duration-1000 pointer-events-none z-0"></div>
             
             {/* HUD Corners */}
             <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20 rounded-tr-xl group-hover:border-neonCyan/50 transition-colors"></div>
             <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-white/20 rounded-bl-xl group-hover:border-neonCyan/50 transition-colors"></div>

             <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 group-hover:bg-neonCyan/20 group-hover:border-neonCyan/50 transition-all duration-300">
                   <Fingerprint className="w-8 h-8 text-slate-300 group-hover:text-neonCyan transition-colors" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-neonCyan transition-colors">Patient Access</h3>
                <p className="text-slate-400 text-sm max-w-xs leading-relaxed group-hover:text-slate-300">
                  Manage encrypted health records, approve smart contract requests, and view distributed logs.
                </p>
             </div>

             <div className="relative z-10 flex items-center justify-between mt-auto pt-6 border-t border-white/5 group-hover:border-neonCyan/20 transition-colors">
                <span className="text-xs font-mono text-slate-500 group-hover:text-neonCyan">SECURE_GATEWAY_01</span>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neonCyan group-hover:text-black transition-all">
                   <ArrowRight className="w-4 h-4" />
                </div>
             </div>
          </motion.div>

          {/* Doctor Terminal */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.8 }}
             onClick={() => onNavigate('/doctor/login')}
             className="group relative h-[360px] bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-neonPurple/50 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 flex flex-col justify-between p-8"
          >
             {/* Scanning Effect */}
             <div className="absolute inset-0 bg-gradient-to-b from-neonPurple/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 translate-y-[-100%] group-hover:translate-y-[100%] transition-all duration-1000 pointer-events-none z-0"></div>
             
             {/* HUD Corners */}
             <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20 rounded-tr-xl group-hover:border-neonPurple/50 transition-colors"></div>
             <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-white/20 rounded-bl-xl group-hover:border-neonPurple/50 transition-colors"></div>

             <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 group-hover:bg-neonPurple/20 group-hover:border-neonPurple/50 transition-all duration-300">
                   <Scan className="w-8 h-8 text-slate-300 group-hover:text-neonPurple transition-colors" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-neonPurple transition-colors">Provider Portal</h3>
                <p className="text-slate-400 text-sm max-w-xs leading-relaxed group-hover:text-slate-300">
                  Verify patient identities, query the distributed ledger, and request record access.
                </p>
             </div>

             <div className="relative z-10 flex items-center justify-between mt-auto pt-6 border-t border-white/5 group-hover:border-neonPurple/20 transition-colors">
                <span className="text-xs font-mono text-slate-500 group-hover:text-neonPurple">SECURE_GATEWAY_02</span>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neonPurple group-hover:text-white transition-all">
                   <ArrowRight className="w-4 h-4" />
                </div>
             </div>
          </motion.div>

        </div>

      </section>

      {/* --- TECH SPECS TICKER --- */}
      <section className="bg-black/40 border-y border-white/5 backdrop-blur-sm overflow-hidden py-4">
        <div className="animate-shimmer whitespace-nowrap flex items-center gap-12 text-slate-500 font-mono text-xs tracking-widest uppercase">
           <span className="flex items-center gap-2"><Hexagon className="w-3 h-3 text-neonCyan" /> IPFS Distributed Storage</span>
           <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-neonPurple" /> Real-time Lamport Consensus</span>
           <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-green-400" /> AES-256-GCM Encryption</span>
           <span className="flex items-center gap-2"><Globe className="w-3 h-3 text-blue-400" /> Global Node Replication</span>
           <span className="flex items-center gap-2"><Database className="w-3 h-3 text-orange-400" /> Immutable Audit Logs</span>
           {/* Duplicate for loop */}
           <span className="flex items-center gap-2"><Hexagon className="w-3 h-3 text-neonCyan" /> IPFS Distributed Storage</span>
           <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-neonPurple" /> Real-time Lamport Consensus</span>
           <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-green-400" /> AES-256-GCM Encryption</span>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { 
                 title: "Sovereign Identity", 
                 desc: "Your biometric data is your private key. No central authority controls your access.",
                 icon: Fingerprint,
                 color: "text-neonCyan" 
               },
               { 
                 title: "Zero-Knowledge Proof", 
                 desc: "Prove your eligibility for treatment without revealing your entire medical history.",
                 icon: Lock,
                 color: "text-neonPurple" 
               },
               { 
                 title: "Smart Interoperability", 
                 desc: "Automated smart contracts translate your records for any provider, anywhere.",
                 icon: Cpu,
                 color: "text-neonIndigo" 
               }
            ].map((item, i) => (
              <GlassCard key={i} className="p-8 group hover:bg-white/5 border-white/5 transition-all">
                 <div className={`w-12 h-12 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform">{item.title}</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                 
                 <div className="mt-6 w-full h-px bg-gradient-to-r from-white/10 to-transparent group-hover:from-white/30 transition-all"></div>
              </GlassCard>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};
