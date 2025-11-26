import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  UserCheck, 
  Settings, 
  Activity, 
  ShieldCheck, 
  Database,
  Hexagon
} from 'lucide-react';
import { UserRole, AppPath } from '../types';
import { motion } from 'framer-motion';

interface SidebarProps {
  role: UserRole;
  currentPath: AppPath;
  onNavigate: (path: AppPath) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, currentPath, onNavigate }) => {
  
  const patientLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: UploadCloud, label: 'Upload Record', path: '/patient/upload' },
    { icon: FileText, label: 'My Records', path: '/patient/records' },
    { icon: UserCheck, label: 'Access Requests', path: '/patient/requests' },
    { icon: ShieldCheck, label: 'Verify Chain', path: '/blockchain/verification' },
    { icon: Settings, label: 'Settings', path: '/patient/settings' },
  ];

  const doctorLinks = [
    { icon: LayoutDashboard, label: 'Overview', path: '/doctor/dashboard' },
    { icon: UserCheck, label: 'Request Access', path: '/doctor/request' },
    { icon: Database, label: 'Granted Data', path: '/doctor/granted' },
    { icon: Activity, label: 'System Monitor', path: '/system/monitor' },
    { icon: Settings, label: 'Settings', path: '/doctor/settings' },
  ];

  const links = role === UserRole.PATIENT ? patientLinks : doctorLinks;

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-[#020617]/90 backdrop-blur-xl border-r border-white/5 flex flex-col z-40 shadow-2xl">
      {/* Brand */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
        <div className="w-8 h-8 bg-gradient-to-br from-neonIndigo to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-neonIndigo/20">
          <Hexagon className="text-white w-5 h-5 fill-white/10" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">HealthChain</h1>
          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        {links.map((link) => {
          const isActive = currentPath === link.path;
          return (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path as AppPath)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-r from-neonIndigo/20 to-teal-500/10 text-white shadow-lg border border-neonIndigo/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeSidebar"
                  className="absolute left-0 w-1 h-full bg-neonIndigo rounded-r-full"
                />
              )}
              <link.icon className={`w-5 h-5 ${isActive ? 'text-neonIndigo' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="font-medium text-sm">{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/5">
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden group cursor-pointer hover:border-neonIndigo/30 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-neonIndigo/10 rounded-full blur-xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase">Node Status</span>
          </div>
          <p className="text-xs text-slate-300 font-mono">Synced • 24ms</p>
        </div>
      </div>
    </div>
  );
};
