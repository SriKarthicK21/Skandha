import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import { PageContainer } from '../layout/PageContainer';
import { ScopePageHeader } from './ScopePageHeader';
import { ScopeKPIRibbon } from './ScopeKPIRibbon';
import { ScopeStatementCard } from './ScopeStatementCard';
import { DepartmentCard } from './DepartmentCard';
import { ScopeExclusionsRegister } from './ScopeExclusionsRegister';
import { InterestedPartiesSection } from './InterestedPartiesSection';
import { EditScopeModal } from './EditScopeModal';
import { DepartmentScopeModal } from '../departments/DepartmentScopeModal';
import { CreateDepartmentScopeModal } from '../departments/CreateDepartmentScopeModal';
import { DepartmentScopeDossierModal } from '../departments/DepartmentScopeDossierModal';
import { LeadAuditorDossierModal } from '../documents/LeadAuditorDossierModal';
import { DepartmentScopeProfile } from '../../types';
import {
  Search,
  Filter,
  Layers,
  Building,
  CheckCircle2,
  XCircle,
  SlidersHorizontal
} from 'lucide-react';

export const OrganizationScopeModule: React.FC = () => {
  const {
    currentTenant,
    masterDepartments,
    departmentScopes,
    updateDepartmentScope,
    toggleDepartmentInScope,
    addCustomDepartmentScope,
    autoMapDepartmentPolicies,
    savePhase2Scope,
    setActiveModule,
    logAuditEvent
  } = useGRC();

  // Modal states
  const [isEditScopeOpen, setIsEditScopeOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isLeadAuditorScopeOpen, setIsLeadAuditorScopeOpen] = useState(false);
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [selectedDeptForModal, setSelectedDeptForModal] = useState<DepartmentScopeProfile | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'in_scope' | 'excluded'>('all');

  // Extract Categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    departmentScopes.forEach(d => {
      if (d.category) cats.add(d.category);
    });
    return ['All', ...Array.from(cats)];
  }, [departmentScopes]);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departmentScopes.filter(d => {
      // 1. Category Filter
      if (selectedCategory !== 'All' && d.category !== selectedCategory) {
        return false;
      }
      // 2. Scope Filter
      if (scopeFilter === 'in_scope' && !d.isInScope) return false;
      if (scopeFilter === 'excluded' && d.isInScope) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(query);
        const matchesOwner = (d.leadOwner || '').toLowerCase().includes(query);
        const matchesBoundary = (d.scopeBoundary || '').toLowerCase().includes(query);
        const matchesProcess = (d.coreProcesses || []).some(p => p.toLowerCase().includes(query));
        return matchesName || matchesOwner || matchesBoundary || matchesProcess;
      }
      return true;
    });
  }, [departmentScopes, selectedCategory, scopeFilter, searchQuery]);

  // Scope Statement
  const scopeStatement =
    currentTenant?.businessScope?.statement ||
    'The Information Security Management System covers the design, development, cloud operations, customer onboarding, and ongoing maintenance of the SaaS Open-Banking API platform, hosted in AWS (multi-region VPCs) and operated from Headquarters and secure remote endpoints.';

  // Exclusions list
  const exclusions = currentTenant?.businessScope?.exclusions || [
    {
      id: 'ex_1',
      controlOrProcess: 'A.7.11 Supporting utilities (On-premise generator maintenance)',
      justification:
        'Apex operates 100% serverless and cloud-native architecture on AWS. No physical data center or standalone electrical power infrastructure is maintained directly by the organization.'
    }
  ];

  // Interested Parties list
  const interestedParties = currentTenant?.businessScope?.interestedParties || [
    {
      id: 'ip_1',
      party: 'Financial Regulatory Authority',
      requirements: 'Operational resilience, incident notification within statutory timelines, and consumer protection.',
      legalObligation: 'Statutory Financial Regulations & Cybersecurity Notices'
    },
    {
      id: 'ip_2',
      party: 'Enterprise Banking Clients',
      requirements: 'ISO/IEC 27001:2022 Certification, SOC 2 Type II attestation, 99.95% API Availability, 24h breach notice.',
      legalObligation: 'Master Service Agreements (MSA) & Data Protection Agreements'
    },
    {
      id: 'ip_3',
      party: 'Data Protection Commissioners',
      requirements: 'Data protection officer appointment, Article 30 records, Privacy by Design, and 72h data breach reporting.',
      legalObligation: 'General Data Protection Regulation (GDPR) & DPDP Act 2023'
    }
  ];

  // Save updated statement
  const handleSaveStatement = (newStatement: string) => {
    if (!currentTenant) return;
    savePhase2Scope({
      statement: newStatement,
      exclusions: currentTenant.businessScope?.exclusions || [],
      interestedParties: currentTenant.businessScope?.interestedParties || [],
      inScopeDepartmentIds: currentTenant.inScopeDepartmentIds || [],
      customDepartments: currentTenant.customDepartments || [],
      controls: currentTenant.controls || []
    });
    logAuditEvent('UPDATE', 'ISMS Scope Statement', `Updated formal ISMS Scope Statement under Clause 4.3`);
  };

  // Add Exclusion
  const handleAddExclusion = (newEx: { controlOrProcess: string; justification: string }) => {
    if (!currentTenant) return;
    const updatedExclusions = [
      ...exclusions,
      {
        id: `ex_${Date.now()}`,
        controlOrProcess: newEx.controlOrProcess,
        justification: newEx.justification
      }
    ];

    savePhase2Scope({
      statement: scopeStatement,
      exclusions: updatedExclusions,
      interestedParties: currentTenant.businessScope?.interestedParties || [],
      inScopeDepartmentIds: currentTenant.inScopeDepartmentIds || [],
      customDepartments: currentTenant.customDepartments || [],
      controls: currentTenant.controls || []
    });
    logAuditEvent('CREATE', 'Scope Exclusion', `Added formal exclusion: ${newEx.controlOrProcess}`);
  };

  // Remove Exclusion
  const handleRemoveExclusion = (exId: string) => {
    if (!currentTenant) return;
    const updatedExclusions = exclusions.filter(e => e.id !== exId);
    savePhase2Scope({
      statement: scopeStatement,
      exclusions: updatedExclusions,
      interestedParties: currentTenant.businessScope?.interestedParties || [],
      inScopeDepartmentIds: currentTenant.inScopeDepartmentIds || [],
      customDepartments: currentTenant.customDepartments || [],
      controls: currentTenant.controls || []
    });
    logAuditEvent('DELETE', 'Scope Exclusion', `Removed exclusion with ID: ${exId}`);
  };

  return (
    <PageContainer id="org-scope-module" maxWidth="7xl">
      {/* 1. Page Header (ISO 27001 Clause 4.3) */}
      <ScopePageHeader
        tenant={currentTenant}
        onEditScope={() => setIsEditScopeOpen(true)}
        onOpenDossier={() => setIsDossierOpen(true)}
        onOpenLeadAuditorScope={() => setIsLeadAuditorScopeOpen(true)}
        onNavigateClause42={() => setActiveModule('stakeholder_obligations')}
        onAddDepartment={() => setIsCreateDeptOpen(true)}
      />

      {/* 2. KPI Metrics Ribbon */}
      <ScopeKPIRibbon
        departmentScopes={departmentScopes}
        exclusionCount={exclusions.length}
      />

      {/* 3. Documented Scope Statement Card (Clause 4.3 Mandates) */}
      <ScopeStatementCard
        statement={scopeStatement}
        onEdit={() => setIsEditScopeOpen(true)}
      />

      {/* 4. Organizational Units & Scope Grid */}
      <section aria-labelledby="department-grid-heading" className="space-y-4">
        {/* Section Header & Filters */}
        <div className="p-6 rounded-2xl bg-skanda-secondary border border-skanda shadow-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-sky-400">
                  ISO 27001 Clause 4.3 & Annex A.5.1
                </span>
              </div>
              <h2 id="department-grid-heading" className="text-[18px] font-bold text-white tracking-tight mt-0.5">
                Organizational Units & Boundary Scoping
              </h2>
              <p className="text-[12px] text-slate-300">
                Manage in-scope departmental boundaries, responsible leads, critical systems, and applicable policies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <span className="text-slate-400">
                Showing <strong className="text-white">{filteredDepartments.length}</strong> of{' '}
                <strong className="text-white">{departmentScopes.length}</strong> units
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="pt-2 border-t border-skanda flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by department, lead owner, process, or boundary..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-skanda-primary border border-skanda text-[14px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Scope Status Filter */}
              <div className="flex items-center space-x-1 bg-skanda-primary p-1 rounded-xl border border-skanda">
                <button
                  type="button"
                  onClick={() => setScopeFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition ${
                    scopeFilter === 'all'
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('in_scope')}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition ${
                    scopeFilter === 'in_scope'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  In-Scope
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('excluded')}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition ${
                    scopeFilter === 'excluded'
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Excluded
                </button>
              </div>

              {/* Category Dropdown/Pills */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-skanda-primary border border-skanda text-[12px] text-slate-200 focus:outline-none focus:border-sky-500 transition"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Department Cards Grid: 3 cols desktop (1440px+), 2 cols tablet (1024px-1280px), 1 col mobile */}
        {filteredDepartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDepartments.map(dept => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                onToggleInScope={toggleDepartmentInScope}
                onConfigure={d => setSelectedDeptForModal(d)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-skanda-secondary border border-skanda space-y-3">
            <SlidersHorizontal className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-[15px] font-semibold text-white">No departments match your filter</div>
            <p className="text-[12px] text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the status and category filters to view organizational units.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setScopeFilter('all');
              }}
              className="px-4 py-1.5 rounded-xl bg-skanda-card hover:bg-skanda-elevated text-[12px] font-semibold text-sky-400 border border-skanda transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 5. Scope Exclusions Register */}
      <ScopeExclusionsRegister
        exclusions={exclusions}
        departmentScopes={departmentScopes}
        onAddExclusion={handleAddExclusion}
        onRemoveExclusion={handleRemoveExclusion}
      />

      {/* 6. Interested Parties & Regulatory Obligations (Clause 4.2 Integration) */}
      <InterestedPartiesSection
        parties={interestedParties}
        onOpenFullMatrix={() => setActiveModule('stakeholder_obligations')}
      />

      {/* --- MODALS --- */}
      {/* Edit Scope Modal */}
      <EditScopeModal
        isOpen={isEditScopeOpen}
        onClose={() => setIsEditScopeOpen(false)}
        currentStatement={scopeStatement}
        onSave={handleSaveStatement}
        companyName={organizationService.getOrganizationName(currentTenant)}
      />

      {/* Scope Dossier Modal */}
      <DepartmentScopeDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        tenant={currentTenant}
        departmentScopes={departmentScopes}
      />

      {/* TÜV / BSI Lead Auditor Formal Scope & ISMS Dossier Modal */}
      {isLeadAuditorScopeOpen && (
        <LeadAuditorDossierModal
          isOpen={isLeadAuditorScopeOpen}
          onClose={() => setIsLeadAuditorScopeOpen(false)}
          tenant={currentTenant}
          controls={currentTenant?.controls || []}
          initialTab="scope"
        />
      )}

      {/* Add Custom Department Modal */}
      <CreateDepartmentScopeModal
        isOpen={isCreateDeptOpen}
        onClose={() => setIsCreateDeptOpen(false)}
        onSave={data => {
          addCustomDepartmentScope(data);
          setIsCreateDeptOpen(false);
        }}
      />

      {/* Configure Department Scope & Policies Modal */}
      {selectedDeptForModal && (
        <DepartmentScopeModal
          department={selectedDeptForModal}
          isOpen={!!selectedDeptForModal}
          onClose={() => setSelectedDeptForModal(null)}
          onSave={(deptId, updates) => {
            updateDepartmentScope(deptId, updates);
            // Refresh modal reference if still open
            setSelectedDeptForModal(prev => (prev && prev.id === deptId ? { ...prev, ...updates } : prev));
          }}
          onAutoMapPolicies={deptId => autoMapDepartmentPolicies(deptId)}
        />
      )}
    </PageContainer>
  );
};
