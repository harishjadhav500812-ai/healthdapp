
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Search, UserCheck, Shield, FileKey, Activity, Server, Database, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AccessRequest, AppPath } from '../types';
import { useToast } from '../components/ToastSystem';
import { api } from '../api';

interface DoctorDashboardProps {
  onNavigate: (path: AppPath) => void;
  initialTab?: 'overview' | 'requests' | 'granted';
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onNavigate, initialTab = 'overview' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [grantedAccess, setGrantedAccess] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [reqs, granted] = await Promise.all([
          api.access.getRequests(),
          api.access.getGrantedRecords()
        ]);
        setRequests(reqs);
        setGrantedAccess(granted);
      } catch (err) {
        toast.error("Data Load Failed", "Could not fetch dashboard metrics.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleRequestAccess = async (req: AccessRequest) => {
    setSendingRequest(req.id);
    try {
      await api.access.request({
        patientId: req.patientId,
        purpose: req.purpose
      });
      toast.accessRequest('Access Requested', `Request sent to ${req.patientName}. Pending patient approval.`);
    } catch (err) {
      toast.error('Request Failed', 'Could not send access request.');
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="p-4 min-h-[85vh] flex flex-col gap-6 max-w-[1600px] mx-auto">
      
      {/* Top Search Bar */}
      <GlassCard className="p-2 pl-6 flex items-center gap-4 rounded-full border-white/10 shadow-lg shadow-black/20">
        <Search className="w-6 h-6 text-neonIndigo" />
        <input 
          type="text" 
          placeholder="Search Patient by ID or Name (e.g. P-1234)" 
          className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-slate-500 text-lg py-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <div className="absolute top-full left-4 right-4 mt-2 p-3 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50">
            <div className="p-4 hover:bg-white/5 rounded-xl cursor-pointer flex justify-between items-center group transition-colors">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neonBlue to-neonIndigo flex items-center justify-center text-white font-bold">A</div>
                 <div>
                    <span className="block text-white font-semibold">Alex Doe</span>
                    <span className="text-xs text-slate-400">ID: P-9921</span>
                 </div>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">ACTIVE</span>
            </div>
          </div>
        )}
        <button className="bg-white/5 hover:bg-neonIndigo/20 text-slate-300 hover:text-white px-6 py-3 rounded-full font-medium transition-all mr-1">
           Advanced Filter
        </button>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left: Pending Requests */}
        <div className="space-y-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2.5 px-2">
             <div className="p-1.5 bg-neonBlue/10 rounded-lg text-neonBlue"><UserCheck className="w-5 h-5" /></div> 
             Pending Requests
           </h3>
           
           {isLoading ? (
             <GlassCard className="p-6 flex justify-center"><Loader2 className="animate-spin text-slate-500" /></GlassCard>
           ) : requests.length === 0 ? (
             <GlassCard className="p-6 text-center text-slate-500">No pending requests.</GlassCard>
           ) : (
             requests.map(req => (
               <GlassCard key={req.id} className="p-6 border-l-4 border-l-yellow-500 rounded-[24px]">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                      <h4 className="font-bold text-lg text-white">{req.patientName}</h4>
                      <p className="text-sm text-slate-400">ID: {req.patientId}</p>
                   </div>
                   <span className="text-[10px] font-bold bg-yellow-500/10 text-yellow-300 px-2.5 py-1 rounded border border-yellow-500/20 uppercase tracking-wide">
                     Pending
                   </span>
                 </div>
                 
                 <div className="bg-slate-900/50 rounded-xl p-3 mb-5 border border-white/5">
                   <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Reason</p>
                   <p className="text-sm text-slate-300">{req.purpose}</p>
                 </div>

                 <button 
                   onClick={() => handleRequestAccess(req)}
                   disabled={sendingRequest === req.id}
                   className="w-full py-3 bg-neonBlue/10 hover:bg-neonBlue/20 text-neonBlue border border-neonBlue/30 hover:border-neonBlue/50 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.1)] flex items-center justify-center gap-2 group disabled:opacity-50"
                 >
                   {sendingRequest === req.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Send Request Again'}
                   {!sendingRequest && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                 </button>
               </GlassCard>
             ))
           )}

           <div className="bg-gradient-to-br from-neonIndigo/10 to-blue-900/10 border border-neonIndigo/20 rounded-[24px] p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-neonIndigo/20 blur-2xl -mr-10 -mt-10 rounded-full"></div>
             <h4 className="font-bold text-neonIndigo mb-2 relative z-10">Immutable Log</h4>
             <p className="text-sm text-blue-200/60 relative z-10 leading-relaxed">
               All access requests are cryptographically signed and recorded on the HealthChain ledger for auditability.
             </p>
           </div>
        </div>

        {/* Middle: Granted Access */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
           <h3 className="text-lg font-bold text-white flex items-center gap-2.5 px-2">
             <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400"><FileKey className="w-5 h-5" /></div>
             Granted Records
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-2 flex justify-center p-12"><Loader2 className="animate-spin text-slate-500 w-8 h-8" /></div>
              ) : grantedAccess.map(access => (
                <GlassCard key={access.id} className="p-6 hover:border-green-400/30 transition-all duration-300 group rounded-[24px]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors">
                          <Shield className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">{access.patient}</h4>
                         <p className="text-sm text-slate-400 truncate max-w-[120px]">{access.record}</p>
                       </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2"></div>
                  </div>
                  
                  <div className="bg-slate-950/50 rounded-xl p-3.5 mb-4 border border-slate-800 group-hover:border-green-500/20 transition-colors space-y-2">
                    <div className="flex justify-between text-xs items-center">
                      <span className="text-slate-500 font-semibold">CID</span>
                      <span className="text-slate-300 font-mono bg-white/5 px-1.5 py-0.5 rounded">{access.cid}</span>
                    </div>
                    <div className="flex justify-between text-xs items-center">
                      <span className="text-slate-500 font-semibold">Expires In</span>
                      <span className="text-yellow-400">{access.expiry}</span>
                    </div>
                  </div>

                  <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl text-sm font-medium transition-colors">
                    View Document
                  </button>
                </GlassCard>
              ))}
           </div>

           {/* System Insights */}
           <div className="pt-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <div className="p-1.5 bg-neonPurple/10 rounded-lg text-neonPurple"><Activity className="w-5 h-5" /></div>
                  Network Metrics
                </h3>
                <button 
                  onClick={() => onNavigate('/system/monitor')}
                  className="flex items-center gap-2 text-sm text-neonBlue hover:text-white transition-colors group bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                  View Full Monitor <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-5 text-center cursor-pointer hover:bg-white/5 transition-colors group rounded-[24px]" onClick={() => onNavigate('/system/monitor')}>
                   <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Server className="w-6 h-6 text-blue-400" />
                   </div>
                   <div className="text-3xl font-bold text-white mb-1">5/5</div>
                   <div className="text-xs text-slate-400 font-bold tracking-wider uppercase">Active Replicas</div>
                </GlassCard>
                
                <GlassCard className="p-5 text-center cursor-pointer hover:bg-white/5 transition-colors group rounded-[24px]" onClick={() => onNavigate('/system/monitor')}>
                   <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-green-400" />
                   </div>
                   <div className="text-3xl font-bold text-white mb-1">24ms</div>
                   <div className="text-xs text-slate-400 font-bold tracking-wider uppercase">Latency</div>
                </GlassCard>
                
                <GlassCard className="p-5 text-center cursor-pointer hover:bg-white/5 transition-colors group rounded-[24px]" onClick={() => onNavigate('/system/monitor')}>
                   <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Database className="w-6 h-6 text-purple-400" />
                   </div>
                   <div className="text-3xl font-bold text-white mb-1">#9281</div>
                   <div className="text-xs text-slate-400 font-bold tracking-wider uppercase">Current Block</div>
                </GlassCard>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
