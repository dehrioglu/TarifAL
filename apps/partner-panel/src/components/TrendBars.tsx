interface TrendBarsProps {
  values: number[];
}

export function TrendBars({ values }: TrendBarsProps) {
  const max = Math.max(...values, 1);

  return (
    <div className="trend-bars" aria-hidden="true">
      {values.map((value, index) => (
        <span key={`${value}-${index}`} style={{ height: `${Math.max(18, (value / max) * 100)}%` }} />
      ))}
    </div>
  );
}
