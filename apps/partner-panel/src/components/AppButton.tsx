import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function AppButton({ variant = 'primary', size = 'md', className = '', children, ...props }: AppButtonProps) {
  return (
    <button className={`app-button app-button--${variant} app-button--${size} ${className}`} {...props}>
      {children}
    </button>
  );
}
