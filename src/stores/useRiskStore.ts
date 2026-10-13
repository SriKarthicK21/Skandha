import { useGRC } from '../context/GRCContext';
import { RiskRecord } from '../types';

/**
 * Enterprise Risk Management Domain Store
 */
export function useRiskStore() {
  const {
    risks,
    addRisk,
    updateRisk,
    deleteRisk,
    mapRiskToMasRequirement,
    unmapRiskFromMasRequirement,
    setRiskMasRequirements,
    masEnterpriseRiskProfile,
    getMasRequirementRiskExposure,
    getMasDomainExposureMetrics,
    getHeatmapCellMasExposure,
    getHeatmapMasExposureGrid,
    currentTenant
  } = useGRC();

  const tenantRisks = risks.filter(r => !currentTenant?.id || r.tenantId === currentTenant.id);

  const criticalRisks = tenantRisks.filter(r => r.residualScore >= 8 || r.inherentScore >= 8);
  const highRisks = tenantRisks.filter(r => (r.residualScore >= 5 && r.residualScore < 8) || (r.inherentScore >= 5 && r.inherentScore < 8));
  const mediumRisks = tenantRisks.filter(r => r.residualScore >= 3 && r.residualScore < 5);
  const lowRisks = tenantRisks.filter(r => r.residualScore < 3);

  return {
    risks: tenantRisks,
    allRisks: risks,
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    addRisk,
    updateRisk,
    deleteRisk,
    mapRiskToMasRequirement,
    unmapRiskFromMasRequirement,
    setRiskMasRequirements,
    masEnterpriseRiskProfile,
    getMasRequirementRiskExposure,
    getMasDomainExposureMetrics,
    getHeatmapCellMasExposure,
    getHeatmapMasExposureGrid
  };
}

export default useRiskStore;
