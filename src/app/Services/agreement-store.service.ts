import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Agreement } from '../core/models/flow.models';

@Injectable({ providedIn: 'root' })
export class AgreementStoreService {
  private list: Agreement[] = [];
  agreements$ = new BehaviorSubject<Agreement[]>([]);

  init(seed: Agreement[]) {
    this.list = [...seed];
    this.emit();
  }

  getById(id: string) {
    return this.list.find(a => a.id === id) ?? null;
  }

  getByCustomer(customerId: string) {
    return this.list.filter(a => a.customerId === customerId);
  }

  createAgreement(input: Omit<Agreement, 'id' | 'createdAtIso'>) {
    const a: Agreement = {
      ...input,
      id: 'a_' + Math.random().toString(36).slice(2),
      createdAtIso: new Date().toISOString(),
    };
    this.list.unshift(a);
    this.emit();
    return a;
  }

  update(id: string, patch: Partial<Agreement>) {
    const idx = this.list.findIndex(a => a.id === id);
    if (idx === -1) return;
    this.list[idx] = { ...this.list[idx], ...patch };
    this.emit();
  }

  private emit() {
    this.agreements$.next([...this.list]);
  }
}
