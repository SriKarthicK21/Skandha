// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 48 CATALOGUE INVENTORY EXTRACTOR
// ============================================================================
import fs from 'fs';
import path from 'path';
import { ENTERPRISE_CATALOGUE_REGISTRY } from '../server/services/DocumentationCatalogueData.js';

console.log('Total templates:', ENTERPRISE_CATALOGUE_REGISTRY.length);

const inventory = ENTERPRISE_CATALOGUE_REGISTRY.map((t, idx) => ({
  index: idx + 1,
  id: t.id,
  title: t.title,
  documentType: t.documentType,
  hierarchyLevel: t.hierarchyLevel,
  domain: t.domain,
  contentDepth: t.contentDepth,
  requiredInputs: t.requiredOrganizationalInputs,
  frameworks: t.relatedFrameworks.map(f => `${f.frameworkCode}:${f.clauseOrControl} [${f.provenance}]`),
  evidence: t.relatedControlsAndEvidenceTypes.map(e => `${e.controlCode} -> ${e.evidenceType}`),
  qualityRules: t.qualityRules,
  defaultOwner: t.ownerAndReviewerRoles.defaultOwnerRole,
  approver: t.ownerAndReviewerRoles.approverRole
}));

fs.writeFileSync(
  path.join(process.cwd(), 'scratch_catalogue_inventory.json'),
  JSON.stringify(inventory, null, 2)
);
console.log('Saved inventory to scratch_catalogue_inventory.json');
