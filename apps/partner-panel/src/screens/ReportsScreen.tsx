import type { PartnerUser } from '../types';
import { reportService } from '../services/reportService';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { TrendBars } from '../components/TrendBars';

interface ReportsScreenProps {
  user: PartnerUser;
}

export function ReportsScreen({ user }: ReportsScreenProps) {
  const reports = reportService.getReports(user);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Performans"
        title="Raporlar ve dönüşüm"
        description="Sipariş, sepet, sponsorlu ürün ve işletme performansını demo verilerle izleyin."
      />

      <div className="report-grid">
        {reports.map((report) => (
          <PanelCard key={report.title} className="report-card">
            <span className="page-header__eyebrow">{report.title}</span>
            <strong>{report.value}</strong>
            <p>{report.trend}</p>
            <TrendBars values={report.series} />
          </PanelCard>
        ))}
      </div>
    </div>
  );
}
