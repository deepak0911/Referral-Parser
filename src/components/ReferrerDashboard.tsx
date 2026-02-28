import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  ExternalLink, 
  Filter, 
  Search,
  MoreHorizontal,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Referral {
  id: number;
  candidate_name: string;
  candidate_email: string;
  role_title: string;
  job_ids: string; // JSON string
  why_fit: string;
  context: string;
  fit_score: number;
  fit_summary: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export function ReferrerDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchReferrals = async () => {
    try {
      const response = await fetch("/api/referrals");
      const data = await response.json();
      setReferrals(data);
    } catch (error) {
      console.error("Failed to fetch referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/referrals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchReferrals();
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 5) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-red-600 bg-red-50 border-red-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Referral Inbox</h1>
          <p className="text-sm sm:text-base text-black/40">Manage and pre-screen your candidate requests.</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg sm:rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white text-xs sm:text-sm"
            />
          </div>
          <button className="p-2 rounded-lg sm:rounded-xl border border-black/10 hover:bg-black/5 transition-all bg-white">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* List View */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {referrals.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-black/5">
              <p className="text-sm sm:text-base text-black/40">No referral requests yet.</p>
            </div>
          ) : (
            referrals.map((ref) => (
              <motion.div 
                layout
                key={ref.id}
                onClick={() => setSelectedId(ref.id)}
                className={`group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all cursor-pointer hover:shadow-md ${selectedId === ref.id ? "border-emerald-500 ring-1 ring-emerald-500" : "border-black/5"}`}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                      {ref.candidate_name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">{ref.candidate_name}</h3>
                      <p className="text-xs sm:text-sm text-black/40">{ref.role_title}</p>
                    </div>
                  </div>
                  <div className={`px-2 sm:px-3 py-1 rounded-full border text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 ${getScoreColor(ref.fit_score)}`}>
                    {ref.fit_score >= 8 ? <TrendingUp size={10} /> : ref.fit_score <= 4 ? <TrendingDown size={10} /> : <Clock size={10} />}
                    <span className="hidden sm:inline">Fit Score:</span> {ref.fit_score}/10
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-black/40 font-medium">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Mail size={10} /> {ref.candidate_email}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5 uppercase tracking-wider">
                    {ref.context}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Clock size={10} /> {new Date(ref.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedId ? (
              <motion.div 
                key={selectedId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-black/5 sticky top-20 sm:top-24 shadow-sm"
              >
                {(() => {
                  const ref = referrals.find(r => r.id === selectedId);
                  if (!ref) return null;
                  return (
                    <div className="space-y-6 sm:space-y-8">
                      <div>
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                          <h2 className="text-xl sm:text-2xl font-bold">Candidate Detail</h2>
                          <button onClick={() => setSelectedId(null)} className="text-black/20 hover:text-black">
                            <XCircle size={20} />
                          </button>
                        </div>
                        
                        <div className="space-y-4 sm:space-y-6">
                          <section>
                            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 block mb-1.5 sm:mb-2">AI Fit Analysis</label>
                            <div className="bg-emerald-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-100">
                              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-emerald-900 font-medium">
                                {ref.fit_summary}
                              </p>
                            </div>
                          </section>

                          <section>
                            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 block mb-1.5 sm:mb-2">Why they are a fit</label>
                            <p className="text-xs sm:text-sm text-black/70 leading-relaxed italic">
                              "{ref.why_fit}"
                            </p>
                          </section>

                          <section>
                            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 block mb-1.5 sm:mb-2">Job IDs / URLs</label>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {(() => {
                                try {
                                  const ids = JSON.parse(ref.job_ids);
                                  return Array.isArray(ids) ? ids.map((id, i) => (
                                    <a 
                                      key={i}
                                      href={id.startsWith('http') ? id : '#'} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-[10px] sm:text-xs bg-black/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-black/10 transition-all flex items-center gap-1 font-medium"
                                    >
                                      {id} <ExternalLink size={8} />
                                    </a>
                                  )) : <span className="text-xs sm:text-sm text-black/60">{ref.job_ids}</span>;
                                } catch (e) {
                                  return <span className="text-xs sm:text-sm text-black/60">{ref.job_ids}</span>;
                                }
                              })()}
                            </div>
                          </section>
                        </div>
                      </div>

                      <div className="pt-6 sm:pt-8 border-t border-black/5 grid grid-cols-2 gap-2 sm:gap-3">
                        <button 
                          onClick={() => updateStatus(ref.id, "approved")}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(ref.id, "rejected")}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-red-50 text-red-600 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-red-100 transition-all"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                        <button className="col-span-2 flex items-center justify-center gap-1.5 sm:gap-2 bg-black/5 text-black/60 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-black/10 transition-all">
                          <Mail size={14} /> Ask for more info
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            ) : (
              <div className="bg-black/[0.02] border-2 border-dashed border-black/5 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center h-48 sm:h-64">
                <MoreHorizontal className="text-black/10 mb-2 sm:mb-4" size={24} sm:size={32} />
                <p className="text-xs sm:text-sm text-black/30 font-medium">Select a candidate to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
