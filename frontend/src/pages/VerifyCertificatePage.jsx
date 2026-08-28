import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle, XCircle, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
      <div className="card p-12 w-80 animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="card p-8 text-center">
          {valid ? (
            <>
              <div className="p-4 rounded-full bg-amber-900/30 w-fit mx-auto mb-5">
                <Award size={48} className="text-amber-400" />
              </div>
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
                <CheckCircle size={18} /> <span className="font-semibold">Certificate Verified</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{data.student?.name}</h1>
              <p className="text-slate-400 mb-3">has successfully completed</p>
              <p className="text-xl font-semibold text-brand-400 mb-5">{data.course?.title}</p>
              <div className="bg-dark-800/60 rounded-xl p-3 mb-5">
                <p className="text-slate-400 text-xs">Completed on</p>
                <p className="text-white font-medium">{new Date(data.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="bg-dark-800/60 rounded-xl p-3 mb-5">
                <p className="text-slate-400 text-xs">Verification Code</p>
                <p className="text-white font-mono text-sm">{code}</p>
              </div>
              <p className="text-emerald-400 text-sm">✓ This certificate is authentic</p>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-red-900/30 w-fit mx-auto mb-5">
                <XCircle size={48} className="text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Invalid Certificate</h1>
              <p className="text-slate-400">No certificate found for code: <span className="font-mono text-slate-300">{code}</span></p>
            </>
          )}
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors text-sm">
            <BookOpen size={15} /> Back to Veyro
          </Link>
        </div>
      </div>
    </div>
  );
}
