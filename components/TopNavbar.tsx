
import React from 'react';
import { Search, Bell, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { User, AppPath, UserRole } from '../types';

interface TopNavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (path: AppPath) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ user, onLogout, onNavigate }) => {
  return (
    <header className="h-20 fixed top-0 right-0 left-64 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-30 flex items-center justify-between px-8">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search records, doctors, or transactions..." 
          className="w-full bg-slate-900/50 border border-white/5 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neonIndigo/50 focus:bg-slate-900 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neonBlue rounded-full border-2 border-[#020617]"></span>
        </button>

        <div className="h-8 w-px bg-white/10"></div>

        {/* User Profile */}
        {user ? (
          <div className="flex items-center gap-4 group">
             <div 
               className="text-right hidden md:block cursor-pointer"
               onClick={() => onNavigate(user.role === UserRole.PATIENT ? '/patient/profile' : '/doctor/profile')}
             >
                <p className="text-sm font-bold text-white leading-none hover:text-neonBlue transition-colors">{user.name}</p>
                <p className="text-[10px] text-teal-400 font-medium uppercase mt-1">{user.role}</p>
             </div>
             
             <button 
                onClick={() => onNavigate(user.role === UserRole.PATIENT ? '/patient/profile' : '/doctor/profile')}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition-colors"
             >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neonIndigo to-teal-500 p-0.5">
                   <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-neonIndigo" />
                      )}
                   </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white" />
             </button>

             <button 
               onClick={onLogout}
               className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
               title="Logout"
             >
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => onNavigate('/patient/login')} className="text-sm font-bold text-white hover:text-neonIndigo">Login</button>
          </div>
        )}
      </div>
    </header>
  );
};
