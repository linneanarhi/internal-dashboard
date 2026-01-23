import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer, CustomerStage, Product } from '../data/customers.data';

@Injectable({ providedIn: 'root' })
export class CustomerStoreService {
  private readonly _customers = new BehaviorSubject<Customer[]>([]);
  customers$ = this._customers.asObservable();

  get snapshot(): Customer[] {
    return this._customers.value;
  }

  init(customers: Customer[]): void {
    if (this._customers.value.length === 0) {
      this._customers.next([...customers]);
    }
  }

  /** ✅ PROFFSIGT: återanvänd kund om den finns, annars skapa */
  addOrGetCustomerFromQuote(payload: {
    name: string;
    email: string;
    companyId: number;
    products: Product[];
    createdAt: Date;
  }): Customer {
    const existing = this._customers.value.find(c => c.companyId === payload.companyId);
    if (existing) {
      const updated: Customer = {
        ...existing,
        name: payload.name || existing.name,
        email: payload.email || existing.email,
        products: payload.products?.length ? payload.products : existing.products,
      };

      this._customers.next(this._customers.value.map(c => (c.id === existing.id ? updated : c)));
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
      stage: 'QUOTE_SENT', // om du har bättre stage: QUOTE_DRAFT / QUOTE_SENT
    };

    this._customers.next([newCustomer, ...this._customers.value]);
    return newCustomer;
  }

  /** ✅ Spara monthsLeft/valueLeft på kund för kundprofilen */
  updateCustomerQuoteMetrics(customerId: string, monthsLeft: number, valueLeft: number): void {
    const updated = this._customers.value.map(c =>
      c.id === customerId ? { ...c, monthsLeft, valueLeft } : c
    );
    this._customers.next(updated);
  }

  updateStage(customerId: string, stage: CustomerStage): void {
    const updated = this._customers.value.map((c) =>
      c.id === customerId ? { ...c, stage } : c
    );
    this._customers.next(updated);
  }

  getById(id: string): Customer | undefined {
    return this._customers.value.find((c) => c.id === id);
  }
}
