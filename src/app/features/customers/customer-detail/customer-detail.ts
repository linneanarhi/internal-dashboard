import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Customer } from '../../../data/customers.data';
import { CustomerStoreService } from '../../../Services/customer-store.service';

// Tabs
import { CustomerDashboardTabComponent } from './tabs/customer-dashboard-tab';
import { CustomerAgreementsTabComponent } from './tabs/customer-agreements-tab';
import { CustomerSourcesTabComponent } from './tabs/customer-sources-tab';
import { CustomerUsersTabComponent } from './tabs/customer-users-tab';
import { CustomerAboutTabComponent } from './tabs/customer-about-tab';

type TabId = 'dashboard' | 'agreements' | 'sources' | 'users' | 'about';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    // Tab components
    CustomerDashboardTabComponent,
    CustomerAgreementsTabComponent,
    CustomerSourcesTabComponent,
    CustomerUsersTabComponent,
    CustomerAboutTabComponent,
  ],
  templateUrl: './customer-detail.html',
})
export class CustomerDetailComponent {
  // =========================================================
  // DI
  // =========================================================
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly store = inject(CustomerStoreService);
  private readonly destroyRef = inject(DestroyRef);

  // =========================================================
  // State
  // =========================================================
  id = '';
  customer: Customer | null = null;

  activeTab: TabId = 'dashboard';

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'agreements', label: 'Avtal & offerter' },
    { id: 'sources', label: 'Datakällor' },
    { id: 'users', label: 'Aktiva användare' },
    { id: 'about', label: 'Om kunden' },
  ];

  // =========================================================
  // Init
  // =========================================================
  constructor() {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.refreshCustomer();

    this.store.customers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshCustomer());
  }

  // =========================================================
  // Navigation
  // =========================================================
  goBack(): void {
    this.location.back();
  }

  private refreshCustomer(): void {
    this.customer = this.id ? (this.store.getById(this.id) ?? null) : null;
  }

  goToTechnicalSetup(): void {
    this.router.navigate(['/technical-setup']);
  }

  goToAddProduct(): void {
    this.router.navigate(['/customers', this.id, 'add-product']);
  }

  // =========================================================
  // Flow / stage logic
  // =========================================================
  get canApproveQuote(): boolean {
    return this.customer?.stage === 'QUOTE_SENT';
  }

  get canActivateAgreement(): boolean {
    const stage = this.customer?.stage;
    return stage === 'QUOTE_APPROVED' || stage === 'AGREEMENT_DRAFT';
  }

  approveQuote(): void {
    if (!this.customer) return;
    this.store.updateStage(this.customer.id, 'QUOTE_APPROVED');
  }

  goToActivateAgreement(): void {
    if (!this.customer) return;
    this.router.navigate(['/agreements/activate', this.customer.id]);
  }

  openService(): void {
    this.activeTab = 'sources';
  }

  // =========================================================
  // UI helpers
  // =========================================================
  isActive(stage: Customer['stage']): boolean {
    return stage === 'ACTIVE';
  }

  statusLabel(stage: Customer['stage']): 'Klar' | 'Åtgärd' {
    return this.isActive(stage) ? 'Klar' : 'Åtgärd';
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
        return '—';
    }
  }
}
