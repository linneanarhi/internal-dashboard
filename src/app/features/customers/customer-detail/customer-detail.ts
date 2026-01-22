import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { Customer, Product } from '../../../data/customers.data';
import { CustomerStoreService } from '../../../Services/customer-store.service';

type TabId = 'services' | 'agreement' | 'sources' | 'addons' | 'users' | 'comments';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-detail.html',
})
export class CustomerDetailComponent {
  id = '';
  customer: Customer | null = null;

  activeTab: TabId = 'services';

  tabs: { id: TabId; label: string }[] = [
    { id: 'services', label: 'Aktiva tjänster' },
    { id: 'agreement', label: 'Avtal och kontakt' },
    { id: 'sources', label: 'Datakällor' },
    { id: 'addons', label: 'Tilläggsavtal' },
    { id: 'users', label: 'Aktiva användare' },
    { id: 'comments', label: 'Om kunden' },
  ];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private store: CustomerStoreService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.refreshCustomer();

    // Så sidan uppdateras om stage ändras från andra sidor
    this.store.customers$.subscribe(() => this.refreshCustomer());
  }

  private refreshCustomer(): void {
    this.customer = this.id ? (this.store.getById(this.id) ?? null) : null;
  }

  goBack(): void {
    this.location.back();
  }

  // --- Flödeslogik ---
  get canApproveQuote(): boolean {
    return this.customer?.stage === 'QUOTE_SENT';
  }

  get canActivateAgreement(): boolean {
    return this.customer?.stage === 'QUOTE_APPROVED' || this.customer?.stage === 'AGREEMENT_DRAFT';
  }

  approveQuote(): void {
    if (!this.customer) return;
    this.store.updateStage(this.customer.id, 'QUOTE_APPROVED');
  }

  goToActivateAgreement(): void {
    if (!this.customer) return;
    this.router.navigate(['/agreements/activate', this.customer.id]);
  }

  // --- UI helpers (samma som i listan, fast lokalt här) ---
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
      default:
        return p; // fallback (eller 'Okänd produkt')
    }
  }
}
