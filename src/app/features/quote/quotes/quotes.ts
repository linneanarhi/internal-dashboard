import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AgreementStoreService } from '../../../Services/agreement-store.service';
import { CustomerStoreService } from '../../../Services/customer-store.service';
import { SetupStoreService } from '../../../Services/setup-store.service';
import { QuoteStoreService } from '../../../Services/quote-store.service';
import { Quote } from '../../../data/quotes.data';

type SortKey = 'updatedAt' | 'createdAt' | 'customerName' | 'status' | 'valueLeft';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quotes.html',
})
export class QuotesComponent {
  constructor(
    public quoteStore: QuoteStoreService,
    private location: Location,
    private router: Router,
    private agreements: AgreementStoreService,
    private customers: CustomerStoreService,
    private setups: SetupStoreService,
  ) {}

  // UI state
  query = '';
  statusFilter: Quote['status'] | 'ALL' = 'ALL';
  sortKey: SortKey = 'updatedAt';
  sortDir: 'asc' | 'desc' = 'desc';

  goBack(): void {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/customers']);
  }

  // ========= Derived (körs i template) =========

  get filteredQuotes(): Quote[] {
    const q = this.query.trim().toLowerCase();
    const status = this.statusFilter;

    const list = this.quoteStore.snapshot;

    const filtered = list.filter((x) => {
      const matchesQuery =
        !q ||
        (x.customerName || '').toLowerCase().includes(q) ||
        String(x.companyId ?? '').includes(q) ||
        x.id.toLowerCase().includes(q);

      const matchesStatus = status === 'ALL' ? true : x.status === status;

      return matchesQuery && matchesStatus;
    });

    return this.sort(filtered);
  }

  // ========= Actions =========

  setStatus(q: Quote, status: 'DRAFT' | 'SENT' | 'APPROVED'): void {
    // 1) uppdatera quote
    this.quoteStore.updateStatus(q.id, status);

    // 2) bara vid APPROVED ska vi skapa nästa steg
    if (status !== 'APPROVED') return;

    const customerId = q.customerId; // ska nu alltid finnas

    // 3) skapa avtal om kunden inte redan har ett kopplat
    const customer = this.customers.getById(customerId);

    if (customer?.currentAgreementId) {
      // Koppla ändå “currentQuoteId” så kund pekar på senaste offerten
      this.customers.updateCustomer(customerId, { currentQuoteId: q.id });

      // Se till att setup finns
      if (!this.setups.getByCustomer(customerId)) {
        this.setups.upsert({
          customerId,
          status: 'INCOMPLETE',
          apiKeys: [{ name: 'Primary API key', masked: '••••••••••1234' }],
          dataSources: [{ name: 'Telefoni', status: 'DISCONNECTED' }],
        });
      }
      return;
    }

    const agreement = this.agreements.createAgreement({
      customerId,
      products: q.products,
      status: 'PENDING_SETUP',
      pdfUrl: '/mock/agreement.pdf',
    });

    // 4) koppla kunden till aktuell quote + agreement
    this.customers.updateCustomer(customerId, {
      currentQuoteId: q.id,
      currentAgreementId: agreement.id,
    });

    // 5) setup-stub om saknas
    if (!this.setups.getByCustomer(customerId)) {
      this.setups.upsert({
        customerId,
        status: 'INCOMPLETE',
        apiKeys: [{ name: 'Primary API key', masked: '••••••••••1234' }],
        dataSources: [{ name: 'Telefoni', status: 'DISCONNECTED' }],
      });
    }
  }

  // ========= Helpers =========

  badgeClass(status: Quote['status']): string {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'CONVERTED':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  }

  labelStatus(status: Quote['status']): string {
    switch (status) {
      case 'DRAFT':
        return 'Utkast';
      case 'SENT':
        return 'Skickad';
      case 'APPROVED':
        return 'Godkänd';
      case 'REJECTED':
        return 'Avslagen';
      case 'CONVERTED':
        return 'Konverterad';
      default:
        return status;
    }
  }

  private sort(list: Quote[]): Quote[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;

    return [...list].sort((a, b) => {
      const av = this.sortValue(a, this.sortKey);
      const bv = this.sortValue(b, this.sortKey);

      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  private sortValue(q: Quote, key: SortKey): string | number {
    switch (key) {
      case 'updatedAt':
        return q.updatedAtIso || '';
      case 'createdAt':
        return q.createdAtIso || '';
      case 'customerName':
        return (q.customerName || '').toLowerCase();
      case 'status':
        return q.status || '';
      case 'valueLeft':
        return q.valueLeft || 0;
      default:
        return q.updatedAtIso || '';
    }
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'desc';
    }
  }
}
