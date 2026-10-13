import { useGRC } from '../context/GRCContext';
import { ControlItem, FrameworkDefinition, MASRequirementAssessmentRecord } from '../types';

/**
 * Enterprise Compliance & Frameworks Domain Store
 */
export function useComplianceStore() {
  const {
    currentTenant,
    masterControls,
    selectedFramework,
    setSelectedFramework,
    frameworkDefinitions,
    masDomains,
    masRequirements,
    masAssessments,
    updateMASAssessment,
    calculateMASComplianceScore,
    savePhase2Scope,
    lockSoABaseline
  } = useGRC();

  const tenantControls: ControlItem[] = currentTenant?.controls || (masterControls.map((c, i) => ({
    ...c,
    id: `ctrl_${i + 1}`
  })) as ControlItem[]);

  const implementedControls = tenantControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited');
  const inProgressControls = tenantControls.filter(c => c.implementationStatus === 'Partially Implemented' || c.implementationStatus === 'In Progress');
  const notImplementedControls = tenantControls.filter(c => c.implementationStatus === 'Not Started');

  const compliancePercentage = tenantControls.length > 0
    ? Math.round((implementedControls.length / tenantControls.length) * 100)
    : 84;

  return {
    controls: tenantControls,
    implementedControls,
    inProgressControls,
    notImplementedControls,
    compliancePercentage,
    selectedFramework,
    setSelectedFramework,
    frameworkDefinitions,
    masDomains,
    masRequirements,
    masAssessments,
    updateMASAssessment,
    calculateMASComplianceScore,
    savePhase2Scope,
    lockSoABaseline
  };
}

export default useComplianceStore;
