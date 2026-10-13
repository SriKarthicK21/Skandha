import { ControlItem, RiskRecord, RiskSoASyncReport } from '../types';

/**
 * Extracts ISO 27001 control codes (e.g. "A.5.1", "A.8.7") from text or mapping arrays
 */
export function extractControlCodesFromRisk(risk: RiskRecord): string[] {
  const codes = new Set<string>();

  // Check structured frameworkMappings
  if (risk.frameworkMappings?.iso27001Controls) {
    risk.frameworkMappings.iso27001Controls.forEach(c => {
      const match = c.match(/A\.\d+\.\d+/);
      if (match) codes.add(match[0]);
      else if (c.trim()) codes.add(c.trim());
    });
  }

  // Check free-text mitigationControl
  if (risk.mitigationControl) {
    const matches = risk.mitigationControl.match(/A\.\d+\.\d+/g);
    if (matches) {
      matches.forEach(m => codes.add(m));
    }
  }

  return Array.from(codes);
}

/**
 * Analyzes the alignment between Risk Register (Cl. 6.1.2 & 6.1.3) and Statement of Applicability (Annex A)
 */
export function analyzeSoARiskAlignment(
  risks: RiskRecord[],
  controls: ControlItem[]
): RiskSoASyncReport {
  const controlMap = new Map<string, ControlItem>();
  controls.forEach(c => controlMap.set(c.controlCode, c));

  const unmappedMitigateRisks: RiskSoASyncReport['unmappedMitigateRisks'] = [];
  const conflicts: RiskSoASyncReport['conflicts'] = [];
  const linkedControlCodes = new Set<string>();

  // Evaluate Risks
  risks.forEach(risk => {
    const mappedCodes = extractControlCodesFromRisk(risk);

    if (risk.treatmentOption === 'Mitigate') {
      if (mappedCodes.length === 0) {
        unmappedMitigateRisks.push({
          riskId: risk.id,
          riskCode: risk.riskCode,
          title: risk.title,
          inherentScore: risk.inherentScore
        });
      } else {
        mappedCodes.forEach(code => {
          linkedControlCodes.add(code);
          const ctrl = controlMap.get(code);
          if (ctrl) {
            // Check conflict: control is excluded in SoA while an active risk requires it!
            if (!ctrl.applicable) {
              conflicts.push({
                type: 'CONTROL_EXCLUDED_WITH_OPEN_RISK',
                description: `Control ${code} is marked Excluded in SoA, but Risk ${risk.riskCode} ("${risk.title}") relies on it for treatment!`,
                riskCode: risk.riskCode,
                controlCode: code,
                severity: 'High',
                suggestedResolution: `Re-include Control ${code} in SoA and assign remediation tasks.`
              });
            }

            // Check conflict: status desync
            if (
              risk.status === 'Residual Monitored' &&
              ctrl.implementationStatus === 'Not Started'
            ) {
              conflicts.push({
                type: 'STATUS_DESYNC',
                description: `Risk ${risk.riskCode} is marked as Residual Monitored, but mitigating control ${code} is still "Not Started" in SoA.`,
                riskCode: risk.riskCode,
                controlCode: code,
                severity: 'Medium',
                suggestedResolution: `Update control ${code} implementation status to 'In Progress' or 'Implemented'.`
              });
            }
          }
        });
      }
    }
  });

  // Evaluate Controls for Justifications
  const unjustifiedControls: RiskSoASyncReport['unjustifiedControls'] = [];
  controls.forEach(ctrl => {
    if (ctrl.applicable) {
      const hasRiskLink = linkedControlCodes.has(ctrl.controlCode);
      const hasDetailedJustification =
        ctrl.justification &&
        ctrl.justification.trim().length > 15 &&
        !ctrl.justification.toLowerCase().includes('default baseline');

      if (!hasRiskLink && !hasDetailedJustification) {
        unjustifiedControls.push({
          controlId: ctrl.id,
          controlCode: ctrl.controlCode,
          title: ctrl.title
        });
      }
    }
  });

  // Calculate overall sync health score
  const totalChecks = Math.max(1, risks.length + controls.length);
  const deductions =
    unmappedMitigateRisks.length * 8 +
    conflicts.filter(c => c.severity === 'High').length * 15 +
    conflicts.filter(c => c.severity === 'Medium').length * 6 +
    unjustifiedControls.length * 2;

  const syncHealthScore = Math.max(0, Math.min(100, Math.round(100 - (deductions / totalChecks) * 100)));

  return {
    syncHealthScore,
    alignmentPercentage: syncHealthScore,
    totalControlsChecked: controls.length,
    totalRisksChecked: risks.length,
    syncedControlsCount: linkedControlCodes.size,
    mappedControlsCount: linkedControlCodes.size,
    unmappedMitigateRisks,
    unjustifiedControls,
    conflicts,
    lastSyncTimestamp: new Date().toISOString()
  };
}

