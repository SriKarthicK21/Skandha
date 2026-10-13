/**
 * SKANDA LIVE GITHUB CONNECTOR — LIVE PROVIDER VERIFICATION
 * Path: scripts/verifyLiveGitHubConnector.ts
 *
 * Run: npx tsx scripts/verifyLiveGitHubConnector.ts [owner/repo]
 *
 * Performs REAL HTTPS calls against api.github.com and reports exactly what the
 * provider returned. It never fabricates facts:
 *
 *   * Without a token (SKANDA_GITHUB_MONITORING_TOKEN) the connector performs
 *     anonymous reads only, and facts that anonymous access cannot observe are
 *     reported as UNKNOWN with the reason.
 *   * With a token the same script verifies authenticated collection and branch
 *     protection state.
 *
 * This is a live provider verification, not a unit test.
 */

import { GitHubMonitoringConnector } from '../server/connectors/GitHubMonitoringConnector';
import { normalizeInboundSignal, IntegrationBinding } from '../server/services/liveMonitoring/signalNormalization';
import { evaluateRuleAgainstSignal, getRulesForSignalType } from '../server/services/liveMonitoring/controlEvaluationRules';

async function main(): Promise<void> {
  const repoArg = process.argv[2] || 'octocat/Hello-World';
  const [owner] = repoArg.split('/');
  const tokenEnvVar = 'SKANDA_GITHUB_MONITORING_TOKEN';

  const connector = new GitHubMonitoringConnector({ owner, repositories: [repoArg], tokenEnvVar });

  console.log('SKANDA LIVE GITHUB CONNECTOR — LIVE VERIFICATION');
  console.log(`Target: ${repoArg} (owner ${owner})`);
  console.log(`Credential: ${connector.isAuthenticated() ? `present via ${tokenEnvVar}` : `NOT configured (${tokenEnvVar} is unset) — anonymous read only`}`);

  const health = await connector.healthCheck();
  console.log('\n--- Connection health (separate from compliance state) ---');
  console.log(JSON.stringify(health, null, 2));
  if (health.status === 'FAILING' || health.status === 'NOT_CONFIGURED') {
    console.error('\nLive verification could not reach GitHub from this environment.');
    process.exit(1);
  }

  const collection = await connector.collect();
  console.log('\n--- Collection ---');
  console.log(`Authenticated: ${collection.authenticated}`);
  console.log(`Requests: ${JSON.stringify(collection.requests)}`);
  console.log(`Latency: ${collection.latencyMs}ms`);
  console.log(`Signals produced: ${collection.signals.length}`);
  for (const signal of collection.signals) {
    const payload = signal.payload as any;
    console.log(`  - ${signal.providerEventType} @ ${signal.resourceRef}: observed=${JSON.stringify(payload.observedState)}`);
  }
  if (collection.unavailableFacts.length > 0) {
    console.log('Facts the credential could not read (recorded as UNKNOWN, never as compliant):');
    for (const fact of collection.unavailableFacts) console.log(`  - ${fact.fact}: ${fact.reason}`);
  }

  // Run the produced observations through the canonical normalizer and the
  // deterministic evaluator, exactly as the pipeline does.
  const binding: IntegrationBinding = {
    tenantId: 'tenant-live-verification',
    integrationId: 'INT-live-verification',
    connectorId: connector.connectorId,
    provider: 'GITHUB',
    resourceScope: [repoArg],
    signatureVerification: 'NOT_APPLICABLE',
    receivedFromUntrustedChannel: false
  };

  console.log('\n--- Evaluation of live observations ---');
  for (const signal of collection.signals) {
    const normalized = normalizeInboundSignal(signal, binding);
    if (!normalized.accepted || !normalized.signal) {
      console.log(`  - ${signal.providerEventType}: REJECTED (${normalized.rejectionReason})`);
      continue;
    }
    const rules = getRulesForSignalType(normalized.signal.signalType);
    if (rules.length === 0) {
      console.log(`  - ${signal.providerEventType}: retained as ${normalized.signal.signalType} with no bound rule`);
      continue;
    }
    for (const rule of rules) {
      const evaluation = evaluateRuleAgainstSignal(rule, normalized.signal);
      console.log(`  - ${rule.controlCode} (${rule.id}): ${evaluation.result} — ${evaluation.actualCondition}`);
    }
  }

  console.log('\nReminder: this verifies the transport, normalization and evaluation against the live provider.');
  console.log('It does not prove that a customer tenant has completed an authenticated onboarding.');
}

main().catch(err => {
  console.error('Live verification failed:', err);
  process.exit(1);
});
