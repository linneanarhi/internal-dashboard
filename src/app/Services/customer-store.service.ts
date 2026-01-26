import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer, CustomerStage, Product } from '../data/customers.data';

const STORAGE_KEY = 'customers:v1';

@Injectable({ providedIn: 'root' })
export class CustomerStoreService {
  private readonly _customers = new BehaviorSubject<Customer[]>(this.load());
  customers$ = this._customers.asObservable();

  get snapshot(): Customer[] {
    return this._customers.value;
  }

  /** Init: om du vill seed:a men inte skriva över localStorage */
  init(customers: Customer[]): void {
    if (this._customers.value.length === 0) {
      const next = [...customers];
      this._customers.next(next);
      this.persist(next);
    }
  }

  getById(id: string): Customer | undefined {
    return this._customers.value.find((c) => c.id === id);
  }

  /** Generell patch-update (det du behöver i quotes.ts) */
  updateCustomer(id: string, patch: Partial<Customer>): void {
    const existing = this.getById(id);
    if (!existing) return;

    const updated: Customer = { ...existing, ...patch };
    const next = this._customers.value.map((c) => (c.id === id ? updated : c));

    this._customers.next(next);
    this.persist(next);
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

      // tillfällig stage tills du gått över helt till flow
      stage: 'QUOTE_SENT',
    };

    const next = [newCustomer, ...this._customers.value];
    this._customers.next(next);
    this.persist(next);
    return newCustomer;
  }

  /** Spara monthsLeft/valueLeft på kundprofilen */
  updateCustomerQuoteMetrics(customerId: string, monthsLeft: number, valueLeft: number): void {
    this.updateCustomer(customerId, { monthsLeft, valueLeft } as Partial<Customer>);
  }

  updateStage(customerId: string, stage: CustomerStage): void {
    this.updateCustomer(customerId, { stage });
  }

  // ========= storage =========

  private persist(list: Customer[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  private load(): Customer[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Customer[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
