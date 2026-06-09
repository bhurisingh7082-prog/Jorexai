import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/useAuth";
import { MoveRight, Loader2, ShieldAlert, ArrowLeft, X } from "lucide-react";
import { useAuthModal } from "../lib/authModalStore";

export default function AuthModal() {
  const { isOpen, closeModal, executePendingAction } = useAuthModal();
  const { signInWithOtp, verifyOtp, signInWithGoogle, user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"picker" | "email" | "otp">("picker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (user && isOpen) {
      // If user logs in successfully (e.g. via Google redirect if it works seamlessly, or already logged in)
      executePendingAction();
    }
  }, [user, isOpen, executePendingAction]);

  useEffect(() => {
    try {
      const accounts = JSON.parse(localStorage.getItem("jerox_accounts") || "[]");
      setSavedAccounts(accounts);
      if (accounts.length === 0) setStep("email");
      else setStep("picker");
    } catch(e) {
      setStep("email");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const removeAccount = (emailToRemove: string) => {
    const updated = savedAccounts.filter(a => a.email !== emailToRemove);
    setSavedAccounts(updated);
    localStorage.setItem("jerox_accounts", JSON.stringify(updated));
    if (updated.length === 0) setStep("email");
  };

  const handleAccountSelect = async (account: any) => {
    if (account.provider === "google") {
      handleGoogleLogin();
    } else {
      setEmail(account.email);
      setStep("email");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error: otpError } = await signInWithOtp(email);
      if (otpError) throw otpError;
      setStep("otp");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await verifyOtp(email, otp);
      if (verifyError) throw verifyError;
      executePendingAction();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) throw googleError;
      // Google Auth will redirect the page to complete login
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to continue with Google.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[400px] bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 relative mt-2">
          {step === "email" && savedAccounts.length > 0 && (
             <button onClick={() => setStep("picker")} className="absolute left-0 top-1.5 text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
               <ArrowLeft className="w-4 h-4" />
             </button>
          )}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 mb-6 border border-white/10 shadow-xl overflow-hidden relative">
             <div className="absolute inset-0 bg-brand-500/20 blur-xl"></div>
             <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">J</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-white mb-2 tracking-tight">
            Sign in to continue
          </h1>
          <p className="text-gray-400 text-sm">
             {step === "picker" ? "Select an account to continue" : "Sign in or create an account to continue"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {step === "picker" ? (
           <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {savedAccounts.map((account) => (
                 <div key={account.email} className="group flex items-center justify-between w-full bg-[#1e1e1e] border border-white/10 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex-1 flex items-center gap-4" onClick={() => handleAccountSelect(account)}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
                        {account.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-white font-medium text-sm truncate w-full">{account.email}</span>
                        <span className="text-xs text-gray-500 capitalize">{account.provider || "Email"}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeAccount(account.email); }}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                 </div>
              ))}
              <div 
                 onClick={() => setStep("email")}
                 className="flex items-center gap-4 w-full bg-transparent border border-dashed border-white/20 p-4 rounded-xl hover:border-white/40 hover:bg-white/5 transition-colors cursor-pointer mt-4"
              >
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 font-bold shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                 </div>
                 <span className="text-gray-300 font-medium text-sm">Add another account</span>
              </div>
           </div>
        ) : step === "email" ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 md:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !email.trim()}
                className="w-full py-3 md:py-3.5 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue with Email"}
              </button>
            </form>
            
            <div className="my-8 flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <div className="text-sm text-gray-500 font-medium">OR</div>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 md:py-3.5 rounded-xl font-medium bg-[#1e1e1e] border border-white/10 text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3 relative group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 absolute left-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
               {loading ? "Please wait..." : "Continue with Google"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Secure Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 md:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono tracking-widest text-lg"
              />
              <p className="text-sm text-gray-500 mt-3 ml-1">We sent a secure code to <span className="text-gray-300">{email}</span></p>
            </div>
            <button 
              type="submit" 
              disabled={loading || !otp.trim()}
              className="w-full py-3 md:py-3.5 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Verifying <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            <div className="text-center mt-6 flex justify-between px-2">
              <button 
                type="button" 
                onClick={() => { setStep("email"); setOtp(""); }} 
                className="text-sm text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                Use a different email
              </button>
              <button 
                type="button" 
                onClick={closeModal} 
                className="text-sm text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
