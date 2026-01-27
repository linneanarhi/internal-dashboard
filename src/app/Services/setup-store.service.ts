import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SetupStatus = 'INCOMPLETE' | 'COMPLETE';

export type TechnicalSetup = {
  customerId: string;
  status: SetupStatus;
  apiKeys: { name: string; masked: string }[];
  dataSources: { name: string; status: 'DISCONNECTED' | 'CONNECTED' }[];
};

const STORAGE_KEY = 'setups:v1';

function isSetupStatus(x: any): x is SetupStatus {
  return x === 'INCOMPLETE' || x === 'COMPLETE';
}

function normalizeSetup(s: any): TechnicalSetup {
  return {
    customerId: String(s?.customerId ?? ''),
    status: isSetupStatus(s?.status) ? s.status : 'INCOMPLETE',
    apiKeys: Array.isArray(s?.apiKeys) ? s.apiKeys : [],
    dataSources: Array.isArray(s?.dataSources) ? s.dataSources : [],
  };
}

@Injectable({ providedIn: 'root' })
export class SetupStoreService {
  private readonly _setups = new BehaviorSubject<TechnicalSetup[]>(this.load());
  setups$ = this._setups.asObservable();

  get snapshot(): TechnicalSetup[] {
    return this._setups.value;
  }

  getByCustomer(customerId: string): TechnicalSetup | undefined {
    return this._setups.value.find((s) => s.customerId === customerId);
  }

  upsert(setup: TechnicalSetup): void {
    const exists = this._setups.value.some((s) => s.customerId === setup.customerId);

    const next: TechnicalSetup[] = exists
      ? this._setups.value.map((s) => (s.customerId === setup.customerId ? setup : s))
      : [setup, ...this._setups.value];

    this._setups.next(next);
    this.persist(next);
  }

  markComplete(customerId: string): void {
    const existing = this.getByCustomer(customerId);

    const next: TechnicalSetup[] = existing
      ? this._setups.value.map((s) =>
          s.customerId === customerId ? { ...s, status: 'COMPLETE' as SetupStatus } : s,
        )
      : [
          {
            customerId,
            status: 'COMPLETE' as SetupStatus,
            apiKeys: [],
            dataSources: [],
          },
          ...this._setups.value,
        ];

    this._setups.next(next);
    this.persist(next);
  }

  private persist(list: TechnicalSetup[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  private load(): TechnicalSetup[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeSetup);
    } catch {
      return [];
    }
  }
}
