import { useGRC } from '../context/GRCContext';
import { EvidenceRecord } from '../types';

/**
 * Enterprise Evidence & Artifacts Domain Store
 */
export function useEvidenceStore() {
  const {
    evidence,
    uploadEvidence,
    verifyEvidenceChecksum,
    reviewEvidence,
    submitEvidenceForReview,
    deleteEvidence,
    currentTenant
  } = useGRC();

  const tenantEvidence = evidence.filter(e => !currentTenant?.id || e.tenantId === currentTenant.id);

  const verifiedEvidence = tenantEvidence.filter(e => e.status === 'Verified');
  const pendingEvidence = tenantEvidence.filter(e => e.status === 'Pending Review');
  const expiredEvidence = tenantEvidence.filter(e => e.status === 'Expired');
  const draftEvidence = tenantEvidence.filter(e => e.status === 'Draft' || e.status === 'Requires Update');

  return {
    evidence: tenantEvidence,
    allEvidence: evidence,
    verifiedEvidence,
    pendingEvidence,
    expiredEvidence,
    draftEvidence,
    uploadEvidence,
    verifyEvidenceChecksum,
    reviewEvidence,
    submitEvidenceForReview,
    deleteEvidence
  };
}

export default useEvidenceStore;
