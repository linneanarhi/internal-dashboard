import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CUSTOMERS, Customer, Product } from '../../../data/customers.data';
import { CustomerStoreService } from '../../../Services/customer-store.service';

type SortColumn = 'createdAt' | 'name' | 'companyId' | 'usersCount';
type SortDir = 'asc' | 'desc';
type ProductFilter = 'all' | Product;

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customers.html',
})
export class CustomersComponent {
  // ============================================================
  // State
  // ============================================================

  customers: Customer[] = [];

  query = '';
  productFilter: ProductFilter = 'all';

  sortBy: SortColumn = 'createdAt';
  sortDir: SortDir = 'desc';

  // Dropdown (Produkter)
  productsOpen = false;
  productsMenuLeft = 0;
  productsMenuTop = 0;

  @ViewChild('productsBtn', { read: ElementRef })
  private productsBtn?: ElementRef<HTMLElement>;

  // ============================================================
  // Init
  // ============================================================

  constructor(
    private router: Router,
    private store: CustomerStoreService,
  ) {
    this.store.init(CUSTOMERS);
    this.store.customers$.subscribe((list) => (this.customers = list));
  }

  // ============================================================
  // Derived metrics (cards/footnote)
  // ============================================================

  get totalCustomers(): number {
    return this.customers.length;
  }

  get totalUsers(): number {
    return this.customers.reduce((sum, c) => sum + c.usersCount, 0);
  }

  get countCalls(): number {
    return this.customers.filter((c) => c.products.includes('calls')).length;
  }

  get countEmail(): number {
    return this.customers.filter((c) => c.products.includes('email')).length;
  }

  // ============================================================
  // Labels / Display helpers
  // ============================================================

  statusLabel(stage: Customer['stage']): 'Klar' | 'Åtgärd' {
    return stage === 'ACTIVE' ? 'Klar' : 'Åtgärd';
  }

  nextActionLabel(stage: Customer['stage']): string {
    switch (stage) {
      case 'QUOTE_SENT':
        return 'Invänta godkännande av offert';
      case 'QUOTE_APPROVED':
        return 'Aktivera avtal';
      case 'AGREEMENT_DRAFT':
        return 'Slutför och aktivera avtal';
      case 'ACTIVE':
      default:
        return '—';
    }
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

  formatDateISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ============================================================
  // Filtering + sorting
  // ============================================================

  get filteredCustomers(): Customer[] {
    const q = this.query.trim().toLowerCase();
    let list = [...this.customers];

    // Product filter
    if (this.productFilter !== 'all') {
      list = list.filter((c) => c.products.includes(this.productFilter as Product));
    }

    // Search filter
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

    // Sorting
    const dir = this.sortDir === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      switch (this.sortBy) {
        case 'createdAt':
          return (a.createdAt.getTime() - b.createdAt.getTime()) * dir;
        case 'companyId':
          return (a.companyId - b.companyId) * dir;
        case 'usersCount':
          return (a.usersCount - b.usersCount) * dir;
        case 'name':
          return a.name.localeCompare(b.name, 'sv', { sensitivity: 'base' }) * dir;
        default:
          return 0;
      }
    });

    return list;
  }

  toggleSort(col: SortColumn): void {
    if (this.sortBy === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.sortBy = col;

    this.sortDir = col === 'createdAt' || col === 'usersCount' ? 'desc' : 'asc';
  }

  // ============================================================
  // Product dropdown (desktop overlay)
  // ============================================================

  toggleProducts(event: MouseEvent): void {
    event.stopPropagation();
    this.productsOpen = !this.productsOpen;

    if (this.productsOpen) {
      queueMicrotask(() => this.positionProductsMenu());
    }
  }

  setProductFilter(p: ProductFilter): void {
    this.productFilter = p;
    this.closeProducts();
  }

  closeProducts(): void {
    this.productsOpen = false;
  }

  private positionProductsMenu(): void {
    const btn = this.productsBtn?.nativeElement;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();

    const wrapper = btn.closest('.relative') as HTMLElement | null;
    const wrapRect = wrapper?.getBoundingClientRect();

    const offsetLeft = wrapRect ? wrapRect.left : 0;
    const offsetTop = wrapRect ? wrapRect.top : 0;

    this.productsMenuLeft = rect.left - offsetLeft;
    this.productsMenuTop = rect.bottom - offsetTop; 
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.productsOpen) this.closeProducts();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.productsOpen) this.positionProductsMenu();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.productsOpen) this.positionProductsMenu();
  }

  // ============================================================
  // Navigation
  // ============================================================

  openCustomer(id: string): void {
    this.router.navigate(['/customers', id]);
  }

  goToActivateAgreement(customerId: string): void {
    this.router.navigate(['/agreements/activate', customerId]);
  }
}
