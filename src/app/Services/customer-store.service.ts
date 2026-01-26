import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer, CustomerStage, Product } from '../data/customers.data';

const STORAGE_KEY = 'customers:v1';

function normalizeCustomer(c: any): Customer {
  return {
    ...c,
    createdAt: c?.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt),
  } as Customer;
}

@Injectable({ providedIn: 'root' })
export class CustomerStoreService {
  private readonly _customers = new BehaviorSubject<Customer[]>(this.load());
  customers$ = this._customers.asObservable();

  get snapshot(): Customer[] {
    return this._customers.value;
  }

  init(customers: Customer[]): void {
    if (this._customers.value.length > 0) return;

    const seeded = customers.map((c) => normalizeCustomer(c));
    this._customers.next(seeded);
    this.persist(seeded);
  }

  getById(id: string): Customer | undefined {
    return this._customers.value.find((c) => c.id === id);
  }

  addOrGetCustomerFromQuote(payload: {
    name: string;
    email: string;
    companyId: number;
    products: Product[];
    createdAt: Date;
  }): Customer {
    const existing = this._customers.value.find((c) => c.companyId === payload.companyId);

    if (existing) {
      const updated: Customer = {
        ...existing,
        name: payload.name || existing.name,
        email: payload.email || existing.email,
        products: payload.products?.length ? payload.products : existing.products,
      };

      const next = this._customers.value.map((c) => (c.id === existing.id ? updated : c));
      this._customers.next(next);
      this.persist(next);
      return updated;
    }

    const newCustomer: Customer = {
      id: String(payload.companyId),
      name: payload.name,
      email: payload.email,
      companyId: payload.companyId,
      createdAt: payload.createdAt,
      products: payload.products,
      usersCount: 0,
      stage: 'QUOTE_SENT',
    };

    const next = [newCustomer, ...this._customers.value];
    this._customers.next(next);
    this.persist(next);
    return newCustomer;
  }

  updateCustomerQuoteMetrics(customerId: string, monthsLeft: number, valueLeft: number): void {
    const next = this._customers.value.map((c) =>
      c.id === customerId ? { ...c, monthsLeft, valueLeft } : c,
    );
    this._customers.next(next);
    this.persist(next);
  }

  updateStage(customerId: string, stage: CustomerStage): void {
    const next = this._customers.value.map((c) =>
      c.id === customerId ? { ...c, stage } : c,
    );
    this._customers.next(next);
    this.persist(next);
  }

  updateCustomer(id: string, patch: Partial<Customer> & Record<string, any>): void {
    const existing = this.getById(id);
    if (!existing) return;

    const updated = normalizeCustomer({ ...existing, ...patch });

    const next = this._customers.value.map((c) => (c.id === id ? updated : c));
    this._customers.next(next);
    this.persist(next);
  }

  // --------------------
  // Storage
  // --------------------

  private persist(list: Customer[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  private load(): Customer[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((c) => normalizeCustomer(c));
    } catch {
      return [];
    }
  }
}
