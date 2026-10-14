import React, { useState } from 'react';
import { Sparkles, User, GraduationCap, Compass, ArrowRight, ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';

const GRADES = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Undergraduate',
  'Professional',
];

const HOBBIES = [
  'Computer Science',
  'AI & Robotics',
  'Web Development',
  'UI/UX Design',
  'Applied Mathematics',
  'Physics & Quantum',
  'Creative Writing',
  'Cybersecurity',
  'Data Science',
  'Entrepreneurship',
  'Music & Sound Design',
  'Robotics',
];

export default function StudentOnboardingModal() {
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState(user?.name || '');
  const [selectedGrade, setSelectedGrade] = useState(user?.grade || 'Grade 10');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(user?.hobbies || []);
  const [bio, setBio] = useState(user?.bio || '');
  const [submitting, setSubmitting] = useState(false);

  // If user is not student or has completed onboarding, do not display
  if (!user || user.role !== 'student' || user.onboardingCompleted) {
    return null;
  }

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const handleComplete = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter your full official name');
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: fullName.trim(),
        grade: selectedGrade,
        hobbies: selectedHobbies,
        bio: bio.trim(),
        onboardingCompleted: true,
      });

      updateUser({
        name: data.user.name,
        grade: data.user.grade,
        hobbies: data.user.hobbies,
        bio: data.user.bio,
        onboardingCompleted: true,
      });

      toast.success('Welcome to Veyro! Your academic profile is configured.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete profile onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#171717]/60 backdrop-blur-sm transition-opacity" />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E7E2DA] shadow-2xl p-6 sm:p-8 z-10 font-sans animate-slide-up">
        {/* Top Progress Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#E7E2DA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#171717] border border-[#E7E2DA]">
              <Sparkles size={16} className="text-[#E05638]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#77736D]">
                Student Onboarding · Step {step} of 3
              </span>
              <h2 className="text-base font-semibold text-[#171717]">Setup Your Learning Journey</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-[#E05638]' : s < step ? 'w-2 bg-[#171717]' : 'w-2 bg-[#E7E2DA]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Legal / Official Name */}
        {step === 1 && (
          <div className="py-6 space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#77736D] flex items-center gap-1.5">
                <User size={13} className="text-[#171717]" />
                <span>Confirm Your Official Name</span>
              </label>
              <h3 className="text-xl font-serif text-[#171717] font-normal">
                What is your correct full name?
              </h3>
              <p className="text-xs text-[#77736D] leading-relaxed">
                This exact name will be minted onto your SHA-256 cryptographically verified completion certificates.
              </p>
            </div>

            <div className="pt-2">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="text-base font-medium py-3"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: Class / Grade Selection */}
        {step === 2 && (
          <div className="py-6 space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#77736D] flex items-center gap-1.5">
                <GraduationCap size={13} className="text-[#171717]" />
                <span>Academic Grade / Class</span>
              </label>
              <h3 className="text-xl font-serif text-[#171717] font-normal">
                Which grade are you studying in?
              </h3>
              <p className="text-xs text-[#77736D] leading-relaxed">
                We use your grade to recommend the most relevant curriculum milestones and coursework.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {GRADES.map((g) => {
                const isSelected = selectedGrade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGrade(g)}
                    className={`p-3 rounded-2xl text-xs font-semibold transition-all border text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                        : 'bg-[#FAF8F4] text-[#4A463F] border-[#E7E2DA] hover:border-[#A99B8A] hover:bg-white'
                    }`}
                  >
                    <span>{g}</span>
                    {isSelected && <Check size={12} className="text-[#E05638]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Hobbies & Passions */}
        {step === 3 && (
          <div className="py-6 space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#77736D] flex items-center gap-1.5">
                <Compass size={13} className="text-[#171717]" />
                <span>Interests & Passions</span>
              </label>
              <h3 className="text-xl font-serif text-[#171717] font-normal">
                What are your favorite hobbies?
              </h3>
              <p className="text-xs text-[#77736D] leading-relaxed">
                Select topics you love to personalize your student profile and study recommendations.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 max-h-48 overflow-y-auto pr-1">
              {HOBBIES.map((hobby) => {
                const isSelected = selectedHobbies.includes(hobby);
                return (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => toggleHobby(hobby)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#E05638] text-white border-[#E05638] shadow-2xs'
                        : 'bg-[#FAF8F4] text-[#4A463F] border-[#E7E2DA] hover:border-[#A99B8A]'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{hobby}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-[#77736D] mb-1">
                Short bio or academic motto (optional)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Aspiring systems engineer passionate about decentralized compute."
                className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#171717] resize-none"
              />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-5 border-t border-[#E7E2DA]">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (step === 1 && !fullName.trim()) {
                  toast.error('Please enter your full name');
                  return;
                }
                setStep((s) => (s + 1) as 2 | 3);
              }}
              className="gap-1.5 bg-[#171717] hover:bg-[#333]"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleComplete}
              isLoading={submitting}
              className="gap-1.5 bg-[#E05638] hover:bg-[#C9472B] text-white"
            >
              <CheckCircle2 size={15} />
              <span>Enter Veyro LMS</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
