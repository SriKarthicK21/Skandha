export type PopulationRiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface PopulationRiskFactor {
  id: string;
  name: string;
  description: string;
  score: number; // 1 - 10
  weight: number; // 0 - 1 (summing to 1)
  justification: string;
}

export interface PopulationRiskAssessment {
  overallRiskScore: number; // 0 - 100
  riskTier: PopulationRiskTier;
  evaluatedAt: string;
  evaluator: string;
  factors: PopulationRiskFactor[];
  highRiskStratumDescription: string;
  recommendedConfidence: 90 | 95 | 99;
  recommendedMarginOfError: number; // e.g. 3, 5, 10
  recommendedMethod: 'Attribute Sampling' | 'Simple Random' | 'Stratified Risk-Based';
  rationaleSummary: string;
}

export interface SamplingRationaleData {
  documentId: string;
  workingPaperRef: string;
  tenantName: string;
  leadAuditor: {
    name: string;
    role: string;
    certifications: string[];
    email: string;
  };
  auditStandard: string;
  targetControl: {
    code: string;
    name: string;
    description: string;
    framework: string;
  };
  population: {
    artifactType: string;
    populationSize: number;
    description: string;
    periodCovered: string;
    homogeneityAssessment: string;
  };
  riskAssessment: PopulationRiskAssessment;
  statisticalParameters: {
    confidenceLevel: number;
    zScore: number;
    marginOfError: number;
    expectedErrorRate: number;
    samplingMethod: 'Attribute Sampling' | 'Simple Random' | 'Stratified Risk-Based';
    finitePopulationCorrection: boolean;
    calculatedSampleSize: number;
    sampleFractionPercentage: number;
    formulaNotation: string;
  };
  samplingRiskAnalysis: {
    alphaRiskDescription: string;
    betaRiskDescription: string;
    acceptableBetaRiskLevel: string;
  };
  stratificationAllocation: Array<{
    stratum: 'High' | 'Medium' | 'Low';
    populationCount: number;
    sampleCount: number;
    samplingRatioPct: number;
    allocationBasis: string;
  }>;
  fieldworkResults: {
    totalTested: number;
    passedCount: number;
    failedCount: number;
    pendingCount: number;
    sampleErrorRatePct: number;
    tolerableErrorRatePct: number;
    upperErrorLimitEstimatePct: number;
    auditVerdict: 'CONFORMANT' | 'NON_CONFORMANT' | 'QUALIFIED_CONFORMANCE' | 'PENDING_FIELDWORK';
    auditorObservation: string;
  };
  samples: Array<{
    id: string;
    itemRef: string;
    category: string;
    department: string;
    riskTier: 'High' | 'Medium' | 'Low';
    status: 'Pass' | 'Fail' | 'Pending';
    notes: string;
  }>;
  sha256IntegritySeal: string;
  generatedDate: string;
}
