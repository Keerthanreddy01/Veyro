import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle, XCircle, BookOpen, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

export default function VerifyCertificatePage() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    api.get(`/verify/${code}`)
      .then(({ data: d }) => { setData(d); setValid(true); })
      .catch(() => setValid(false))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4fa]">
      <div className="bg-white rounded-3xl p-12 w-80 animate-pulse shadow-sm" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4fa] px-4 py-8">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80">
          {valid ? (
            <>
              <div className="w-16 h-16 rounded-3xl bg-[#fff3c4] text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <Award size={36} />
              </div>
              <div className="inline-flex items-center gap-1.5 text-emerald-800 bg-[#d4f4dd] px-3.5 py-1 rounded-full text-xs font-bold mb-4">
                <CheckCircle size={14} /> <span>Official Verified Certificate</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">{data.student?.name}</h1>
              <p className="text-slate-500 text-xs mb-3">has successfully completed the curriculum for</p>
              <p className="text-lg font-extrabold text-indigo-900 mb-6">{data.course?.title}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 rounded-2xl p-3.5 text-left border border-slate-100">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Issued Date</p>
                  <p className="text-slate-800 font-bold text-xs mt-0.5">
                    {new Date(data.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3.5 text-left border border-slate-100">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Verification Code</p>
                  <p className="text-slate-800 font-mono font-bold text-xs mt-0.5">{code}</p>
                </div>
              </div>
              <p className="text-emerald-700 text-xs font-bold">✓ Authenticity verified by Veyro Distance Education Portal</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <XCircle size={36} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Invalid Certificate</h1>
              <p className="text-slate-500 text-xs">No active certificate records found for code: <span className="font-mono font-bold text-slate-700">{code}</span></p>
            </>
          )}

          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950 font-bold text-xs transition-colors"
          >
            <ArrowLeft size={14} /> Back to Veyro
          </Link>
        </div>
      </div>
    </div>
  );
}
