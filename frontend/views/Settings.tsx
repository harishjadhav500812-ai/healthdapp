
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Bell, Moon, Shield, Globe, Smartphone, LogOut, ArrowLeft, ToggleLeft, ToggleRight, Server, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppPath } from '../types';
import { useToast } from '../components/ToastSystem';

interface SettingsProps {
  onNavigate: (path: AppPath) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedNode, setSelectedNode] = useState('us-east-1');
  const toast = useToast();

  const handleToggleNotify = () => {
    setNotifications(!notifications);
    toast.success('Preferences Saved', !notifications ? 'Notifications Enabled' : 'Notifications Disabled');
  };

  return (
    <div className="min-h-[85vh] p-4 flex flex-col max-w-4xl mx-auto">
       {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('/patient/dashboard')} 
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-2xl font-bold text-white">App Settings</h2>
      </div>

      <div className="space-y-6">
        
        {/* Appearance & Notifications */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
             <h3 className="font-bold text-white flex items-center gap-2">
               <Globe className="w-5 h-5 text-neonBlue" /> General Preferences
             </h3>
          </div>
          <div className="p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 rounded-xl text-slate-400"><Bell className="w-5 h-5" /></div>
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-sm text-slate-400">Receive alerts for access requests</p>
                  </div>
                </div>
                <button onClick={handleToggleNotify} className={`text-3xl transition-colors ${notifications ? 'text-neonBlue' : 'text-slate-600'}`}>
                  {notifications ? <ToggleRight /> : <ToggleLeft />}
                </button>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 rounded-xl text-slate-400"><Moon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-sm text-slate-400">Reduce eye strain (Always On)</p>
                  </div>
                </div>
                <button className="text-3xl text-neonBlue cursor-not-allowed opacity-50" title="Forced by Theme">
                  <ToggleRight />
                </button>
             </div>
          </div>
        </GlassCard>

        {/* Blockchain Node */}
        <GlassCard className="p-0 overflow-hidden">
           <div className="p-4 border-b border-white/5 bg-white/5">
             <h3 className="font-bold text-white flex items-center gap-2">
               <Server className="w-5 h-5 text-neonIndigo" /> Network Node
             </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-400 mb-4">Select the primary gateway node for your blockchain transactions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['us-east-1 (N. Virginia)', 'eu-central-1 (Frankfurt)', 'ap-south-1 (Mumbai)', 'sa-east-1 (São Paulo)'].map((node) => {
                 const id = node.split(' ')[0];
                 const isSelected = selectedNode === id;
                 return (
                   <div 
                     key={id}
                     onClick={() => setSelectedNode(id)}
                     className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'bg-neonIndigo/10 border-neonIndigo/50' : 'bg-slate-900/50 border-white/5 hover:border-white/20'}`}
                   >
                     <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-green-400 shadow-[0_0_10px_#22c55e]' : 'bg-slate-600'}`}></div>
                       <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-400'}`}>{node}</span>
                     </div>
                     {isSelected && <Check className="w-4 h-4 text-neonIndigo" />}
                   </div>
                 );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Security Sessions */}
        <GlassCard className="p-0 overflow-hidden">
           <div className="p-4 border-b border-white/5 bg-white/5">
             <h3 className="font-bold text-white flex items-center gap-2">
               <Shield className="w-5 h-5 text-red-400" /> Active Sessions
             </h3>
          </div>
          <div className="p-6">
             <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Smartphone className="w-6 h-6" /></div>
                   <div>
                      <p className="text-white font-medium text-sm">Chrome on MacOS</p>
                      <p className="text-xs text-green-400">Current Session • 192.168.1.42</p>
                   </div>
                </div>
                <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white transition-colors">
                  Details
                </button>
             </div>
             
             <button className="w-full mt-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
               <LogOut className="w-4 h-4" /> Revoke All Other Sessions
             </button>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
