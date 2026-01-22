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

  addCustomerFromQuote(payload: {
    name: string;
    email: string;
    companyId: number;
    products: Product[];
    createdAt: Date;
  }): Customer {
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

    this._customers.next([newCustomer, ...this._customers.value]);
    return newCustomer;
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
