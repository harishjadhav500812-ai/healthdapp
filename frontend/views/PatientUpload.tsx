
import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { UploadCloud, File, X, ArrowLeft, Lock, HardDrive, Database, CheckCircle, Copy, Clock, Calendar, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppPath } from '../types';
import confetti from 'canvas-confetti';
import { useToast } from '../components/ToastSystem';
import { api } from '../api';

interface PatientUploadProps {
  onNavigate: (view: AppPath) => void;
}

export const PatientUpload: React.FC<PatientUploadProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const toast = useToast();
  
  const [result, setResult] = useState({
    cid: '',
    txHash: '',
    lamport: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStage('UPLOADING');
    
    // START VISUALIZATION
    // We run the visual progress bar roughly in sync with the simulated network call
    let visualProgress = 0;
    const progressInterval = setInterval(() => {
        visualProgress += Math.random() * 5;
        if (visualProgress > 90) visualProgress = 90; // Hold at 90 until API returns
        setProgress(visualProgress);
        
        if (visualProgress < 30) setUploadStep("Encrypting with AES-256...");
        else if (visualProgress < 60) setUploadStep("Generating Merkle DAG...");
        else if (visualProgress < 80) setUploadStep("Pinning to IPFS Network...");
        else setUploadStep("Broadcasting to Blockchain...");
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // CALL API
      const response = await api.records.upload(formData);
      
      // Finish Animation
      clearInterval(progressInterval);
      setProgress(100);
      setUploadStep("Finalizing Consensus...");
      
      setTimeout(() => {
        setResult(response);
        setStage('SUCCESS');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#9333EA', '#0EA5E9']
        });
        toast.blockchain('Blockchain Verified', 'Record successfully hashed and added to the immutable ledger.');
      }, 600);

    } catch (err) {
      clearInterval(progressInterval);
      setStage('IDLE');
      toast.error('Upload Failed', 'Could not sync file to network.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to Clipboard', text.substring(0, 20) + '...');
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] p-4">
      <GlassCard className="w-full max-w-4xl overflow-hidden min-h-[600px] flex flex-col rounded-[32px] border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <button 
            onClick={() => onNavigate('/patient/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-neonBlue animate-pulse"></div>
             <h2 className="text-lg font-bold text-white">Secure Upload</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-10 relative">
          <AnimatePresence mode="wait">
            
            {/* STAGE 1: IDLE / FORM */}
            {stage === 'IDLE' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid md:grid-cols-2 gap-8 h-full"
              >
                {/* Left: Drag & Drop */}
                <div className="flex flex-col h-full">
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleBrowse}
                    className={`
                      flex-1 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center text-center p-8 cursor-pointer transition-all duration-300 relative overflow-hidden group
                      ${isDragging 
                        ? 'border-neonBlue bg-neonBlue/10 shadow-[0_0_30px_rgba(14,165,233,0.2)]' 
                        : 'border-slate-700 hover:border-neonBlue/50 hover:bg-slate-900/30'
                      }
                    `}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    
                    {file ? (
                      <div className="relative z-10 w-full">
                        <div className="w-24 h-24 bg-gradient-to-tr from-neonBlue/20 to-neonIndigo/20 rounded-[20px] flex items-center justify-center mb-4 mx-auto border border-neonBlue/30 shadow-lg">
                          <File className="w-10 h-10 text-neonBlue" />
                        </div>
                        <h4 className="text-xl font-bold text-white break-all max-w-[200px] mx-auto leading-tight">{file.name}</h4>
                        <p className="text-sm text-slate-400 mt-2 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="mt-6 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-semibold transition-colors"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={`w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 border border-white/5 ${isDragging ? 'scale-110 border-neonBlue/50' : 'group-hover:scale-105'}`}>
                          <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-neonBlue' : 'text-slate-400 group-hover:text-neonBlue/80'}`} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-white">Upload Record</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-[200px]">Drag & Drop your medical file here or click to browse</p>
                        <div className="text-[10px] text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50 font-mono tracking-wide">
                          DICOM • PDF • JPG • PNG (Max 100MB)
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Metadata Form */}
                <div className="flex flex-col space-y-6 justify-center">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1">Record Type</label>
                    <div className="relative group">
                      <Database className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-neonBlue transition-colors" />
                      <select className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue/50 transition-all cursor-pointer hover:bg-slate-900/50">
                        <option>General Checkup</option>
                        <option>MRI / X-Ray Scan</option>
                        <option>Blood Test Results</option>
                        <option>Prescription</option>
                        <option>Vaccination Record</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1">Description</label>
                    <div className="relative group">
                      <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-neonBlue transition-colors" />
                      <textarea 
                        rows={3}
                        placeholder="Enter details about this medical record..."
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue/50 transition-all resize-none hover:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1">Date of Record</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-neonBlue transition-colors" />
                      <input 
                        type="date" 
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue/50 transition-all hover:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={!file}
                    onClick={handleUpload}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 mt-4 transition-all
                      ${file 
                        ? 'bg-gradient-to-r from-neonIndigo to-neonBlue text-white hover:scale-[1.02] shadow-neonBlue/20' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }
                    `}
                  >
                    <Lock className="w-5 h-5" />
                    {file ? 'Encrypt & Upload' : 'Select File First'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: UPLOADING */}
            {stage === 'UPLOADING' && (
              <motion.div 
                key="uploading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto"
              >
                <div className="relative w-56 h-56 mb-10">
                  {/* Outer Ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="100" stroke="#1e293b" strokeWidth="12" fill="none" />
                    <circle 
                      cx="112" cy="112" r="100" 
                      stroke="url(#gradient)" 
                      strokeWidth="12" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeDasharray="628"
                      strokeDashoffset={628 - (628 * progress) / 100}
                      className="transition-all duration-300 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#0EA5E9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Inner Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white tracking-tighter">{Math.round(progress)}%</span>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-white mb-3">Processing Record</h3>
                <p className="text-neonBlue font-mono text-sm bg-neonBlue/10 px-4 py-2 rounded-full border border-neonBlue/20 animate-pulse">
                  {uploadStep}
                </p>

                <div className="mt-12 grid grid-cols-3 gap-6 w-full text-xs text-slate-500 font-semibold tracking-wide uppercase">
                  <div className={`flex flex-col items-center gap-3 transition-colors duration-500 ${progress > 10 ? 'text-neonIndigo' : ''}`}>
                    <div className={`p-3 rounded-full border-2 ${progress > 10 ? 'border-neonIndigo bg-neonIndigo/10' : 'border-slate-800 bg-slate-900'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    Encryption
                  </div>
                  <div className={`flex flex-col items-center gap-3 transition-colors duration-500 ${progress > 50 ? 'text-neonPurple' : ''}`}>
                    <div className={`p-3 rounded-full border-2 ${progress > 50 ? 'border-neonPurple bg-neonPurple/10' : 'border-slate-800 bg-slate-900'}`}>
                       <HardDrive className="w-5 h-5" />
                    </div>
                    IPFS Pinning
                  </div>
                  <div className={`flex flex-col items-center gap-3 transition-colors duration-500 ${progress > 90 ? 'text-green-400' : ''}`}>
                     <div className={`p-3 rounded-full border-2 ${progress > 90 ? 'border-green-400 bg-green-500/10' : 'border-slate-800 bg-slate-900'}`}>
                        <Database className="w-5 h-5" />
                     </div>
                     Blockchain
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: SUCCESS */}
            {stage === 'SUCCESS' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto"
              >
                <div className="w-24 h-24 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
                
                <h2 className="text-4xl font-bold text-white mb-3 text-center">Upload Complete</h2>
                <p className="text-slate-400 mb-10 text-center text-lg max-w-md">Your record is now secured on the decentralized network.</p>

                <div className="w-full space-y-4">
                  {/* IPFS CID */}
                  <div className="bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between group hover:border-neonPurple/50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-neonPurple/10 rounded-xl text-neonPurple border border-neonPurple/20">
                        <HardDrive className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">IPFS Content ID</p>
                        <p className="font-mono text-white text-sm md:text-base tracking-wide">{result.cid}</p>
                      </div>
                    </div>
                    <button onClick={() => copyToClipboard(result.cid)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>

                  {/* TX HASH */}
                  <div className="bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between group hover:border-green-500/50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-green-500/10 rounded-xl text-green-400 border border-green-500/20">
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Transaction Hash</p>
                        <p className="font-mono text-white text-sm md:text-base tracking-wide">{result.txHash}</p>
                      </div>
                    </div>
                    <button onClick={() => copyToClipboard(result.txHash)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Lamport Clock */}
                  <div className="bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between group hover:border-neonBlue/50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-neonBlue/10 rounded-xl text-neonBlue border border-neonBlue/20">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Lamport Timestamp</p>
                        <p className="font-mono text-white text-sm md:text-base tracking-wide">{result.lamport}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-neonBlue/10 text-neonBlue px-3 py-1.5 rounded-full border border-neonBlue/20 font-bold uppercase tracking-wider">Synced</span>
                  </div>
                </div>

                <div className="flex gap-5 mt-10 w-full">
                  <button 
                    onClick={() => { setFile(null); setStage('IDLE'); setProgress(0); }}
                    className="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors font-semibold text-slate-300 hover:text-white"
                  >
                    Upload Another
                  </button>
                  <button 
                    onClick={() => onNavigate('/patient/dashboard')}
                    className="flex-1 py-4 rounded-2xl bg-white text-slate-950 hover:bg-gray-200 transition-colors font-bold shadow-lg"
                  >
                    Go to Dashboard
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
};
