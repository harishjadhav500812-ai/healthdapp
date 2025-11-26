
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { User, Mail, CreditCard, Shield, Save, UserCircle, Key, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppPath, User as UserType, UserRole } from '../types';
import { useToast } from '../components/ToastSystem';

interface UserProfileProps {
  user: UserType | null;
  onNavigate: (path: AppPath) => void;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onNavigate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    specialization: user?.role === UserRole.DOCTOR ? 'Neurology' : '',
    age: '34',
    gender: 'Male'
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      toast.success('Profile Updated', 'Your identity information has been synced.');
    }, 1500);
  };

  if (!user) return null;

  return (
    <div className="min-h-[85vh] p-4 flex flex-col max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate(user.role === UserRole.PATIENT ? '/patient/dashboard' : '/doctor/dashboard')}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-2xl font-bold text-white">My Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Identity Card */}
        <div className="space-y-6">
          <GlassCard className="p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-neonIndigo/20 to-transparent"></div>
            
            <div className="relative z-10 w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-neonIndigo to-neonCyan mb-4 shadow-xl">
               <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                 {user.avatarUrl ? (
                   <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserCircle className="w-16 h-16 text-slate-400" />
                 )}
               </div>
               <button className="absolute bottom-1 right-1 p-2 bg-neonBlue rounded-full text-white shadow-lg border border-slate-900 hover:scale-110 transition-transform">
                 <Key className="w-4 h-4" />
               </button>
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-neonBlue border border-white/10 uppercase tracking-wider mb-6">
              {user.role}
            </span>

            <div className="w-full p-4 bg-slate-900/50 rounded-xl border border-white/5 mb-6">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">HealthChain ID (DID)</p>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-xs text-neonPurple font-mono bg-neonPurple/10 px-2 py-1 rounded">did:hcn:7f...92a</code>
              </div>
            </div>

            <button onClick={onLogout} className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Sign Out
            </button>
          </GlassCard>
        </div>

        {/* Right Col: Details Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-neonIndigo" /> Personal Information
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/5"
                >
                  Edit Details
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-neonIndigo hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-neonIndigo focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                    <input 
                      type="email" 
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-neonIndigo focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                {user.role === UserRole.PATIENT && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 font-bold uppercase ml-1">Age</label>
                      <input 
                        type="number" 
                        disabled={!isEditing}
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neonIndigo focus:outline-none disabled:opacity-50 transition-all"
                      />
                    </div>
                     <div className="space-y-2">
                      <label className="text-xs text-slate-500 font-bold uppercase ml-1">Gender</label>
                      <select
                        disabled={!isEditing}
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neonIndigo focus:outline-none disabled:opacity-50 transition-all appearance-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </>
                )}

                {user.role === UserRole.DOCTOR && (
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-xs text-slate-500 font-bold uppercase ml-1">Specialization</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={formData.specialization}
                        onChange={e => setFormData({...formData, specialization: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neonIndigo focus:outline-none disabled:opacity-50 transition-all"
                      />
                    </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5">
                <label className="text-xs text-slate-500 font-bold uppercase ml-1 mb-2 block">Linked Wallet Address</label>
                <div className="relative group cursor-pointer" onClick={() => {navigator.clipboard.writeText(formData.walletAddress); toast.success('Copied', 'Address copied to clipboard');}}>
                   <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-neonPurple" />
                   <input 
                      type="text" 
                      readOnly
                      value={formData.walletAddress}
                      className="w-full bg-neonPurple/5 border border-neonPurple/20 rounded-xl py-3 pl-12 pr-10 text-neonPurple font-mono text-sm cursor-pointer hover:bg-neonPurple/10 transition-colors focus:outline-none"
                    />
                    <div className="absolute right-4 top-3.5 text-xs font-bold text-neonPurple bg-neonPurple/10 px-2 rounded">
                      CONNECTED
                    </div>
                </div>
              </div>

            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
