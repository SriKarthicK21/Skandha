import fs from 'fs';
import path from 'path';
import { ENTERPRISE_CATALOGUE_REGISTRY } from '../server/services/DocumentationCatalogueData.js';

let md = '| # | Template ID | Title | Doc Type | Hierarchy Level | Domain | Depth | Frameworks | Default Owner / Approver |\n';
md += '|---|---|---|---|---|---|---|---|---|\n';

ENTERPRISE_CATALOGUE_REGISTRY.forEach((t, i) => {
  const fw = t.relatedFrameworks.map(f => `${f.frameworkCode} (${f.clauseOrControl})`).join('; ');
  const ownerApprover = `${t.ownerAndReviewerRoles.defaultOwnerRole} / ${t.ownerAndReviewerRoles.approverRole}`;
  md += `| ${i + 1} | \`${t.id}\` | ${t.title} | ${t.documentType} | ${t.hierarchyLevel.replace('LEVEL_', 'L')} | ${t.domain} | ${t.contentDepth === 'SUBSTANTIVE_MODEL_AVAILABLE' ? 'Substantive Model' : 'Scaffold'} | ${fw} | ${ownerApprover} |\n`;
});

fs.writeFileSync(path.join(process.cwd(), 'catalogue_table.md'), md);
console.log('Catalogue table generated with', ENTERPRISE_CATALOGUE_REGISTRY.length, 'templates.');
