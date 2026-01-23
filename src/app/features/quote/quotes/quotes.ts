import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { QuoteStoreService } from '../../../Services/quote-store.service';
import { Quote } from '../../../data/quotes.data';

type SortKey = 'updatedAt' | 'createdAt' | 'customerName' | 'status' | 'valueLeft';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule ],
  templateUrl: './quotes.html',
})
export class QuotesComponent {
  constructor(public quoteStore: QuoteStoreService, private location: Location,) {}

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

  setStatus(quote: Quote, status: Quote['status']): void {
    // PROFFSIGT: Godkänd ska inte kunna backas av misstag i listan
    // (Du kan ändra regeln om ni vill)
    if (quote.status === 'APPROVED') return;

    this.quoteStore.updateStatus(quote.id, status);
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
    // Svenskt format
    return d.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
