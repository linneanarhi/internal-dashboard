import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CUSTOMERS, Customer, Product } from '../../../data/customers.data';
import { CustomerStoreService } from '../../../Services/customer-store.service';

type SortColumn = 'createdAt' | 'name' | 'companyId' | 'usersCount';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customers.html',
})
export class CustomersComponent {
  constructor(
    private router: Router,
    private store: CustomerStoreService,
  ) {
    this.store.init(CUSTOMERS);
    this.store.customers$.subscribe((list) => (this.customers = list));
  }

  productFilter: 'all' | Product = 'all';
  query = '';

  sortBy: SortColumn = 'createdAt';
  sortDir: SortDir = 'desc';

  customers: Customer[] = [];

  get countCalls(): number {
    return this.customers.filter((c) => c.products.includes('calls')).length;
  }

  get countEmail(): number {
    return this.customers.filter((c) => c.products.includes('email')).length;
  }

  get totalCustomers(): number {
    return this.customers.length;
  }

  get totalUsers(): number {
    return this.customers.reduce((sum, c) => sum + c.usersCount, 0);
  }

  statusLabel(stage: Customer['stage']): 'Klar' | 'Åtgärd' {
    return stage === 'ACTIVE' ? 'Klar' : 'Åtgärd';
  }

  toggleSort(col: SortColumn): void {
    if (this.sortBy === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.sortBy = col;

    if (col === 'createdAt' || col === 'usersCount') {
      this.sortDir = 'desc';
    } else {
      this.sortDir = 'asc';
    }
  }

  get filteredCustomers(): Customer[] {
    const q = this.query.trim().toLowerCase();
    let list = [...this.customers];

    const p = this.productFilter;
    if (p !== 'all') {
      list = list.filter((c) => c.products.includes(p));
    }

    if (q) {
      list = list.filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          String(c.companyId).includes(q) ||
          c.id.includes(q)
        );
      });
    }

    const dir = this.sortDir === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      switch (this.sortBy) {
        case 'createdAt': {
          const av = a.createdAt.getTime();
          const bv = b.createdAt.getTime();
          return (av - bv) * dir;
        }
        case 'companyId': {
          return (a.companyId - b.companyId) * dir;
        }
        case 'usersCount': {
          return (a.usersCount - b.usersCount) * dir;
        }
        case 'name': {
          return a.name.localeCompare(b.name, 'sv', { sensitivity: 'base' }) * dir;
        }
        default:
          return 0;
      }
    });

    return list;
  }

  formatDateISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  openCustomer(id: string): void {
    this.router.navigate(['/customers', id]);
  }

  labelForProduct(p: Product): string {
    switch (p) {
      case 'calls':
        return 'Samtal';
      case 'email':
        return 'Mejl';
      case 'chat':
        return 'Chatt';
      case 'cases':
        return 'Ärendeanteckningar';
      case 'other':
        return 'Övriga produkter';
    }
  }
  setProductFilter(p: 'all' | Product): void {
    this.productFilter = p;
    this.productsOpen = false;
  }

  toggleProductFilter(p: Product): void {
    this.productFilter = this.productFilter === p ? 'all' : p;
  }

  productsOpen = false;
}
