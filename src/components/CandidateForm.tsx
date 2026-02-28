import React, { useState } from "react";
import { Upload, Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface CandidateFormProps {
  onBack: () => void;
}

export function CandidateForm({ onBack }: CandidateFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    candidate_name: "",
    candidate_email: "",
    role_title: "",
    why_fit: "",
    context: "Former Colleague",
  });
  const [jobIds, setJobIds] = useState<string[]>([""]);
  const [file, setFile] = useState<File | null>(null);

  const addJobId = () => setJobIds([...jobIds, ""]);
  const removeJobId = (index: number) => {
    if (jobIds.length > 1) {
      setJobIds(jobIds.filter((_, i) => i !== index));
    }
  };
  const updateJobId = (index: number, value: string) => {
    const newJobIds = [...jobIds];
    newJobIds[index] = value;
    setJobIds(newJobIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload your resume");
    if (jobIds.some(id => !id.trim())) return alert("Please fill in all Job IDs or remove empty ones");

    setStatus("submitting");
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value as string));
    data.append("job_ids", JSON.stringify(jobIds));
    data.append("resume", file);

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4">Request Submitted!</h2>
        <p className="text-black/60 mb-8">
          Your referral request has been sent. Our AI is currently analyzing your fit. 
          The referrer will review it and get back to you soon.
        </p>
        <button 
          onClick={onBack}
          className="bg-black text-white px-8 py-3 rounded-xl font-medium"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-black/40 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-sm border border-black/5">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Referral Intake</h2>
        <p className="text-sm sm:text-base text-black/60 mb-6 sm:mb-10">Fill out the details below to request a referral.</p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black/40">Full Name</label>
              <input 
                required
                type="text"
                placeholder="Jane Doe"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.candidate_name}
                onChange={e => setFormData({...formData, candidate_name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black/40">Email Address</label>
              <input 
                required
                type="email"
                placeholder="jane@example.com"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.candidate_email}
                onChange={e => setFormData({...formData, candidate_email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black/40">Primary Role Title</label>
            <input 
              required
              type="text"
              placeholder="Senior Software Engineer"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={formData.role_title}
              onChange={e => setFormData({...formData, role_title: e.target.value})}
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black/40">Job IDs / URLs</label>
            {jobIds.map((id, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  required
                  type="text"
                  placeholder="e.g. JOB-123"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={id}
                  onChange={e => updateJobId(index, e.target.value)}
                />
                {jobIds.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeJobId(index)}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button"
              onClick={addJobId}
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              + Add another Job ID
            </button>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black/40">Context</label>
            <select 
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
              value={formData.context}
              onChange={e => setFormData({...formData, context: e.target.value})}
            >
              <option>Former Colleague</option>
              <option>University / Alumni</option>
              <option>Cold Reach Out</option>
              <option>Friend / Family</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black/40">Why are you a fit?</label>
            <textarea 
              required
              rows={3}
              placeholder="I have 5 years of experience in..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              value={formData.why_fit}
              onChange={e => setFormData({...formData, why_fit: e.target.value})}
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black/40">Resume (PDF)</label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <div className="border-2 border-dashed border-black/10 group-hover:border-emerald-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all bg-black/[0.02]">
                <Upload className="text-black/20 group-hover:text-emerald-500 transition-colors" size={20} />
                <span className="text-xs sm:text-sm font-medium text-black/60 text-center">
                  {file ? file.name : "Upload Resume (PDF)"}
                </span>
              </div>
            </div>
          </div>

          <button 
            disabled={status === "submitting"}
            type="submit"
            className="w-full bg-black text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/5"
          >
            {status === "submitting" ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Submit Request
                <Send size={16} />
              </>
            )}
          </button>

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium justify-center">
              <AlertCircle size={16} />
              Something went wrong. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
