import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  Search,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatCourseTitle } from '../utils/courseFormatters';

interface VerificationResult {
  valid: boolean;
  verificationCode: string;
  student: { _id: string; name: string; email: string };
  course: {
    _id: string;
    title: string;
    category?: string;
    level?: string;
    description?: string;
    instructorId?: { _id: string; name: string; email: string };
  };
  completedAt: string;
  certificateUrl?: string;
}

export default function CertificateVerifyPage() {
  const { code: routeCode } = useParams<{ code?: string }>();
  const [searchCode, setSearchCode] = useState(routeCode || '');
  const [loading, setLoading] = useState(Boolean(routeCode));
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const performVerification = async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim();
    if (!trimmed) {
      toast.error('Please enter a verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.get(`/verify/${trimmed}`);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or unissued certificate verification code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeCode) {
      setSearchCode(routeCode);
      performVerification(routeCode);
    }
  }, [routeCode]);

  const handleCopyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.verificationCode);
    setCopied(true);
    toast.success('Verification code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] py-10 sm:py-16 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8 animate-fade-in">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77736D] hover:text-[#171717] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Curricula</span>
          </Link>
          <Badge variant="verified" icon={<ShieldCheck size={12} />}>
            Cryptographic Registry
          </Badge>
        </div>

        {/* Verification Card Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#171717] shadow-2xs">
            <Award size={28} className="text-[#556943]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#171717]">
            Certificate Authenticity Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#77736D] max-w-md mx-auto">
            Independently verify official Veyro LMS certificates and student accreditation records.
          </p>
        </div>

        {/* Code Input Box */}
        <Card className="p-4 sm:p-5 shadow-subtle border-[#E7E2DA]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performVerification(searchCode);
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Enter unique Certificate Code (e.g. 550e8400-e29b-41d4...)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                leftIcon={<Search size={15} />}
                className="py-2.5 text-xs font-mono"
              />
            </div>
            <Button
              variant="primary"
              type="submit"
              isLoading={loading}
              className="w-full sm:w-auto text-xs"
            >
              Verify Credential
            </Button>
          </form>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
            <p className="text-xs text-[#77736D]">Querying server-authoritative accreditation ledger...</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {error && !loading && (
          <Card className="p-8 text-center space-y-4 border-red-200 bg-red-50/30">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto text-red-600">
              <XCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-red-900 font-semibold">
                Invalid or Unverified Certificate Code
              </h3>
              <p className="text-xs text-red-700 max-w-sm mx-auto">
                {error}
              </p>
            </div>
            <p className="text-[11px] text-[#77736D]">
              Double check the verification code printed on the official certificate document.
            </p>
          </Card>
        )}

        {/* Verification Success Result */}
        {result && result.valid && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* Authenticity Banner */}
            <div className="p-4 rounded-2xl bg-[#F6F8F3] border border-[#E2E8DC] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8DC] flex items-center justify-center text-[#556943] flex-shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-[#171717]">
                    Official Verified Credential
                  </h3>
                  <p className="text-xs text-[#77736D]">
                    Issued by Veyro Accreditation Authority upon 90% video attendance & passed examination.
                  </p>
                </div>
              </div>

              <Badge variant="published" icon={<ShieldCheck size={11} />}>
                Active & Authentic
              </Badge>
            </div>

            {/* Detailed Certificate Record Card */}
            <Card className="p-6 sm:p-8 space-y-6 shadow-subtle border-[#E7E2DA]">
              {/* Graduate & Curriculum Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#E7E2DA]">
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#77736D] font-semibold flex items-center gap-1.5">
                    <User size={13} className="text-[#6F8FA8]" /> Graduate Scholar
                  </span>
                  <p className="font-serif text-2xl text-[#171717]">
                    {result.student?.name || 'Accredited Student'}
                  </p>
                  <p className="text-xs text-[#77736D] font-mono">
                    {result.student?.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#77736D] font-semibold flex items-center gap-1.5">
                    <BookOpen size={13} className="text-[#777B61]" /> Completed Curriculum
                  </span>
                  <p className="font-serif text-xl text-[#171717]">
                    {formatCourseTitle(result.course?.title)}
                  </p>
                  <p className="text-xs text-[#77736D]">
                    {result.course?.category || 'General Curriculum'} • {result.course?.level || 'All Levels'}
                  </p>
                </div>
              </div>

              {/* Completion Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-1">
                  <span className="text-[#77736D] flex items-center gap-1">
                    <Calendar size={13} className="text-[#6F8FA8]" /> Completion Date
                  </span>
                  <p className="font-semibold text-[#171717]">
                    {new Date(result.completedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-1">
                  <span className="text-[#77736D] flex items-center gap-1">
                    <User size={13} className="text-[#777B61]" /> Faculty Instructor
                  </span>
                  <p className="font-semibold text-[#171717]">
                    {result.course?.instructorId?.name || 'Veyro Faculty'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-1">
                  <span className="text-[#77736D] flex items-center gap-1">
                    <ShieldCheck size={13} className="text-[#556943]" /> Integrity Standard
                  </span>
                  <p className="font-semibold text-[#556943]">
                    Server-Audited & Certified
                  </p>
                </div>
              </div>

              {/* Unique Verification Hash Box */}
              <div className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-[#77736D]">Unique Verification Identifier:</span>
                  <p className="font-mono font-bold text-sm text-[#171717] mt-0.5 break-all">
                    {result.verificationCode}
                  </p>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E7E2DA] text-[#171717] hover:border-[#171717] transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer text-xs"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Download or View PDF Link */}
              {result.certificateUrl && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <a
                    href={result.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button variant="primary" leftIcon={<Download size={14} />} className="w-full sm:w-auto text-xs">
                      Download Official PDF Certificate
                    </Button>
                  </a>
                </div>
              )}
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
