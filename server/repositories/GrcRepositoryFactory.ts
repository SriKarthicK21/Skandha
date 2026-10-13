// ============================================================================
// SKANDA ENTERPRISE GRC: REPOSITORY FACTORY
// File: server/repositories/GrcRepositoryFactory.ts
//
// Factory pattern supplying the active GRC repository singleton
// Auto-detects runtime storage strategy (PostgreSQL vs JSON persistence)
// ============================================================================

import { IGrcDataStore } from './types.js';
import { JsonGrcRepository } from './JsonGrcRepository.js';
import { PostgresGrcRepository } from './PostgresGrcRepository.js';

export class GrcRepositoryFactory {
  private static instance: IGrcDataStore | null = null;

  public static getInstance(): IGrcDataStore {
    if (!GrcRepositoryFactory.instance) {
      if (process.env.DATABASE_URL) {
        console.log('[GrcRepositoryFactory] DATABASE_URL detected: Initializing PostgresGrcRepository');
        GrcRepositoryFactory.instance = new PostgresGrcRepository(process.env.DATABASE_URL);
      } else {
        console.log('[GrcRepositoryFactory] No DATABASE_URL: Initializing robust JsonGrcRepository');
        GrcRepositoryFactory.instance = new JsonGrcRepository();
      }
    }
    return GrcRepositoryFactory.instance;
  }

  public static setInstanceForTesting(store: IGrcDataStore): void {
    GrcRepositoryFactory.instance = store;
  }
}

export const getGrcDataStore = (): IGrcDataStore => GrcRepositoryFactory.getInstance();
