// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 21 MANAGED POSTGRESQL PRODUCTION ENFORCEMENT VALIDATOR
// Path: scripts/validatePhase21PostgresProductionEnforcement.ts
//
// Validates P0 Production Blocker Enforcement:
// NODE_ENV=production -> PostgreSQL REQUIRED -> NO IN-MEMORY FALLBACK -> FAILS FAST
//
// 9 Production Scenarios Verified:
// 1. PostgreSQL Available -> Healthy
// 2. PostgreSQL Unavailable -> Production Fails Fast with EnterpriseDatabaseUnavailableFatalError
// 3. Invalid Credentials -> Production Fails Fast
// 4. Invalid Host -> Production Fails Fast
// 5. Connection Timeout -> Production Fails Fast
// 6. Connection Pool Exhaustion -> Production Fails Fast
// 7. Database Restart -> Reconnect recovery verified
// 8. Transient DB Failure -> Production Fails Fast, Development degrades gracefully
// 9. Migration Mismatch -> Fails Fast with EnterpriseMigrationMismatchError
// ============================================================================

import {
  postgresConnectionManager,
  EnterpriseDatabaseUnavailableFatalError,
  EnterpriseMigrationMismatchError
} from '../server/services/PostgresConnectionManager.js';

interface TestAssertion {
  scenarioNumber: number;
  scenarioName: string;
  passed: boolean;
  expectedBehavior: string;
  observedBehavior: string;
}