/**
 * Performs dynamic bi-directional sync between Risk Register and SoA
 */
export function performDynamicSoARiskSync(
  currentRisks: RiskRecord[],
  currentControls: ControlItem[]
): {
  updatedRisks: RiskRecord[];
  updatedControls: ControlItem[];
  changesCount: number;
  changeLog: string[];
} {
  const changeLog: string[] = [];
  let changesCount = 0;

  // Clone arrays
  const updatedControls = currentControls.map(c => ({ ...c }));
  const updatedRisks = currentRisks.map(r => ({
    ...r,
    frameworkMappings: r.frameworkMappings
      ? { ...r.frameworkMappings, iso27001Controls: [...(r.frameworkMappings.iso27001Controls || [])] }
      : { iso27001Controls: [], iso42001Controls: [], masTrmSections: [] }
  }));

  const controlMap = new Map<string, ControlItem>();
  updatedControls.forEach(c => controlMap.set(c.controlCode, c));

  // 1. Sync from Risks -> Controls
  updatedRisks.forEach(risk => {
    if (risk.treatmentOption === 'Mitigate') {
      const mappedCodes = extractControlCodesFromRisk(risk);

      mappedCodes.forEach(code => {
        const ctrl = controlMap.get(code);
        if (ctrl) {
          let controlChanged = false;

          // If control was not applicable, mark it applicable
          if (!ctrl.applicable) {
            ctrl.applicable = true;
            changeLog.push(`Marked control ${code} as APPLICABLE based on mitigating risk ${risk.riskCode}.`);
            controlChanged = true;
          }

          // Ensure justification includes risk reference
          const riskTag = `[ISO 27001 Cl. 6.1.3: Risk ${risk.riskCode}]`;
          if (!ctrl.justification.includes(riskTag)) {
            ctrl.justification = ctrl.justification
              ? `${ctrl.justification.trim()} ${riskTag} Mitigates threat: "${risk.title}".`
              : `${riskTag} Required to mitigate ${risk.riskCode}: "${risk.title}".`;
            changeLog.push(`Enriched justification for ${code} with Risk ${risk.riskCode} reference.`);
            controlChanged = true;
          }

          if (controlChanged) {
            changesCount++;
          }
        }
      });
    }
  });

  // 2. Sync from Controls -> Risks (recalculate effectiveness and residual scores)
  updatedRisks.forEach(risk => {
    const mappedCodes = extractControlCodesFromRisk(risk);
    if (mappedCodes.length > 0) {
      let totalCtrlEffectiveness = 0;
      let implementedCount = 0;

      mappedCodes.forEach(code => {
        const ctrl = controlMap.get(code);
        if (ctrl) {
          if (ctrl.implementationStatus === 'Implemented' || ctrl.implementationStatus === 'Audited') {
            totalCtrlEffectiveness += 92;
            implementedCount++;
          } else if (ctrl.implementationStatus === 'Monitored') {
            totalCtrlEffectiveness += 85;
            implementedCount++;
          } else if (ctrl.implementationStatus === 'In Progress') {
            totalCtrlEffectiveness += 55;
          } else {
            totalCtrlEffectiveness += 20;
          }
        }
      });

      const avgEffectiveness = Math.round(totalCtrlEffectiveness / mappedCodes.length);
      if (risk.controlEffectiveness !== avgEffectiveness) {
        risk.controlEffectiveness = avgEffectiveness;
        changesCount++;
        changeLog.push(`Updated control effectiveness for ${risk.riskCode} to ${avgEffectiveness}% based on SoA.`);
      }

      // If all controls are implemented and risk was in Treatment, advance risk status
      if (implementedCount === mappedCodes.length && risk.status === 'Treatment in Progress') {
        risk.status = 'Residual Monitored';
        changeLog.push(`Advanced Risk ${risk.riskCode} status to "Residual Monitored" (all ${mappedCodes.length} controls implemented).`);
        changesCount++;
      }
    }
  });

  return {
    updatedRisks,
    updatedControls,
    changesCount,
    changeLog
  };
}
