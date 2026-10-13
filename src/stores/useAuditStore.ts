import { useGRC } from '../context/GRCContext';
import { InternalAuditPlan, FindingCAPARecord, IndependentAuditValidation } from '../types';

/**
 * Enterprise Audit & Assurance Domain Store
 */
export function useAuditStore() {
  const {
    internalAudits,
    addInternalAudit,
    updateInternalAudit,
    updateChecklistItem,
    findings,
    addFinding,
    updateFinding,
    deleteFinding,
    validateAndCloseFinding,
    currentTenant
  } = useGRC();

  const tenantAudits = internalAudits.filter(a => !currentTenant?.id || a.tenantId === currentTenant.id);
  const tenantFindings = findings.filter(f => !currentTenant?.id || f.tenantId === currentTenant.id);

  const majorNonConformities = tenantFindings.filter(f => f.severity === 'Major Non-Conformity');
  const minorNonConformities = tenantFindings.filter(f => f.severity === 'Minor Non-Conformity');
  const observations = tenantFindings.filter(f => f.severity === 'Observation');
  const opportunities = tenantFindings.filter(f => f.severity === 'Opportunity for Improvement');

  const openFindings = tenantFindings.filter(f => f.status !== 'Closed Verified');
  const closedFindings = tenantFindings.filter(f => f.status === 'Closed Verified');

  return {
    audits: tenantAudits,
    findings: tenantFindings,
    openFindings,
    closedFindings,
    majorNonConformities,
    minorNonConformities,
    observations,
    opportunities,
    addInternalAudit,
    updateInternalAudit,
    updateChecklistItem,
    addFinding,
    updateFinding,
    deleteFinding,
    validateAndCloseFinding
  };
}

export default useAuditStore;
