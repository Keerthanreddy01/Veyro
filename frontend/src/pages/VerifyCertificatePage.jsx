import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle,
  XCircle,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Sparkles,
  Printer,
  Copy
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VerifyCertificatePage() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    api.get(`/verify/${code}`)
      .then(({ data: d }) => {
        setData(d);
        setValid(true);
      })
      .catch(() => setValid(false))
      .finally(() => setLoading(false));
  }, [code]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Certificate code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7EE] p-6">
        <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full animate-pulse border border-[#111111]/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7EE] text-slate-900 px-4 py-12 selection:bg-[#FFF490] selection:text-[#111111]">
      <div className="w-full max-w-xl animate-slide-up space-y-6">
        
        {/* Main Certificate / Diploma Card */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 text-center shadow-xl border border-[#111111]/15 relative overflow-hidden">
          
          {/* Subtle Corner Accents */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#FFF490]/30 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          {valid ? (
            <div className="space-y-6 relative z-10">
              {/* Seal Stamp */}
              <div className="w-20 h-20 rounded-3xl bg-[#FFF490] border-2 border-[#111111] text-[#111111] flex items-center justify-center mx-auto shadow-xs">
                <Award size={42} />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-900 bg-[#d4f4dd] border border-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <CheckCircle size={14} className="text-emerald-700" />
                  <span>Officially Verified Credential</span>
                </div>
                
                <h1 className="font-syne font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
                  {data.student?.name}
                </h1>
                
                <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mt-2">
                  Has successfully fulfilled all accredited requirements for
                </p>

                <p className="font-syne font-bold text-xl sm:text-2xl text-slate-900 mt-2 leading-snug">
                  {data.course?.title}
                </p>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#FAF7EE] rounded-2xl p-4 text-left border border-[#111111]/10">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Issued Date</p>
                  <p className="text-slate-900 font-bold text-xs sm:text-sm mt-0.5">
                    {new Date(data.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="bg-[#FAF7EE] rounded-2xl p-4 text-left border border-[#111111]/10 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Audit Code</p>
                    <p className="text-slate-900 font-mono font-bold text-xs sm:text-sm mt-0.5">{code}</p>
                  </div>
                  <button
                    onClick={copyCode}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-black/5 transition-colors"
                    title="Copy certificate hash"
                  >
                    <Copy size={15} />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Tamper-proof authenticity certified by Veyro Ledger</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Printer size={14} />
                  <span>Print Credential</span>
                </button>
                <Link
                  to="/courses"
                  className="px-5 py-2.5 rounded-full bg-white border border-[#111111]/20 text-slate-800 text-xs font-bold hover:bg-[#FAF7EE] transition-all"
                >
                  Explore More Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
                <XCircle size={36} />
              </div>
              <h1 className="font-syne font-extrabold text-2xl text-slate-900">Invalid Certificate Code</h1>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                No active certificate record could be verified on the public ledger for code: <span className="font-mono font-bold text-slate-800">{code}</span>
              </p>
              <Link
                to="/courses"
                className="btn-dark-pill text-xs px-5 py-2.5 inline-flex"
              >
                <span>Browse Valid Catalog</span>
              </Link>
            </div>
          )}

        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
