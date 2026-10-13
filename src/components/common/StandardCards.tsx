import React from 'react';
import {
  Card,
  CardProps,
  CardHeader,
  CardHeaderProps,
  CardContent,
  CardBody,
  CardFooter,
  CardFooterProps,
  CardTitle,
  CardDescription,
  CardBadge
} from './Card';
import { LucideIcon } from 'lucide-react';

export interface StandardCardProps extends Omit<CardProps, 'variant' | 'title'> {
  icon?: LucideIcon | React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'sky' | 'slate' | 'default';
  action?: React.ReactNode;
  headerBordered?: boolean;
}

/**
 * <KpiCard />
 * Purpose-built card for key performance & compliance indicators.
 */
export const KpiCard: React.FC<StandardCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  headerBordered = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card variant="kpi" className={`min-h-[132px] ${className}`} {...props}>
      {(icon || title || badge || action) && (
        <CardHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
          action={action}
          bordered={headerBordered}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

/**
 * <StatusCard />
 * Visual card representing system health, continuous audit status, or certification gate.
 */
export const StatusCard: React.FC<StandardCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  headerBordered = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card variant="status" className={className} {...props}>
      {(icon || title || badge || action) && (
        <CardHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
          action={action}
          bordered={headerBordered}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

/**
 * <AnalyticsCard />
 * Card container optimized for charts, distributions, heatmap grids, and trend graphs.
 */
export const AnalyticsCard: React.FC<StandardCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  headerBordered = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card variant="analytics" className={className} {...props}>
      {(icon || title || badge || action) && (
        <CardHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
          action={action}
          bordered={headerBordered}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

/**
 * <ActionCard />
 * Actionable operational card for Next Best Actions, remediation desks, and CAPA queues.
 */
export const ActionCard: React.FC<StandardCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  headerBordered = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card variant="action" className={`min-h-[160px] ${className}`} {...props}>
      {(icon || title || badge || action) && (
        <CardHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
          action={action}
          bordered={headerBordered}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

/**
 * <RiskCard />
 * Standardized risk exposure card with threat-vulnerability linkage and scoring.
 */
export const RiskCard: React.FC<StandardCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  headerBordered = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card variant="risk" className={className} {...props}>
      {(icon || title || badge || action) && (
        <CardHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
          action={action}
          bordered={headerBordered}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

/**
 * <EvidenceCard />
 * Structured evidence artifact card with cryptographic hash, validity, and control linkage.
 */
export const EvidenceCard: React.FC<StandardCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  headerBordered = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card variant="evidence" className={className} {...props}>
      {(icon || title || badge || action) && (
        <CardHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
          action={action}
          bordered={headerBordered}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

/**
 * <ComplianceCard />
 * Multi-framework compliance requirement and control mapping card.
 */
export const ComplianceCard: React.FC<StandardCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  headerBordered = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card variant="compliance" className={className} {...props}>
      {(icon || title || badge || action) && (
        <CardHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
          action={action}
          bordered={headerBordered}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

/**
 * <ExecutiveCard />
 * High-density executive card for Board and CISO reports with clean typography and lineage.
 */
export const ExecutiveCard: React.FC<StandardCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  headerBordered = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card variant="executive" className={className} {...props}>
      {(icon || title || badge || action) && (
        <CardHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
          action={action}
          bordered={headerBordered}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export { CardHeader, CardContent, CardBody, CardFooter, CardTitle, CardDescription, CardBadge };
