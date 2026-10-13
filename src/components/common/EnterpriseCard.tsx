import React from 'react';
import {
  Card,
  CardProps,
  CardHeader,
  CardHeaderProps,
  CardContent,
  CardFooter,
  CardFooterProps,
  CardVariant
} from './Card';

export interface EnterpriseCardProps extends CardProps {
  hasWarning?: boolean;
  hasCritical?: boolean;
  hasSuccess?: boolean;
}

export const EnterpriseCard: React.FC<EnterpriseCardProps> = ({
  hasWarning,
  hasCritical,
  hasSuccess,
  status,
  ...props
}) => {
  const resolvedStatus = hasCritical
    ? 'critical'
    : hasWarning
    ? 'warning'
    : hasSuccess
    ? 'success'
    : status || 'default';

  return <Card status={resolvedStatus} {...props} />;
};

export interface EnterpriseCardHeaderProps extends CardHeaderProps {}
export const EnterpriseCardHeader: React.FC<EnterpriseCardHeaderProps> = (props) => {
  return <CardHeader {...props} />;
};

export const EnterpriseCardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = (props) => {
  return <CardContent {...props} />;
};

export interface EnterpriseCardFooterProps extends CardFooterProps {}
export const EnterpriseCardFooter: React.FC<EnterpriseCardFooterProps> = (props) => {
  return <CardFooter {...props} />;
};

export default EnterpriseCard;
