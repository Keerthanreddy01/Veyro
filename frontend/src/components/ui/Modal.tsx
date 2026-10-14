import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171717]/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Body */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${widthClasses} bg-white rounded-2xl border border-[#E7E2DA] shadow-elevated p-6 z-10 animate-slide-up max-h-[90vh] overflow-y-auto font-sans`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#E7E2DA]/60">
          <div>
            {title && (
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#171717] leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-[#77736D] mt-1 font-sans">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#77736D] hover:text-[#171717] p-1 rounded-lg hover:bg-[#F6F2EC] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};
