import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Calendar,
  Copy,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface VerificationData {
  certificate: {
    code: string;
    studentName: string;
    courseTitle: string;
    instructorName?: string;
    issuedAt: string;
    hash?: string;
  };
}

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!code) return;
    api.get(`/verify/${code}`)
      .then(({ data: d }) => {
        setData(d);
        setValid(true);
      })
      .catch(() => setValid(false))
      .finally(() => setLoading(false));
  }, [code]);

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success('Certificate credential hash copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6 font-sans">
        <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-xl space-y-6 animate-fade-in">
        
        {/* Navigation Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77736D] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Veyro home</span>
        </Link>

        {/* Certificate Credential Diploma Card */}
        <div className="bg-white rounded-3xl border border-[#E7E2DA] p-8 sm:p-12 text-center shadow-card relative overflow-hidden">
          {valid && data?.certificate ? (
            <div className="space-y-6">
              {/* Official Seal */}
              <div className="w-16 h-16 rounded-2xl bg-[#F6F8F3] border border-[#E2E8DC] text-[#556943] flex items-center justify-center mx-auto">
                <Award size={32} />
              </div>

              <div className="space-y-2">
                <Badge variant="verified" icon={<ShieldCheck size={12} />}>
                  Authentic Verified Credential
                </Badge>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#171717]">
                  Certificate of Achievement
                </h1>
                <p className="text-xs text-[#77736D]">
                  This certifies successful completion of all coursework and proctored examinations.
                </p>
              </div>

              {/* Recipient Block */}
              <div className="p-6 rounded-2xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-3 text-left">
                <div>
                  <p className="text-[10px] font-semibold text-[#77736D] uppercase">Conferred To</p>
                  <p className="font-serif text-xl sm:text-2xl text-[#171717] font-normal">
                    {data.certificate.studentName}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-[#77736D] uppercase">Curriculum</p>
                  <p className="font-sans font-semibold text-sm text-[#171717]">
                    {data.certificate.courseTitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E7E2DA]/60 flex items-center justify-between text-xs text-[#77736D]">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{new Date(data.certificate.issuedAt).toLocaleDateString()}</span>
                  </span>
                  {data.certificate.instructorName && (
                    <span>Instructor: {data.certificate.instructorName}</span>
                  )}
                </div>
              </div>

              {/* Hash Verification Key */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#F6F2EC] border border-[#E7E2DA] text-xs">
                <div className="text-left font-mono truncate max-w-xs text-[#77736D]">
                  <span className="text-[#171717] font-semibold">Hash:</span> {code}
                </div>
                <Button variant="secondary" size="sm" onClick={copyCode} leftIcon={<Copy size={13} />}>
                  Copy code
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF1F0] border border-[#F8D7D7] text-[#9F2A2A] flex items-center justify-center mx-auto">
                <XCircle size={32} />
              </div>
              <div className="space-y-2">
                <h1 className="font-serif text-3xl text-[#171717]">Credential Invalid</h1>
                <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                  No verified certificate was found matching identification code{' '}
                  <strong className="text-[#171717] font-mono">{code}</strong>.
                </p>
              </div>
              <Link to="/courses">
                <Button variant="secondary">Browse accredited courses</Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
