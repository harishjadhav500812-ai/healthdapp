
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { UploadCloud, FileText, ShieldCheck, Clock, Trash2, X, AlertTriangle, ChevronRight, Activity, HeartPulse, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemEvent, MedicalRecord, AppPath, AccessRequest } from '../types';
import { useToast } from '../components/ToastSystem';
import { api } from '../api';

const MOCK_EVENTS: SystemEvent[] = [
  { id: '1', type: 'CONSENSUS', title: 'Block #4092 Mined', description: 'Transaction verified by 5 nodes', lamportClock: 104, nodeId: 'Node-Alpha', timestamp: '10:45 AM' },
  { id: '2', type: 'ACCESS_GRANT', title: 'Dr. Smith Granted', description: 'Permissions updated on-chain', lamportClock: 103, nodeId: 'Node-Beta', timestamp: '10:30 AM' },
  { id: '3', type: 'UPLOAD', title: 'Record Uploaded', description: 'File pinned to IPFS', lamportClock: 102, nodeId: 'Node-Alpha', timestamp: '09:15 AM' },
];

interface PatientDashboardProps {
  onNavigate: (path: AppPath) => void;
  initialTab?: 'records' | 'requests';
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate, initialTab = 'records' }) => {
  const [activeTab, setActiveTab] = useState<'records' | 'requests'>(initialTab);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // Interaction State
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const recs = await api.records.getAll();
        setRecords(recs);
      } catch (err) {
        toast.error("Network Error", "Failed to fetch records.");
      } finally {
        setLoadingRecords(false);
      }

      try {
        const reqs = await api.access.getRequests();
        setRequests(reqs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchData();
  }, []);

  const handleApproveClick = (req: AccessRequest) => {
    setSelectedRequest(req);
    setShowModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRequest) return;
    setProcessingAction(true);
    try {
      await api.access.approve(selectedRequest.id);
      
      // Update local state
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setShowModal(false);
      toast.accessApprove(
        'Access Granted Successfully', 
        `Permissions for ${selectedRequest.doctorName} written to block #4093.`
      );
    } catch (err) {
      toast.error('Transaction Failed', 'Smart contract rejected the approval.');
    } finally {
      setProcessingAction(false);
      setSelectedRequest(null);
    }
  };

  const handleReject = async (req: AccessRequest) => {
    try {
      await api.access.reject(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      toast.error('Request Rejected', `Access denied for ${req.doctorName}.`);
    } catch (err) {
      toast.error('Error', 'Failed to reject request.');
    }
  };

  const handleDelete = async (fileName: string, id: string) => {
    if (!confirm(`Are you sure you want to revoke access to ${fileName}? This will propagate to all nodes.`)) return;
    
    try {
      await api.records.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.error('Record Revoked', `Access to ${fileName} has been revoked on the smart contract.`);
    } catch (err) {
      toast.error('Revocation Failed', 'Could not delete record from ledger.');
    }
  };

  const getRiskColor = (level?: string) => {
    switch(level) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'LOW': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-2 h-full min-h-[85vh] relative">
      
      {/* Approval Modal */}
      <AnimatePresence>
        {showModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !processingAction && setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0f172a] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Modal Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neonIndigo via-teal-500 to-neonBlue" />
              
              <button onClick={() => setShowModal(false)} disabled={processingAction} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-tr from-neonIndigo/10 to-teal-500/10 rounded-full flex items-center justify-center mb-5 border border-neonIndigo/20 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                  <ShieldCheck className="w-10 h-10 text-neonIndigo" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Grant Access?</h3>
                <p className="text-slate-400 mt-2">Authorize secure data sharing.</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 mb-6 space-y-4 border border-white/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Requestor</span>
                  <span className="text-white font-semibold flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-neonBlue/20 flex items-center justify-center text-[10px] text-neonBlue border border-neonBlue/30">Dr</div>
                    {selectedRequest.doctorName}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-start text-sm">
                  <span className="text-slate-400 mt-0.5">Purpose</span>
                  <span className="text-white font-medium text-right max-w-[60%] text-slate-200">{selectedRequest.purpose}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl mb-8">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-200/80 leading-relaxed">
                  This transaction is immutable. Access will be logged on the blockchain ledger (Block #Pending).
                </p>
              </div>

              <button 
                onClick={handleConfirmApproval}
                disabled={processingAction}
                className="w-full py-4 bg-gradient-to-r from-neonIndigo to-teal-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-neonIndigo/20 hover:shadow-neonIndigo/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingAction ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Signing...
                  </>
                ) : (
                  'Sign & Grant Access'
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Left Column: Stats & Upload */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Verification Status Card */}
        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-green-500/20 transition-all" />
          
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2.5">
             <div className="p-2 bg-green-500/10 rounded-lg text-green-400 border border-green-500/20">
               <HeartPulse className="w-5 h-5" />
             </div>
             Health Ledger
          </h3>
          
          <div className="space-y-5">
            <div className="flex justify-between items-center">
               <span className="text-slate-400 text-sm">Network Status</span>
               <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                 SYNCED
               </span>
            </div>
            
            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Current Block</span>
                <span className="font-mono text-neonIndigo">#4,092,821</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Hash Rate</span>
                <span className="font-mono text-white">142 TH/s</span>
              </div>
            </div>

            <div className="relative pt-2">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-neonIndigo w-[92%] relative">
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-right mt-1.5 font-mono">Consensus Reached</p>
            </div>
          </div>
        </GlassCard>

        {/* Upload Zone Card */}
        <GlassCard className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <UploadCloud className="text-neonIndigo" /> Add Record
          </h3>
          <div 
            onClick={() => onNavigate('/patient/upload')}
            className="flex-1 border-2 border-dashed border-slate-700 hover:border-neonIndigo/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-900/20 group hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] hover:bg-slate-900/40 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neonIndigo/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-neonIndigo/30">
              <FileText className="w-8 h-8 text-slate-400 group-hover:text-neonIndigo transition-colors" />
            </div>
            <p className="text-slate-200 font-medium group-hover:text-white transition-colors relative z-10">Upload New Document</p>
            <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed relative z-10">
              Securely encrypt and pin to IPFS with blockchain verification.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Center Column: Records & Requests */}
      <div className="lg:col-span-5">
        <GlassCard className="h-full flex flex-col overflow-hidden">
          {/* Custom Tabs - Teal Theme */}
          <div className="flex p-1.5 bg-slate-950/50 m-4 rounded-xl border border-white/5">
            <button 
              onClick={() => {
                setActiveTab('records');
                onNavigate('/patient/records');
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'records' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Medical Records
            </button>
            <button 
              onClick={() => {
                 setActiveTab('requests');
                 onNavigate('/patient/requests');
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Access Requests
              {requests.length > 0 && (
                <span className="bg-neonBlue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">{requests.length}</span>
              )}
            </button>
          </div>

          <div className="px-4 pb-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Records List */}
            {activeTab === 'records' && (
              <div className="space-y-3">
                {loadingRecords ? (
                  <div className="flex justify-center p-8 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 text-sm">No records found. Upload one to get started.</div>
                ) : (
                  records.map((rec, i) => (
                    <motion.div 
                      key={rec.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-white/5 border border-white/5 hover:border-neonIndigo/30 rounded-2xl transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neonIndigo/20 to-teal-600/20 flex items-center justify-center text-neonIndigo border border-neonIndigo/20">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white group-hover:text-neonIndigo transition-colors">{rec.fileName}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{rec.uploadDate} • {rec.fileSize}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(rec.fileName, rec.id)}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Revoke & Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 relative z-10">
                         <div className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CID</span>
                            <span className="text-[10px] text-slate-300 font-mono truncate">{rec.ipfsCid}</span>
                         </div>
                         <button 
                           onClick={() => onNavigate('/blockchain/verification')}
                           className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                         >
                           <ShieldCheck className="w-3 h-3" /> Verify
                         </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Requests List */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                 {loadingRequests ? (
                  <div className="flex justify-center p-8 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 text-sm">No pending access requests.</div>
                ) : (
                  requests.map((req, i) => (
                    <motion.div 
                      key={req.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 bg-white/5 border border-white/10 hover:border-neonBlue/40 rounded-[20px] transition-all relative overflow-hidden group"
                    >
                       <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neonBlue to-neonIndigo opacity-60"></div>
                       <div className="absolute -right-10 -top-10 w-32 h-32 bg-neonBlue/10 rounded-full blur-2xl group-hover:bg-neonBlue/20 transition-all duration-500"></div>
                       
                       <div className="flex justify-between items-start mb-4 relative z-10">
                         <div className="flex items-center gap-3">
                           <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-neonBlue to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/10">
                             {req.doctorName.charAt(0)}
                           </div>
                           <div>
                             <h4 className="font-bold text-white text-base leading-tight">{req.doctorName}</h4>
                             <p className="text-xs text-blue-300 mt-0.5">{req.specialization}</p>
                           </div>
                         </div>
                         <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border backdrop-blur-sm ${getRiskColor(req.riskLevel)}`}>
                           {req.riskLevel} RISK
                         </span>
                       </div>

                       <div className="bg-slate-950/40 rounded-xl p-3 mb-4 border border-white/5 relative z-10">
                         <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Purpose</p>
                         <p className="text-sm text-slate-200 leading-relaxed">{req.purpose}</p>
                       </div>

                       <div className="flex items-center justify-between mt-2 relative z-10">
                         <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                           <Clock className="w-3 h-3" /> {req.timestamp}
                         </span>
                         <div className="flex gap-2">
                           <button 
                              onClick={() => handleReject(req)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                           >
                             Ignore
                           </button>
                           <button 
                             onClick={() => handleApproveClick(req)}
                             className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-white hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:border-green-400 transition-all flex items-center gap-1.5"
                           >
                             Approve <ChevronRight className="w-3 h-3" />
                           </button>
                         </div>
                       </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Timeline */}
      <div className="lg:col-span-3">
        <GlassCard className="h-full flex flex-col">
           <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="text-lg font-bold flex items-center gap-2.5">
              <Clock className="text-neonBlue" /> System Log
            </h3>
            <p className="text-xs text-slate-400 mt-1">Immutable Events (Lamport)</p>
          </div>
          <div className="p-6 relative overflow-hidden flex-1">
            {/* Timeline Line */}
            <div className="absolute left-[38px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-slate-700 via-slate-800 to-transparent"></div>
            
            <div className="space-y-8 relative z-10">
              {MOCK_EVENTS.map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex gap-5 group"
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold z-10 relative border-2 transition-all duration-300 ${
                        event.type === 'CONSENSUS' ? 'bg-slate-900 border-neonBlue text-neonBlue shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                        event.type === 'UPLOAD' ? 'bg-slate-900 border-neonIndigo text-neonIndigo shadow-[0_0_15px_rgba(20,184,166,0.3)]' :
                        'bg-slate-900 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                    }`}>
                      {event.lamportClock}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        event.type === 'CONSENSUS' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                        event.type === 'UPLOAD' ? 'bg-teal-500/10 text-teal-300 border-teal-500/20' :
                        'bg-green-500/10 text-green-300 border-green-500/20'
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{event.timestamp}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-neonIndigo transition-colors">{event.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
