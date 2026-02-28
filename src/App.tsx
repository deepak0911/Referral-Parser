import { useState } from "react";
import { CandidateForm } from "./components/CandidateForm";
import { ReferrerDashboard } from "./components/ReferrerDashboard";
import { UserCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [view, setView] = useState<"landing" | "candidate" | "referrer">("landing");

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#0a0a0a] font-sans selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView("landing")}
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <span className="font-bold tracking-tight text-lg">Referral Central</span>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setView("candidate")}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${view === "candidate" ? "bg-black text-white" : "hover:bg-black/5"}`}
            >
              For Candidates
            </button>
            <button 
              onClick={() => setView("referrer")}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${view === "referrer" ? "bg-black text-white" : "hover:bg-black/5"}`}
            >
              Referrer Login
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-12 sm:py-20"
            >
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 sm:mb-8 leading-[0.9]">
                Referrals, <br />
                <span className="text-emerald-600">Pre-Screened.</span>
              </h1>
              <p className="text-lg sm:text-xl text-black/60 max-w-2xl mb-8 sm:mb-12 leading-relaxed px-4">
                Centralize your referral requests. Let AI analyze resumes against job descriptions 
                so you only refer the best candidates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4">
                <button 
                  onClick={() => setView("candidate")}
                  className="group bg-black text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-black/10"
                >
                  Submit a Request
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setView("referrer")}
                  className="bg-white border border-black/10 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-black/5 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}

          {view === "candidate" && (
            <motion.div 
              key="candidate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CandidateForm onBack={() => setView("landing")} />
            </motion.div>
          )}

          {view === "referrer" && (
            <motion.div 
              key="referrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ReferrerDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-black/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-black/40">
          <p>© 2024 Referral Gatekeeper. Built with Gemini AI.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
