
import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ShieldCheck, ArrowLeft, Database, HardDrive, Clock, Hash, Check, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppPath } from '../types';

interface BlockchainVerifyProps {
  onNavigate: (view: AppPath) => void;
}

export const BlockchainVerify: React.FC<BlockchainVerifyProps> = ({ onNavigate }) => {
  const [hexData, setHexData] = useState<string[]>([]);

  // Generate some fake hex data
  useEffect(() => {
    const generateHex = () => {
      const rows = [];
      for (let i = 0; i < 20; i++) {
        let row = `0x${(i * 16).toString(16).padStart(4, '0').toUpperCase()}  `;
        for (let j = 0; j < 8; j++) {
          row += Math.floor(Math.random() * 255).toString(16).padStart(2, '0').toUpperCase() + ' ';
        }
        row += ' ';
        for (let j = 0; j < 8; j++) {
          row += Math.floor(Math.random() * 255).toString(16).padStart(2, '0').toUpperCase() + ' ';
        }
        rows.push(row);
      }
      setHexData(rows);
    };
    generateHex();
    const interval = setInterval(generateHex, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[85vh] p-4 flex flex-col max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate('/patient/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
             <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Back to Records</span>
        </button>
        <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-green-400 font-bold text-sm tracking-wide">VERIFIED ON-CHAIN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        {/* Left Column: Verification Details */}
        <div className="space-y-6">
          <GlassCard className="p-8 border-t-4 border-t-green-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Record Verification</h2>
                <p className="text-slate-400 text-sm">Immutable Proof of Existence</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-green-500/30 transition-colors group">
                <div className="flex items-center gap-3 text-slate-400 mb-1">
                  <Hash className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-bold">Record Hash (SHA-256)</span>
                </div>
                <div className="font-mono text-sm text-green-400 break-all group-hover:text-green-300 transition-colors">
                  0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-colors group">
                <div className="flex items-center gap-3 text-slate-400 mb-1">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-bold">IPFS Content ID</span>
                </div>
                <div className="font-mono text-sm text-purple-400 break-all group-hover:text-purple-300 transition-colors">
                  QmX7yP3c4987f2k9j38d7s6g5h4j3k2l1m0n9b8v7c6x5z
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Database className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">Block Number</span>
                  </div>
                  <div className="font-mono text-lg text-white font-bold">#4,092</div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">Timestamp</span>
                  </div>
                  <div className="font-mono text-lg text-white font-bold">1697558400</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-white/5 transition-colors">
                  <span className="text-slate-400">Owner Address</span>
                  <span className="font-mono text-blue-300">0x71C...9A21</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-white/5 transition-colors">
                  <span className="text-slate-400">Validator Node</span>
                  <span className="font-mono text-yellow-300">0x3B2...8C10</span>
                </div>
              </div>

            </div>
          </GlassCard>
        </div>

        {/* Right Column: Visualizations */}
        <div className="flex flex-col gap-6">
          
          {/* Node Grid Animation */}
          <GlassCard className="flex-1 min-h-[300px] relative overflow-hidden bg-slate-900 border-slate-800">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="border border-white/5 relative">
                   <motion.div 
                     initial={{ opacity: 0.1 }}
                     animate={{ opacity: [0.1, 0.5, 0.1] }}
                     transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
                     className="absolute inset-2 bg-green-500/20 rounded-full"
                   />
                   {i % 7 === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                     </div>
                   )}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-slate-900/80 backdrop-blur border border-green-500/30 px-6 py-3 rounded-full">
                <p className="text-green-400 font-mono text-xs tracking-[0.2em] animate-pulse">NETWORK SYNCHRONIZED</p>
              </div>
            </div>
          </GlassCard>

          {/* Hex Viewer */}
          <div className="bg-black/80 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden relative h-64 shadow-inner shadow-black">
             <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-2">
               <Terminal className="w-3 h-3" />
               <span>ledger_data.hex</span>
             </div>
             <div className="text-green-500/80 leading-relaxed opacity-80 overflow-hidden h-full select-none">
                {hexData.map((row, i) => (
                  <div key={i} className="hover:bg-green-500/10 hover:text-green-400 cursor-crosshair transition-colors">
                    <span className="text-slate-600 select-none mr-4">{row.substring(0, 6)}</span>
                    {row.substring(6)}
                  </div>
                ))}
             </div>
             <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
          </div>

        </div>

      </div>
    </div>
  );
};
