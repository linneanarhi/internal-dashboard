import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AgreementStatus = 'PENDING_SETUP' | 'ACTIVE';

export type Agreement = {
  id: string;
  customerId: string;
  status: AgreementStatus;
  createdAtIso: string;
  products: string[];
  pdfUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class AgreementStoreService {
  private readonly _agreements = new BehaviorSubject<Agreement[]>([]);
  agreements$ = this._agreements.asObservable();

  get snapshot(): Agreement[] {
    return this._agreements.value;
  }

  getById(id: string): Agreement | undefined {
    return this._agreements.value.find((a) => a.id === id);
  }

  getByCustomer(customerId: string): Agreement[] {
    return this._agreements.value.filter((a) => a.customerId === customerId);
  }

  createAgreement(input: Omit<Agreement, 'id' | 'createdAtIso'>): Agreement {
    const agreement: Agreement = {
      ...input,
      id: `a-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAtIso: new Date().toISOString(),
    };

    const next = [agreement, ...this._agreements.value];
    this._agreements.next(next);

    return agreement;
  }

  update(id: string, patch: Partial<Agreement>): void {
    const next = this._agreements.value.map((a) => (a.id === id ? { ...a, ...patch } : a));
    this._agreements.next(next);
  }
}
