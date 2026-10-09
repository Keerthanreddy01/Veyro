import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href?: string;
  to?: string;
  children?: ReactNode;
  className?: string;
}

const Link: React.FC<LinkProps> = ({ href, to, children, className, ...rest }) => {
  const target = href || to || '#';
  const isExternal =
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:') ||
    target.startsWith('tel:') ||
    target.startsWith('#');

  if (isExternal) {
    return (
      <a
        href={target}
        className={className}
        target={target.startsWith('http') ? '_blank' : undefined}
        rel={target.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={target} className={className} {...(rest as any)}>
      {children}
    </RouterLink>
  );
};

export default Link;
export { Link };
