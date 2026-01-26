import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SetupStatus = 'INCOMPLETE' | 'COMPLETE';

export type TechnicalSetup = {
  customerId: string;
  status: SetupStatus;
  apiKeys: { name: string; masked: string }[];
  dataSources: { name: string; status: 'DISCONNECTED' | 'CONNECTED' }[];
};

@Injectable({ providedIn: 'root' })
export class SetupStoreService {
  private readonly _setups = new BehaviorSubject<TechnicalSetup[]>([]);
  setups$ = this._setups.asObservable();

  get snapshot(): TechnicalSetup[] {
    return this._setups.value;
  }

  getByCustomer(customerId: string): TechnicalSetup | undefined {
    return this._setups.value.find((s) => s.customerId === customerId);
  }

  upsert(setup: TechnicalSetup): void {
    const exists = this._setups.value.some((s) => s.customerId === setup.customerId);

    const next = exists
      ? this._setups.value.map((s) => (s.customerId === setup.customerId ? setup : s))
      : [setup, ...this._setups.value];

    this._setups.next(next);
  }
}
