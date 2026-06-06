import type { DashboardMetric } from '../types';

interface MetricCardProps {
  metric: DashboardMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${metric.tone}`}>
      <span className="metric-card__eyebrow">{metric.label}</span>
      <strong>{metric.value}</strong>
      <p>{metric.detail}</p>
    </article>
  );
}
