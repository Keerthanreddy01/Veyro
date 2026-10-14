import React from 'react';

export type BadgeVariant =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'verified'
  | 'neutral'
  | 'olive'
  | 'blue';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    draft: 'bg-[#F0E9DF] text-[#77736D] border-[#E7E2DA]',
    pending: 'bg-[#FAF8F4] text-[#A99B8A] border-[#E7E2DA]',
    published: 'bg-[#F6F2EC] text-[#777B61] border-[#E7E2DA]',
    rejected: 'bg-[#FFF1F0] text-[#9F2A2A] border-[#F8D7D7]',
    verified: 'bg-[#F6F8F3] text-[#556943] border-[#E2E8DC]',
    neutral: 'bg-[#F6F2EC] text-[#202020] border-[#E7E2DA]',
    olive: 'bg-[#F4F5EE] text-[#777B61] border-[#E2E4D4]',
    blue: 'bg-[#F0F5F8] text-[#4F6C82] border-[#DCE6ED]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans border transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0 text-[11px]">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
