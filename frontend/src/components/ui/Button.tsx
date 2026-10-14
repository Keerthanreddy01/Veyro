import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#6F8FA8] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer';

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2 rounded-xl gap-2',
      lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-[#171717] hover:bg-[#2A2A2A] text-white border border-[#171717] shadow-sm hover:shadow',
      secondary:
        'bg-white hover:bg-[#FAF8F4] text-[#202020] border border-[#E7E2DA] shadow-2xs hover:border-[#A99B8A]',
      outline:
        'bg-transparent hover:bg-[#FAF8F4] text-[#202020] border border-[#E7E2DA] hover:border-[#171717]',
      ghost:
        'bg-transparent hover:bg-[#F0E9DF]/50 text-[#202020] border border-transparent',
      danger:
        'bg-[#BE123C] hover:bg-[#9F1239] text-white border border-[#BE123C] shadow-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
