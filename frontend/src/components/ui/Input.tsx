import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#202020]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[#A99B8A] pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white text-[#202020] placeholder:text-[#A99B8A] text-sm rounded-xl border border-[#E7E2DA] transition-all duration-150 outline-none focus:border-[#6F8FA8] focus:ring-2 focus:ring-[#6F8FA8]/15 disabled:bg-[#F6F2EC] disabled:text-[#77736D] ${
              leftIcon ? 'pl-9' : 'px-3.5'
            } ${rightIcon ? 'pr-9' : 'px-3.5'} py-2.5 ${
              error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : ''
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[#A99B8A] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#77736D]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