export function runPhase21PostgresEnforcementSuite(): {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  status: 'PASS' | 'FAIL';
  assertions: TestAssertion[];
} {
  const assertions: TestAssertion[] = [];
  console.log('\n============================================================');
  console.log('SKANDA PHASE 21: MANAGED POSTGRESQL PRODUCTION ENFORCEMENT');
  console.log('============================================================\n');

  // Test 1: PostgreSQL Available
  try {
    postgresConnectionManager.resetSimulations();
    const result = postgresConnectionManager.evaluateConnectivity('production');
    const passed = result.status === 'HEALTHY' && result.persistenceMode === 'MANAGED_POSTGRESQL';
    assertions.push({
      scenarioNumber: 1,
      scenarioName: 'PostgreSQL Available in Production',
      passed,
      expectedBehavior: 'Status HEALTHY, persistence MANAGED_POSTGRESQL',
      observedBehavior: `Status ${result.status}, persistence ${result.persistenceMode}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 1,
      scenarioName: 'PostgreSQL Available in Production',
      passed: false,
      expectedBehavior: 'Status HEALTHY',
      observedBehavior: `Threw error: ${err.message}`
    });
  }

  // Test 2: PostgreSQL Unavailable in Production (MUST FAIL FAST, NO IN-MEMORY FALLBACK)
  try {
    postgresConnectionManager.resetSimulations();
    postgresConnectionManager.setSimulatedDown(true);
    let threwFatal = false;
    let errorType = '';
    try {
      postgresConnectionManager.evaluateConnectivity('production');
    } catch (e: any) {
      if (e instanceof EnterpriseDatabaseUnavailableFatalError) {
        threwFatal = true;
        errorType = e.name;
      }
    }
    // Also verify development falls back gracefully
    const devResult = postgresConnectionManager.evaluateConnectivity('development');
    const devFallbackAllowed = devResult.status === 'DEGRADED' && devResult.persistenceMode === 'IN_MEMORY_FALLBACK';

    const passed = threwFatal && devFallbackAllowed;
    assertions.push({
      scenarioNumber: 2,
      scenarioName: 'PostgreSQL Unavailable in Production (Fail-Fast Enforcement)',
      passed,
      expectedBehavior: 'Production throws EnterpriseDatabaseUnavailableFatalError; Dev allows fallback',
      observedBehavior: `Production threw ${errorType} (threwFatal=${threwFatal}), Dev status=${devResult.status}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 2,
      scenarioName: 'PostgreSQL Unavailable in Production',
      passed: false,
      expectedBehavior: 'Fail-fast execution',
      observedBehavior: `Unexpected failure: ${err.message}`
    });
  }

  // Test 3: Invalid Credentials
  try {
    postgresConnectionManager.resetSimulations();
    postgresConnectionManager.setSimulatedInvalidCredentials(true);
    let threwFatal = false;
    try {
      postgresConnectionManager.evaluateConnectivity('production');
    } catch (e: any) {
      if (e instanceof EnterpriseDatabaseUnavailableFatalError) threwFatal = true;
    }
    assertions.push({
      scenarioNumber: 3,
      scenarioName: 'Invalid Credentials Handling',
      passed: threwFatal,
      expectedBehavior: 'Production throws EnterpriseDatabaseUnavailableFatalError',
      observedBehavior: `threwFatal=${threwFatal}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 3,
      scenarioName: 'Invalid Credentials Handling',
      passed: false,
      expectedBehavior: 'EnterpriseDatabaseUnavailableFatalError',
      observedBehavior: err.message
    });
  }

  // Test 4: Invalid Host
  try {
    postgresConnectionManager.resetSimulations();
    postgresConnectionManager.setSimulatedInvalidHost(true);
    let threwFatal = false;
    try {
      postgresConnectionManager.evaluateConnectivity('production');
    } catch (e: any) {
      if (e instanceof EnterpriseDatabaseUnavailableFatalError) threwFatal = true;
    }
    assertions.push({
      scenarioNumber: 4,
      scenarioName: 'Invalid Host Resolution Handling',
      passed: threwFatal,
      expectedBehavior: 'Production throws EnterpriseDatabaseUnavailableFatalError',
      observedBehavior: `threwFatal=${threwFatal}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 4,
      scenarioName: 'Invalid Host Resolution Handling',
      passed: false,
      expectedBehavior: 'EnterpriseDatabaseUnavailableFatalError',
      observedBehavior: err.message
    });
  }

  // Test 5: Connection Timeout
  try {
    postgresConnectionManager.resetSimulations();
    postgresConnectionManager.setSimulatedTimeout(true);
    let threwFatal = false;
    try {
      postgresConnectionManager.evaluateConnectivity('production');
    } catch (e: any) {
      if (e instanceof EnterpriseDatabaseUnavailableFatalError) threwFatal = true;
    }
    assertions.push({
      scenarioNumber: 5,
      scenarioName: 'Connection Timeout Handling (5000ms threshold)',
      passed: threwFatal,
      expectedBehavior: 'Production throws EnterpriseDatabaseUnavailableFatalError',
      observedBehavior: `threwFatal=${threwFatal}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 5,
      scenarioName: 'Connection Timeout Handling',
      passed: false,
      expectedBehavior: 'EnterpriseDatabaseUnavailableFatalError',
      observedBehavior: err.message
    });
  }

  // Test 6: Connection Pool Exhaustion
  try {
    postgresConnectionManager.resetSimulations();
    postgresConnectionManager.setSimulatedExhaustion(true);
    let threwFatal = false;
    try {
      postgresConnectionManager.evaluateConnectivity('production');
    } catch (e: any) {
      if (e instanceof EnterpriseDatabaseUnavailableFatalError) threwFatal = true;
    }
    assertions.push({
      scenarioNumber: 6,
      scenarioName: 'Connection Pool Exhaustion Handling',
      passed: threwFatal,
      expectedBehavior: 'Production throws EnterpriseDatabaseUnavailableFatalError on pool exhaustion',
      observedBehavior: `threwFatal=${threwFatal}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 6,
      scenarioName: 'Connection Pool Exhaustion Handling',
      passed: false,
      expectedBehavior: 'EnterpriseDatabaseUnavailableFatalError',
      observedBehavior: err.message
    });
  }

  // Test 7: Database Restart & Reconnect Recovery
  try {
    postgresConnectionManager.resetSimulations();
    postgresConnectionManager.setSimulatedDown(true);
    // Down phase
    let caughtDown = false;
    try {
      postgresConnectionManager.evaluateConnectivity('production');
    } catch {
      caughtDown = true;
    }
    // Restart phase
    postgresConnectionManager.resetSimulations();
    const recoverResult = postgresConnectionManager.evaluateConnectivity('production');
    const recovered = caughtDown && recoverResult.status === 'HEALTHY';
    assertions.push({
      scenarioNumber: 7,
      scenarioName: 'Database Restart & Connection Pool Re-establishment',
      passed: recovered,
      expectedBehavior: 'Pool reconnects after database comes back online',
      observedBehavior: `caughtDown=${caughtDown}, postRestartStatus=${recoverResult.status}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 7,
      scenarioName: 'Database Restart',
      passed: false,
      expectedBehavior: 'Graceful reconnect',
      observedBehavior: err.message
    });
  }

  // Test 8: Transient DB Failure
  try {
    postgresConnectionManager.resetSimulations();
    postgresConnectionManager.setSimulatedDown(true);
    let prodThrew = false;
    try {
      postgresConnectionManager.evaluateConnectivity('production');
    } catch (e) {
      prodThrew = true;
    }
    const devFallback = postgresConnectionManager.evaluateConnectivity('development');
    const passed = prodThrew && devFallback.status === 'DEGRADED';
    assertions.push({
      scenarioNumber: 8,
      scenarioName: 'Transient DB Failure (Prod Never Falls Back Silently)',
      passed,
      expectedBehavior: 'Production aborts query; Sandbox maintains degraded read resilience',
      observedBehavior: `prodThrew=${prodThrew}, devStatus=${devFallback.status}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 8,
      scenarioName: 'Transient DB Failure',
      passed: false,
      expectedBehavior: 'Transient isolation',
      observedBehavior: err.message
    });
  }

  // Test 9: Migration Mismatch Detection
  try {
    postgresConnectionManager.resetSimulations();
    postgresConnectionManager.setSimulatedMigrationMismatch(true, '001_canonical_schema');
    let threwMismatch = false;
    try {
      postgresConnectionManager.evaluateConnectivity('production');
    } catch (e: any) {
      if (e instanceof EnterpriseMigrationMismatchError) threwMismatch = true;
    }
    assertions.push({
      scenarioNumber: 9,
      scenarioName: 'Database Migration Version Mismatch Detection',
      passed: threwMismatch,
      expectedBehavior: 'Production throws EnterpriseMigrationMismatchError if schema version != expected',
      observedBehavior: `threwMismatch=${threwMismatch}`
    });
  } catch (err: any) {
    assertions.push({
      scenarioNumber: 9,
      scenarioName: 'Migration Mismatch',
      passed: false,
      expectedBehavior: 'EnterpriseMigrationMismatchError',
      observedBehavior: err.message
    });
  } finally {
    postgresConnectionManager.resetSimulations();
  }

  const passedCount = assertions.filter(a => a.passed).length;
  const failedCount = assertions.length - passedCount;

  assertions.forEach(a => {
    const symbol = a.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] Scenario ${a.scenarioNumber}: ${a.scenarioName}`);
    console.log(`       Observed: ${a.observedBehavior}`);
  });

  console.log(`\nResults: ${passedCount}/${assertions.length} PASS`);
  return {
    totalTests: assertions.length,
    passedCount,
    failedCount,
    status: failedCount === 0 ? 'PASS' : 'FAIL',
    assertions
  };
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('validatePhase21PostgresProductionEnforcement')) {
  const result = runPhase21PostgresEnforcementSuite();
  if (result.status !== 'PASS') {
    process.exit(1);
  }
}
