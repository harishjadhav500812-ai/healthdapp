import React, { useState, useEffect } from "react";
import { GlassCard } from "../components/GlassCard";
import {
  Mail,
  Lock,
  User as UserIcon,
  Calendar,
  ArrowRight,
  ScanLine,
  Fingerprint,
  Hexagon,
  Shield,
  Activity,
  Stethoscope,
  Dna,
  FileBadge,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../components/ToastSystem";
import { AppPath, UserRole } from "../types";
import { api } from "../api";

interface PatientAuthProps {
  role: UserRole;
  onLogin: () => void;
  onNavigate: (path: AppPath) => void;
  initialMode: "login" | "signup";
}

export const PatientAuth: React.FC<PatientAuthProps> = ({
  role,
  onLogin,
  onNavigate,
  initialMode,
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Theme Colors
  const isDoctor = role === UserRole.DOCTOR;
  const themeColor = isDoctor ? "text-neonIndigo" : "text-neonCyan";
  const themeBg = isDoctor ? "bg-neonIndigo" : "bg-neonCyan";
  const themeBorder = isDoctor ? "border-neonIndigo" : "border-neonCyan";
  const themeShadow = isDoctor ? "shadow-neonIndigo/20" : "shadow-neonCyan/20";

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [licenseId, setLicenseId] = useState("");

  // Validation State
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const toast = useToast();

  useEffect(() => {
    setIsLogin(initialMode === "login");
    // Reset fields on mode switch
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setAge("");
    setLicenseId("");
    setTouched({});
  }, [initialMode, role]);

  const getErrors = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = "REQUIRED";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "INVALID FORMAT";

    if (!password) {
      errs.password = "REQUIRED";
    } else if (!isLogin) {
      if (password.length < 8) errs.password = "MIN 8 CHARS";
      if (confirmPassword !== password) errs.confirmPassword = "MISMATCH";
    }

    if (!isLogin) {
      if (!fullName) errs.fullName = "REQUIRED";
      if (!isDoctor && !age) errs.age = "REQUIRED";
      if (isDoctor && !licenseId) errs.licenseId = "REQUIRED";
    }
    return errs;
  };

  const errors = getErrors();
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      fullName: true,
      age: true,
      licenseId: true,
    });

    if (!isValid) return;
    setIsLoading(true);

    try {
      if (!isLogin) {
        // Signup with proper role
        await api.auth.signup({
          email,
          password,
          fullName,
          role: role, // Pass the role prop
          age: isDoctor ? undefined : age,
          licenseId: isDoctor ? licenseId : undefined,
          specialization: isDoctor ? "General Practitioner" : undefined,
        });
        toast.success(
          "Identity Minted",
          `New ${isDoctor ? "Provider" : "Patient"} node created.`,
        );
        setTimeout(() => {
          setIsLogin(true);
          onNavigate(isDoctor ? "/doctor/login" : "/patient/login");
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Login with proper role and password
      await api.auth.login(email, password, role);
      toast.success("Access Granted", "Decryption successful.");
      onLogin();
    } catch (error: any) {
      toast.error("Access Denied", error.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    id: string,
    type: string,
    label: string,
    value: string,
    setValue: (v: string) => void,
    icon: React.ReactNode,
    delay: number,
  ) => {
    const err = touched[id] && errors[id];
    const isFilled = value.length > 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 }}
        className="group relative"
      >
        <div
          className={`
          flex items-center bg-[#0B0F19]/80 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300
          ${err ? "border-red-500/50" : "border-white/10 group-focus-within:border-white/30"}
        `}
        >
          <div
            className={`
            w-12 h-14 flex items-center justify-center transition-colors border-r border-white/5
            ${err ? "text-red-400 bg-red-500/5" : isFilled ? themeColor : "text-slate-500"}
          `}
          >
            {icon}
          </div>

          <div className="flex-1 relative h-14">
            <input
              type={type}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => handleBlur(id)}
              className="w-full h-full bg-transparent border-none px-4 pt-4 pb-1 text-white placeholder-transparent focus:ring-0 text-sm font-medium tracking-wide z-10 relative"
              placeholder={label}
            />
            <label
              className={`
              absolute left-4 transition-all duration-300 pointer-events-none font-mono text-[10px] uppercase tracking-widest
              ${value ? "top-1.5 text-xs text-slate-500" : "top-4 text-slate-400"}
            `}
            >
              {label}
            </label>
          </div>

          {/* Status Indicator */}
          <div className="w-8 flex items-center justify-center">
            {err && <AlertCircle className="w-4 h-4 text-red-500" />}
            {!err && isFilled && (
              <CheckCircle2 className={`w-4 h-4 ${themeColor}`} />
            )}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute -bottom-5 right-0 text-[9px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-b"
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] ${themeBg} opacity-5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow`}
      ></div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-[1000px] min-h-[600px] bg-[#020408]/60 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row`}
      >
        {/* SCANNER LINE ANIMATION */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent z-50 animate-[scan_4s_ease-in-out_infinite] pointer-events-none opacity-30"></div>

        {/* --- LEFT PANEL: INTERACTIVE VISUAL --- */}
        <div className="w-full md:w-[45%] relative overflow-hidden bg-[#050914] flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/5 group">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>

          {/* Central Hologram */}
          <div className="relative z-10 w-64 h-64 flex items-center justify-center">
            {/* Rotating Rings */}
            <div
              className={`absolute inset-0 border ${themeBorder} opacity-20 rounded-full border-t-transparent animate-[spin_8s_linear_infinite]`}
            ></div>
            <div
              className={`absolute inset-4 border ${themeBorder} opacity-20 rounded-full border-b-transparent animate-[spin_12s_linear_infinite_reverse]`}
            ></div>

            {/* Core Icon */}
            <div className="relative z-20 w-32 h-32 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
              {isDoctor ? (
                <Stethoscope
                  className={`w-16 h-16 ${themeColor} drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]`}
                />
              ) : (
                <Dna
                  className={`w-16 h-16 ${themeColor} drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]`}
                />
              )}
            </div>
          </div>

          {/* Role Title */}
          <div className="mt-8 text-center relative z-10">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs font-mono font-bold tracking-[0.3em] uppercase mb-2 ${themeColor}`}
            >
              {isDoctor ? "Authorized Provider" : "Patient Node"}
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              HealthChain
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-[240px] mx-auto leading-relaxed">
              {isDoctor
                ? "Secure institutional access for medical professionals."
                : "Self-sovereign identity for personal health records."}
            </p>
          </div>

          {/* Floating Data Tags */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 opacity-50">
            <div className="text-[9px] font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded bg-black/40">
              TLS 1.3 ENCRYPTED
            </div>
            <div className="text-[9px] font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded bg-black/40">
              NODE: US-WEST
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: FORM --- */}
        <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-center bg-[#020408]/80">
          {/* Header Switcher */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hexagon className={`w-4 h-4 ${themeColor}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isLogin ? "Authentication" : "Registration"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                {isLogin ? "Access Terminal" : "Mint Identity"}
              </h1>
            </div>

            {/* Quick Role Toggle (Hidden if on strictly separate routes, but useful for demo) */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
              <button
                onClick={() =>
                  onNavigate(isLogin ? "/patient/login" : "/patient/signup")
                }
                className={`p-2 rounded-md transition-all ${!isDoctor ? "bg-neonCyan/20 text-neonCyan" : "text-slate-500 hover:text-white"}`}
                title="Patient Mode"
              >
                <UserIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  onNavigate(isLogin ? "/doctor/login" : "/doctor/signup")
                }
                className={`p-2 rounded-md transition-all ${isDoctor ? "bg-neonIndigo/20 text-neonIndigo" : "text-slate-500 hover:text-white"}`}
                title="Doctor Mode"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-w-sm mx-auto w-full"
          >
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {renderInput(
                    "fullName",
                    "text",
                    "Full Name",
                    fullName,
                    setFullName,
                    <UserIcon className="w-4 h-4" />,
                    1,
                  )}
                  {isDoctor
                    ? renderInput(
                        "licenseId",
                        "text",
                        "Medical License ID",
                        licenseId,
                        setLicenseId,
                        <FileBadge className="w-4 h-4" />,
                        2,
                      )
                    : renderInput(
                        "age",
                        "number",
                        "Age",
                        age,
                        setAge,
                        <Calendar className="w-4 h-4" />,
                        2,
                      )}
                </motion.div>
              )}
            </AnimatePresence>

            {renderInput(
              "email",
              "email",
              "Network ID",
              email,
              setEmail,
              <Mail className="w-4 h-4" />,
              3,
            )}
            {renderInput(
              "password",
              "password",
              "Private Key",
              password,
              setPassword,
              <Lock className="w-4 h-4" />,
              4,
            )}

            {!isLogin &&
              renderInput(
                "confirmPassword",
                "password",
                "Confirm Key",
                confirmPassword,
                setConfirmPassword,
                <Shield className="w-4 h-4" />,
                5,
              )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`
                group relative w-full h-14 mt-8 overflow-hidden rounded-xl font-bold tracking-widest text-xs uppercase
                ${isDoctor ? "bg-indigo-600" : "bg-cyan-600"} text-white shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : isLogin ? (
                  <ScanLine className="w-5 h-5" />
                ) : (
                  <Fingerprint className="w-5 h-5" />
                )}
                {isLogin ? "Decrypt & Enter" : "Generate Block"}
              </div>
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <button
              onClick={() => {
                const target = isDoctor
                  ? isLogin
                    ? "/doctor/signup"
                    : "/doctor/login"
                  : isLogin
                    ? "/patient/signup"
                    : "/patient/login";
                setIsLogin(!isLogin);
                onNavigate(target as AppPath);
              }}
              className={`text-xs font-mono font-medium ${themeColor} hover:underline flex items-center justify-center gap-2 mx-auto`}
            >
              {isLogin
                ? "NO IDENTITY FOUND? MINT NEW"
                : "ALREADY VERIFIED? ACCESS TERMINAL"}{" "}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Decorative Corner Brackets */}
          <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-white/20"></div>
          <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/20"></div>
          <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/20"></div>
          <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/20"></div>
        </div>
      </motion.div>
    </div>
  );
};
