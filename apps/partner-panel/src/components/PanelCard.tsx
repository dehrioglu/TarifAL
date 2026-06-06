import type { ReactNode } from 'react';

interface PanelCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PanelCard({ title, subtitle, action, children, className = '' }: PanelCardProps) {
  return (
    <section className={`panel-card ${className}`}>
      {(title || action) && (
        <div className="panel-card__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
