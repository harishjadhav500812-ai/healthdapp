
import React, { useEffect, useState, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  ArrowLeft, Activity, Server, Database, Terminal, 
  Cpu, Globe, ShieldCheck, AlertTriangle, Zap,
  Layers, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppPath } from '../types';

interface SystemMonitorProps {
  onNavigate: (view: AppPath) => void;
}

const NODES = [
  { id: 'node-1', role: 'LEADER', region: 'US-East' },
  { id: 'node-2', role: 'FOLLOWER', region: 'US-West' },
  { id: 'node-3', role: 'FOLLOWER', region: 'EU-Central' },
  { id: 'node-4', role: 'FOLLOWER', region: 'Asia-South' },
  { id: 'node-5', role: 'FOLLOWER', region: 'SA-East' },
];

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ onNavigate }) => {
  const [latencyHistory, setLatencyHistory] = useState<number[]>(new Array(20).fill(20));
  const [grpcLogs, setGrpcLogs] = useState<string[]>([]);
  const [events, setEvents] = useState<{id: number, type: string, msg: string}[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate real-time metrics
    const interval = setInterval(() => {
      // Latency Jitter
      setLatencyHistory(prev => {
        const newVal = Math.max(10, Math.min(100, prev[prev.length - 1] + (Math.random() - 0.5) * 20));
        return [...prev.slice(1), newVal];
      });

      // Random Logs
      if (Math.random() > 0.6) {
        const operations = ['MsgAppendEntries', 'RequestVote', 'InstallSnapshot', 'CheckTxHash', 'IPFS_Pin'];
        const status = ['OK', 'OK', 'OK', 'OK', 'OK', 'PENDING'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        const st = status[Math.floor(Math.random() * status.length)];
        const log = `[gRPC] /healthchain.Consensus/${op} status=${st} time=${Math.floor(Math.random() * 50)}ms`;
        setGrpcLogs(prev => [...prev.slice(-15), log]);
      }

      // Random Events
      if (Math.random() > 0.8) {
        const types = ['UPLOAD', 'ACCESS', 'CONSENSUS'];
        const msgs = ['New Record Block Mined', 'Doctor Access Grant Verified', 'Leader Heartbeat Sent'];
        const idx = Math.floor(Math.random() * types.length);
        setEvents(prev => [...prev.slice(-4), { id: Date.now(), type: types[idx], msg: msgs[idx] }]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [grpcLogs]);

  return (
    <div className="min-h-[85vh] p-4 flex flex-col gap-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('/doctor/dashboard')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <h2 className="text-2xl font-bold flex items-center gap-3">
             <Activity className="text-neonBlue" /> System Monitor
          </h2>
        </div>
        <div className="flex gap-4">
           <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs font-bold flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> SYSTEM HEALTHY
           </div>
        </div>
      </div>

      {/* Top Row: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Leader Status */}
        <GlassCard className="p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="w-16 h-16 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Raft Leader</span>
            <span className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-neonBlue">Node-1</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">TERM 42</span>
            </span>
            <span className="text-[10px] text-slate-500 mt-2">Uptime: 14d 2h 12m</span>
          </div>
        </GlassCard>

        {/* Replica Set */}
        <GlassCard className="p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database className="w-16 h-16 text-green-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">MongoDB Replicas</span>
            <div className="flex items-center gap-1 mt-1">
               <div className="w-8 h-8 rounded bg-green-500/20 border border-green-500/40 flex items-center justify-center text-xs font-bold text-green-400" title="Primary">P</div>
               <div className="w-8 h-8 rounded bg-slate-700/50 border border-slate-600 flex items-center justify-center text-xs text-slate-400" title="Secondary">S1</div>
               <div className="w-8 h-8 rounded bg-slate-700/50 border border-slate-600 flex items-center justify-center text-xs text-slate-400" title="Secondary">S2</div>
            </div>
            <span className="text-[10px] text-green-400 mt-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Write Concern: Majority</span>
          </div>
        </GlassCard>

        {/* Avg Latency */}
        <GlassCard className="p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avg Latency</span>
            <span className="text-2xl font-bold text-white">
              {Math.round(latencyHistory[latencyHistory.length - 1])} <span className="text-sm text-slate-500 font-normal">ms</span>
            </span>
            <div className="h-1 w-full bg-slate-800 mt-3 rounded-full overflow-hidden">
               <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${Math.min(100, latencyHistory[latencyHistory.length - 1])}%` }}></div>
            </div>
          </div>
        </GlassCard>

        {/* Active Requests */}
        <GlassCard className="p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu className="w-16 h-16 text-orange-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Throughput</span>
            <span className="text-2xl font-bold text-white">
              1,240 <span className="text-sm text-slate-500 font-normal">req/s</span>
            </span>
            <span className="text-[10px] text-orange-400 mt-2">Load: Moderate</span>
          </div>
        </GlassCard>
      </div>

      {/* Middle Row: Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Cluster Map */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col bg-slate-900/50">
           <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-6">
             <Server className="w-4 h-4 text-neonBlue" /> Cluster Topology
           </h3>
           <div className="flex-1 relative flex items-center justify-center">
              {/* Central Leader */}
              <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] relative z-10 border-4 border-slate-900">
                  <Globe className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-blue-400 bg-slate-900/80 px-2 py-0.5 rounded">
                  Leader (US-East)
                </div>
                {/* Pulse Rings */}
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_3s_linear_infinite]"></div>
              </div>

              {/* Connecting Lines & Followers */}
              {NODES.filter(n => n.role === 'FOLLOWER').map((node, i) => {
                 const angle = (i * (360 / 4)) * (Math.PI / 180);
                 const radius = 180; // Distance from center
                 const x = Math.cos(angle) * radius;
                 const y = Math.sin(angle) * radius;
                 
                 return (
                   <React.Fragment key={node.id}>
                     {/* Line */}
                     <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                       <line 
                         x1="50%" y1="50%" 
                         x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                         stroke="#1e293b" 
                         strokeWidth="2" 
                         strokeDasharray="4 4"
                       />
                       <circle cx="50%" cy="50%" r="4" fill="#3b82f6">
                         <animateMotion 
                           dur="2s" 
                           repeatCount="indefinite"
                           path={`M 0 0 L ${x} ${y}`}
                         />
                       </circle>
                     </svg>

                     {/* Follower Node */}
                     <div 
                       className="absolute w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center shadow-lg"
                       style={{ transform: `translate(${x}px, ${y}px)` }}
                     >
                       <Server className="w-5 h-5 text-slate-400" />
                       <div className="absolute -bottom-5 whitespace-nowrap text-[10px] text-slate-500">
                         {node.region}
                       </div>
                       <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                     </div>
                   </React.Fragment>
                 );
              })}
           </div>
        </GlassCard>

        {/* Real-time Charts & Logs */}
        <div className="flex flex-col gap-6">
          
          {/* Latency Chart */}
          <GlassCard className="p-4 flex flex-col h-40">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-xs font-bold text-slate-400">gRPC Latency (ms)</h3>
               <span className="text-[10px] text-slate-500">Last 20s</span>
             </div>
             <div className="flex-1 flex items-end justify-between gap-1">
               {latencyHistory.map((val, idx) => (
                 <div 
                   key={idx} 
                   className={`w-full rounded-t ${val > 80 ? 'bg-red-500' : val > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                   style={{ height: `${val}%`, transition: 'height 0.3s ease' }}
                 ></div>
               ))}
             </div>
          </GlassCard>

          {/* Console Log */}
          <GlassCard className="flex-1 p-4 bg-black/80 border-slate-800 font-mono text-xs overflow-hidden flex flex-col">
             <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-2">
               <Terminal className="w-3 h-3" />
               <span>node-1-logs.txt</span>
             </div>
             <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {grpcLogs.map((log, i) => (
                  <div key={i} className="text-green-500/80 truncate">
                    <span className="text-slate-600 mr-2">
                      {new Date().toLocaleTimeString().split(' ')[0]}
                    </span>
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
             </div>
          </GlassCard>

        </div>
      </div>

      {/* Bottom Row: Kafka Stream */}
      <GlassCard className="p-4 bg-slate-900/40">
        <h3 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-400" /> Apache Kafka Event Stream
        </h3>
        <div className="flex gap-4 overflow-hidden relative">
           <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0f172a] to-transparent z-10"></div>
           <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0f172a] to-transparent z-10"></div>
           
           <AnimatePresence initial={false}>
             {events.map((evt) => (
               <motion.div
                 key={evt.id}
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 className="flex-shrink-0 min-w-[200px] p-3 rounded bg-slate-800 border border-slate-700 flex items-center gap-3"
               >
                 <div className={`w-8 h-8 rounded flex items-center justify-center bg-slate-900 ${
                   evt.type === 'UPLOAD' ? 'text-blue-400' : 
                   evt.type === 'ACCESS' ? 'text-purple-400' : 'text-green-400'
                 }`}>
                   {evt.type === 'UPLOAD' ? <HardDrive className="w-4 h-4" /> : 
                    evt.type === 'ACCESS' ? <ShieldCheck className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-300">{evt.type}</span>
                   <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{evt.msg}</span>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </GlassCard>

    </div>
  );
};
