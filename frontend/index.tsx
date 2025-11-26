import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { Sidebar } from "./components/Sidebar";
import { TopNavbar } from "./components/TopNavbar";
import { Landing } from "./views/Landing";
import { PatientAuth } from "./views/PatientAuth";
import { PatientDashboard } from "./views/PatientDashboard";
import { DoctorDashboard } from "./views/DoctorDashboard";
import { PatientUpload } from "./views/PatientUpload";
import { BlockchainVerify } from "./views/BlockchainVerify";
import { SystemMonitor } from "./views/SystemMonitor";
import { UserProfile } from "./views/UserProfile";
import { Settings } from "./views/Settings";
import { ToastProvider, useToast } from "./components/ToastSystem";
import { AppPath, User, UserRole } from "./types";
import { Hexagon, LogOut, Terminal } from "lucide-react";

const App = () => {
  // Navigation State
  const [currentPath, setCurrentPath] = useState<AppPath>("/");

  // User State
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (role: UserRole) => {
    // Mock Login
    setUser({
      id: "u-1",
      name: role === UserRole.PATIENT ? "Alex Doe" : "Dr. Emily Chen",
      role: role,
      avatarUrl: undefined,
      email:
        role === UserRole.PATIENT
          ? "alex.doe@example.com"
          : "dr.chen@healthchain.io",
    });

    // Redirect to Dashboard
    if (role === UserRole.PATIENT) {
      setCurrentPath("/patient/dashboard");
    } else {
      setCurrentPath("/doctor/dashboard");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPath("/");
  };

  const renderView = () => {
    switch (currentPath) {
      // Public
      case "/":
        return <Landing onNavigate={setCurrentPath} />;

      // Patient Auth
      case "/patient/login":
        return (
          <PatientAuth
            role={UserRole.PATIENT}
            initialMode="login"
            onLogin={() => handleLogin(UserRole.PATIENT)}
            onNavigate={setCurrentPath}
          />
        );
      case "/patient/signup":
        return (
          <PatientAuth
            role={UserRole.PATIENT}
            initialMode="signup"
            onLogin={() => handleLogin(UserRole.PATIENT)}
            onNavigate={setCurrentPath}
          />
        );

      // Patient Dashboard Routes
      case "/patient/dashboard":
      case "/patient/records":
        return (
          <PatientDashboard onNavigate={setCurrentPath} initialTab="records" />
        );
      case "/patient/requests":
        return (
          <PatientDashboard onNavigate={setCurrentPath} initialTab="requests" />
        );
      case "/patient/upload":
        return <PatientUpload onNavigate={setCurrentPath} />;
      case "/patient/settings":
        return <Settings onNavigate={setCurrentPath} />;
      case "/patient/profile":
        return (
          <UserProfile
            user={user}
            onNavigate={setCurrentPath}
            onLogout={handleLogout}
          />
        );

      // Doctor Dashboard Routes
      case "/doctor/login":
        return (
          <PatientAuth
            role={UserRole.DOCTOR}
            initialMode="login"
            onLogin={() => handleLogin(UserRole.DOCTOR)}
            onNavigate={setCurrentPath}
          />
        );
      case "/doctor/signup":
        return (
          <PatientAuth
            role={UserRole.DOCTOR}
            initialMode="signup"
            onLogin={() => handleLogin(UserRole.DOCTOR)}
            onNavigate={setCurrentPath}
          />
        );

      case "/doctor/dashboard":
      case "/doctor/request":
        return (
          <DoctorDashboard onNavigate={setCurrentPath} initialTab="overview" />
        );
      case "/doctor/granted":
        return (
          <DoctorDashboard onNavigate={setCurrentPath} initialTab="granted" />
        );
      case "/doctor/settings":
        return <Settings onNavigate={setCurrentPath} />;
      case "/doctor/profile":
        return (
          <UserProfile
            user={user}
            onNavigate={setCurrentPath}
            onLogout={handleLogout}
          />
        );

      // Shared/Public-ish
      case "/blockchain/verification":
        return <BlockchainVerify onNavigate={setCurrentPath} />;
      case "/system/monitor":
        return <SystemMonitor onNavigate={setCurrentPath} />;

      default:
        return (
          <div className="p-10 text-center text-slate-400">
            404 - Page Not Found
          </div>
        );
    }
  };

  // Determine Layout
  const isDashboardLayout =
    user !== null &&
    currentPath !== "/" &&
    !currentPath.includes("login") &&
    !currentPath.includes("signup");

  return (
    <ToastProvider>
      <div className="min-h-screen text-slate-200 font-sans selection:bg-neonCyan/30 bg-[#020408]">
        <AnimatedBackground />

        {isDashboardLayout ? (
          // DASHBOARD LAYOUT
          <div className="flex">
            <Sidebar
              role={user?.role || UserRole.GUEST}
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
              <TopNavbar
                user={user}
                onLogout={handleLogout}
                onNavigate={setCurrentPath}
              />
              <main className="flex-1 pt-24 px-8 pb-8">{renderView()}</main>
            </div>
          </div>
        ) : (
          // PUBLIC LAYOUT
          <>
            {/* Header */}
            <header
              className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${currentPath === "/" ? "bg-black/20 backdrop-blur-md border-b border-white/5 py-5" : "bg-black/80 backdrop-blur-xl border-b border-white/5 py-4"}`}
            >
              <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setCurrentPath("/")}
                >
                  <div className="w-10 h-10 border border-neonCyan/30 bg-neonCyan/10 rounded-lg flex items-center justify-center relative overflow-hidden group-hover:border-neonCyan/60 transition-colors">
                    <div className="absolute inset-0 bg-neonCyan/20 animate-pulse"></div>
                    <Hexagon className="text-neonCyan w-5 h-5 relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-white leading-none font-mono group-hover:text-neonCyan transition-colors uppercase">
                      HealthChain
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                        Node Active
                      </p>
                    </div>
                  </div>
                </div>

                {currentPath !== "/" && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentPath("/")}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white border border-transparent hover:border-white/10"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {currentPath === "/" && (
                  <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400 uppercase tracking-widest">
                    <span className="hover:text-neonCyan cursor-pointer transition-colors">
                      Network
                    </span>
                    <span className="hover:text-neonCyan cursor-pointer transition-colors">
                      Consensus
                    </span>
                    <span className="hover:text-neonCyan cursor-pointer transition-colors">
                      Docs
                    </span>
                  </div>
                )}
              </div>
            </header>

            {/* Main Content */}
            <main
              className={
                currentPath === "/"
                  ? ""
                  : "pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto"
              }
            >
              {renderView()}
            </main>

            {/* Footer */}
            {currentPath === "/" && (
              <footer className="py-8 bg-[#010203] border-t border-white/5 text-center relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                  <p>
                    &copy; 2024 HealthChain Distributed Ledger. Block #9281.
                  </p>
                  <div className="flex gap-6">
                    <a
                      href="#"
                      className="hover:text-neonCyan transition-colors"
                    >
                      Smart Contracts
                    </a>
                    <a
                      href="#"
                      className="hover:text-neonCyan transition-colors"
                    >
                      Whitepaper
                    </a>
                  </div>
                </div>
              </footer>
            )}
          </>
        )}
      </div>
    </ToastProvider>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
