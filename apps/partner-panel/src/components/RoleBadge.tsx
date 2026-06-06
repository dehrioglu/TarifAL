import type { PartnerRole } from '../types';
import { roleLabels } from '../utils/format';

interface RoleBadgeProps {
  role: PartnerRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <span className={`role-badge role-badge--${role}`}>{roleLabels[role]}</span>;
}
