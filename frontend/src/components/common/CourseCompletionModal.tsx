import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  studentName: string;
  existingCertificateCode?: string | null;
  onCertificateIssued?: (code: string) => void;
}

export const CourseCompletionModal: React.FC<CourseCompletionModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  studentName,
  existingCertificateCode,
  onCertificateIssued,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGenerateCertificate = async () => {
    if (existingCertificateCode) {
      navigate(`/verify/${existingCertificateCode}`);
      onClose();
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/courses/${courseId}/complete`);
      const certCode = data.enrollment?.certificateCode;
      toast.success('Congratulations! Your official certificate is ready.');
      if (certCode) {
        onCertificateIssued?.(certCode);
        navigate(`/verify/${certCode}`);
      }
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'Could not generate certificate. Please ensure all lessons and quizzes are completed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(`veyro_completion_dismissed_${courseId}`, 'true');
    } catch {}
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      maxWidth="md"
    >
      <div className="text-center py-4 px-2 space-y-5 font-sans">
        {/* Celebration Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center relative shadow-sm">
          <Award size={34} className="text-amber-600" />
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles size={13} />
          </div>
        </div>

        {/* Congratulatory Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Curriculum Completed</span>
          </div>

          <h2 className="font-serif text-2xl text-[#171717] font-normal leading-snug">
            Congratulations, {studentName || 'Scholar'}!
          </h2>

          <p className="text-sm text-[#555] leading-relaxed max-w-sm mx-auto">
            You've successfully completed <strong className="text-[#171717]">{courseTitle}</strong>.
          </p>

          <p className="text-xs text-[#77736D] pt-1">
            Your learning journey is complete. Your certificate is ready!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            className="w-full sm:w-auto min-w-[180px]"
            onClick={handleGenerateCertificate}
            isLoading={loading}
            leftIcon={<Award size={15} />}
          >
            {existingCertificateCode ? 'View Certificate' : 'Generate Certificate'}
          </Button>

          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={handleDismiss}
            disabled={loading}
          >
            Continue Learning
          </Button>
        </div>
      </div>
    </Modal>
  );
};
