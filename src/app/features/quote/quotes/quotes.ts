import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
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

  /**
   * Uppdatera offertstatus.
   * När status blir APPROVED: skapa avtal + skapa setup-stub + koppla kund till aktuell offert/avtal.
   */
  setStatus(q: Quote, status: 'DRAFT' | 'SENT' | 'APPROVED'): void {
    // 1) Uppdatera offerten (din store-metod heter updateStatus)
    this.quoteStore.updateStatus(q.id, status);

    // 2) Endast vid APPROVED ska vi skapa “nästa steg” i flödet
    if (status !== 'APPROVED') return;

    // 3) Hämta kund (om din CustomerStoreService har getById)
    // Om den inte finns i din store – då kan du ta bort detta block och bara köra updateCustomer.
    const customer =
      typeof (this.customers as any).getById === 'function'
        ? (this.customers as any).getById(q.customerId)
        : undefined;

    // 4) Skydd: skapa inte nytt avtal om kunden redan har ett kopplat
    // (Annars skapar du flera avtal om man klickar godkänn flera gånger.)
    const existingAgreementId = customer?.currentAgreementId;
    if (existingAgreementId) {
      // Koppla ändå currentQuoteId så “senaste offerten” blir rätt
      this.customers.updateCustomer(q.customerId, { currentQuoteId: q.id });

      // Säkerställ setup finns
      const existingSetup = this.setups.getByCustomer(q.customerId);
      if (!existingSetup) {
        this.setups.upsert({
          customerId: q.customerId,
          status: 'INCOMPLETE',
          apiKeys: [{ name: 'Primary API key', masked: '••••••••••1234' }],
          dataSources: [{ name: 'Telefoni', status: 'DISCONNECTED' }],
        });
      }

      return;
    }

    // 5) Skapa avtal (PENDING_SETUP)
    const agreement = this.agreements.createAgreement({
      customerId: q.customerId,
      products: q.products,
      status: 'PENDING_SETUP',
      pdfUrl: '/mock/agreement.pdf',
    });

    // 6) Koppla kunden till aktuellt avtal + aktuell offert
    // Kräver att din kundmodell har currentAgreementId/currentQuoteId
    this.customers.updateCustomer(q.customerId, {
      currentAgreementId: agreement.id,
      currentQuoteId: q.id,
    });

    // 7) Setup: skapa om den saknas
    const existingSetup = this.setups.getByCustomer(q.customerId);
    if (!existingSetup) {
      this.setups.upsert({
        customerId: q.customerId,
        status: 'INCOMPLETE',
        apiKeys: [{ name: 'Primary API key', masked: '••••••••••1234' }],
        dataSources: [{ name: 'Telefoni', status: 'DISCONNECTED' }],
      });
    }

    // Valfritt: om du vill låsa offerten som “konverterad” efter att avtal skapats.
    // OBS: din convert()-metod verkar ha en liten logikmiss (den returnerar när status inte är APPROVED och inte är CONVERTED),
    // så använd bara detta om du verkligen vill ha converted-steget i UI.
    // this.quoteStore.convert(q.id);
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
