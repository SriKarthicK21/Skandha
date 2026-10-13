/**
 * SKANDA Enterprise GRC — Telemetry, Connectors & Continuous Compliance Store
 * Path: src/stores/useTelemetryStore.ts
 */

import { useSyncExternalStore } from 'react';
import {
  GrcConnector,
  TelemetryObservation,
  VendorSecurityObservation,
  ContinuousComplianceSummary
} from '../types/telemetryTypes';
import { TelemetryService } from '../services/telemetry/TelemetryService';

export interface TelemetryState {
  connectors: GrcConnector[];
  observations: TelemetryObservation[];
  vendorObservations: VendorSecurityObservation[];
  complianceSummary: ContinuousComplianceSummary | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  fetchIntegrations: (tenantId?: string) => Promise<void>;
  fetchObservations: (tenantId?: string, filters?: any) => Promise<void>;
  fetchVendorObservations: (tenantId?: string) => Promise<void>;
  fetchComplianceSummary: (tenantId?: string) => Promise<void>;
  testConnection: (connectorId: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  syncConnector: (connectorId: string, tenantId?: string) => Promise<void>;
  executeVendorScan: (tenantId: string, vendorId: string, domain: string, authorizedBy: string) => Promise<void>;
}

let state: TelemetryState = {
  connectors: [],
  observations: [],
  vendorObservations: [],
  complianceSummary: null,
  isLoading: false,
  isSyncing: false,
  error: null,

  fetchIntegrations: async (tenantId = 'tenant-acme') => {
    setState({ isLoading: true, error: null });
    try {
      const connectors = await TelemetryService.getIntegrations(tenantId);
      setState({ connectors, isLoading: false });
    } catch (err: any) {
      setState({ error: err.message, isLoading: false });
    }
  },

  fetchObservations: async (tenantId = 'tenant-acme', filters) => {
    try {
      const observations = await TelemetryService.getObservations(tenantId, filters);
      setState({ observations });
    } catch (err: any) {
      setState({ error: err.message });
    }
  },

  fetchVendorObservations: async (tenantId = 'tenant-acme') => {
    try {
      const vendorObservations = await TelemetryService.getVendorObservations(tenantId);
      setState({ vendorObservations });
    } catch (err: any) {
      setState({ error: err.message });
    }
  },

  fetchComplianceSummary: async (tenantId = 'tenant-acme') => {
    try {
      const complianceSummary = await TelemetryService.getContinuousComplianceSummary(tenantId);
      setState({ complianceSummary });
    } catch (err: any) {
      setState({ error: err.message });
    }
  },

  testConnection: async (connectorId: string) => {
    return await TelemetryService.testConnection(connectorId);
  },

  syncConnector: async (connectorId: string, tenantId = 'tenant-acme') => {
    setState({ isSyncing: true });
    try {
      await TelemetryService.syncConnector(connectorId, tenantId);
      await state.fetchIntegrations(tenantId);
      await state.fetchObservations(tenantId);
      await state.fetchComplianceSummary(tenantId);
      setState({ isSyncing: false });
    } catch (err: any) {
      setState({ error: err.message, isSyncing: false });
    }
  },

  executeVendorScan: async (tenantId: string, vendorId: string, domain: string, authorizedBy: string) => {
    setState({ isLoading: true });
    try {
      await TelemetryService.executeVendorScan(tenantId, vendorId, domain, authorizedBy);
      await state.fetchVendorObservations(tenantId);
      setState({ isLoading: false });
    } catch (err: any) {
      setState({ error: err.message, isLoading: false });
    }
  }
};

const listeners = new Set<() => void>();

function setState(partial: Partial<TelemetryState> | ((prev: TelemetryState) => Partial<TelemetryState>)) {
  const next = typeof partial === 'function' ? partial(state) : partial;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function useTelemetryStore(): TelemetryState {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => state,
    () => state
  );
}
