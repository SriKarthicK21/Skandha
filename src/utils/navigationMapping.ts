export type PrimaryBusinessArea =
  | 'home'
  | 'my_work'
  | 'governance'
  | 'compliance'
  | 'risk'
  | 'controls_evidence'
  | 'audit'
  | 'third_parties'
  | 'assets_data'
  | 'assets_third_parties'
  | 'service_management'
  | 'reports_insights'
  | 'skanda_intelligence'
  | 'admin';

export interface PrimaryNavItem {
  id: PrimaryBusinessArea;
  label: string;
  iconName: string;
  description: string;
  badge?: string | number;
  badgeColor?: string;
  subItems: Array<{
    id: string;
    label: string;
    tabId?: string;
  }>;
}

export function getPrimaryBusinessArea(moduleId: string): PrimaryBusinessArea {
  switch (moduleId) {
    // 1. COMMAND CENTRE / HOME
    case 'command_center':
    case 'dashboard':
    case 'dashboards':
    case 'executive_view':
    case 'home':
    case 'guided_journey':
    case 'next_best_action':
      return 'home';

    // 2. MY WORK
    case 'my_work':
    case 'tasks':
    case 'my_tasks':
    case 'priority_actions':
    case 'action_items':
    case 'remediation_queue':
    case 'capa_queue':
    case 'my_evidence':
    case 'my_policies':
    case 'operational_queue':
    case 'my_work_queue':
      return 'my_work';

    // 3. GOVERNANCE
    case 'governance':
    case 'org_scope':
    case 'scope':
    case 'departments':
    case 'processes':
    case 'organizational_discovery':
    case 'discovery_workshop':
    case 'process_blueprint':
    case 'documentation_studio':
    case 'interview_workspace':
    case 'business_discovery':
    case 'stakeholder_obligations':
    case 'clause4_2_obligations':
    case 'policies':
    case 'document_repository':
    case 'mas_policy_generator':
    case 'automated_policy_generator':
    case 'management_review':
      return 'governance';

    // 4. COMPLIANCE
    case 'compliance':
    case 'compliance_programs':
    case 'programs':
    case 'program_cockpit':
    case 'compliance_program_cockpit':
    case 'frameworks':
    case 'requirements':
    case 'gap_assessment':
    case 'crosswalk':
    case 'mapping_explorer':
    case 'cross_framework_crosswalk':
    case 'cross_regulatory_crosswalk':
    case 'regulatory_sources':
    case 'global_regulatory_news':
    case 'regulatory_change':
    // ISO 27001
    case 'iso27001':
    case 'iso27001_dashboard':
    case 'iso27001_workbench':
    case 'iso27001_clauses':
    case 'statement_of_applicability':
    case 'soa':
    case 'soa_matrix':
    case 'implementation_journey':
    case 'discovery_questionnaire':
    case 'department_surveys':
    case 'compliance_profile':
    case 'implementation_plan':
    case 'iso_mas_improvements':
    case 'continuous_compliance':
    // MAS TRM
    case 'mas_trm':
    case 'mas_compliance_flow':
    case 'mas_flow_dashboard':
    case 'mas_trm_journey':
    case 'mas_discovery_scoping':
    case 'mas_dashboard':
    case 'mas_overview':
    case 'mas_applicability':
    case 'mas_assessment_workbench':
    case 'mas_checklist':
    case 'mas_regulatory_intelligence':
    case 'mas_live_regulatory_intelligence':
    case 'mas_notice644_simulator':
    case 'mas_notice655_hygiene':
    case 'mas_incident_notification':
    case 'mas_compliance_workflow':
    case 'compliance_gap_visualization':
    case 'feat_genai_sentinel':
    case 'pqc_crypto_migration':
    case 'mas_reporting':
    case 'mas_supervisory_dossier':
    // ISO 42001
    case 'iso42001':
    case 'iso42001_dashboard':
    case 'iso42001_workbench':
    case 'iso42001_scoping':
    case 'iso42001_reporting':
    case 'iso42001_soa':
    // DPDP & ISO 27701
    case 'dpdp':
    case 'dpdp_compliance':
    case 'dpdp_act':
    case 'dpdp_checklist':
    case 'dpdp_data_flow':
    case 'dpdp_consent_grievance':
    case 'dpdp_breach_playbook':
    case 'iso27701_soa':
      return 'compliance';

    // 5. RISK
    case 'risk':
    case 'risk_assessment':
    case 'risk_register':
    case 'risk_map':
    case 'risk_treatment':
    case 'risk_treatment_simulator':
    case 'configurable_risk_matrix':
    case 'exceptions':
    case 'security_exceptions':
    case 'risk_waivers':
    case 'board_risk_appetite':
    case 'risk_appetite_dashboard':
      return 'risk';

    // 6. CONTROLS & EVIDENCE
    case 'controls_evidence':
    case 'control_library':
    case 'controls':
    case 'control_testing':
    case 'smart_evidence':
    case 'smart_evidence_hub':
    case 'evidence':
    case 'evidence_centre':
    case 'evidence_upload':
    case 'evidence_requirements':
    case 'evidence_checklist':
    case 'entity_lineage_graph':
    case 'control_lineage_graph':
      return 'controls_evidence';

    // 7. AUDIT & ASSURANCE
    case 'audit':
    case 'audit_assurance':
    case 'internal_audit':
    case 'external_audit':
    case 'auditor_clean_room':
    case 'auditor_portal':
    case 'auditor_inspection':
    case 'findings':
    case 'findings_capa':
    case 'non_conformity':
    case 'remediation':
    case 'remediation_desk':
    case 'remediation_capa':
    case 'stage_gates':
    case 'stage_gate_verifier':
    case 'sampling':
    case 'audit_sampling_calculator':
    case 'iso19011_sampling':
    case 'dept_checklists':
    case 'department_audit_checklists':
    case 'auditor_3lod':
    case 'auditor_3lod_portal':
    case 'reporting':
    case 'audit_reporting':
    case 'readiness_cert':
    case 'audit_readiness':
      return 'audit';

    // 8. THIRD PARTIES (TPRM)
    case 'third_parties':
    case 'vendors':
    case 'vendor_risk':
      return 'third_parties';

    // 9. ASSETS & DATA
    case 'assets_data':
    case 'assets':
    case 'mas_critical_systems':
    case 'cis_downtime_ledger':
    case 'data_information':
    case 'data_info':
    case 'data_privacy':
      return 'assets_data';

    case 'assets_third_parties':
    case 'third_party_assets':
      return 'assets_third_parties';

    // 10. SERVICE MANAGEMENT & CUSTOMER SUPPORT
    case 'service_management':
    case 'support':
    case 'support_centre':
    case 'customer_support':
    case 'my_cases':
    case 'team_queue':
    case 'incidents':
    case 'incident_command':
    case 'sla_monitor':
    case 'escalations':
    case 'knowledge_base':
    case 'service_catalog':
    case 'service_health':
    case 'problem_management':
    case 'ai_support_copilot':
      return 'service_management';

    // 11. REPORTS & INSIGHTS
    case 'reports_insights':
    case 'reports_intelligence':
    case 'ciso_summary':
    case 'ciso_executive_summary':
    case 'ciso_one_pager':
    case 'board_deck':
    case 'board_risk_committee_deck':
    case 'mas_brc_reporting_deck':
    case 'compliance_heatmap':
    case 'compliance_matrix':
    case 'compliance_maturity_scorecard':
    case 'maturity_scorecard':
    case 'reports_analytics':
    case 'analytics':
    case 'standards_academy':
    case 'standards_training':
    case 'telemetry_stream':
      return 'reports_insights';

    // 11. SKANDA INTELLIGENCE
    case 'skanda_intelligence':
    case 'threat_intelligence':
    case 'ai_copilot':
    case 'ai_insights':
    case 'ai_advisor':
    case 'brandguard':
    case 'brandguard_dashboard':
    case 'attack_surface':
    case 'easm':
    case 'easm_takeover':
    case 'threat_intel':
    case 'zero_hour_ioc':
    case 'dark_web':
    case 'credential_leaks':
    case 'logo_monitoring':
    case 'brand_abuse':
    case 'takedowns':
    case 'takedown_sla':
    case 'live_scanner':
    case 'security_scanner':
    case 'cyber_crisis_war_room':
    case 'cyber_war_room':
      return 'skanda_intelligence';

    // 12. ADMINISTRATION
    case 'admin':
    case 'settings':
    case 'settings_users':
    case 'data_sources':
    case 'workflows':
    case 'workflow_engine':
    case 'approvals_queue':
    case 'integrations':
    case 'live_integrations':
    case 'audit_trail':
    case 'super_admin':
    case 'super_admin_portfolio':
      return 'admin';

    default:
      return 'home';
  }
}
