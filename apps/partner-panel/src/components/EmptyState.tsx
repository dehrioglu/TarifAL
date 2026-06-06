interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">i</div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
