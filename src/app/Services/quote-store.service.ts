import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Quote } from '../data/quotes.data';

import { AgreementStoreService } from './agreement-store.service';
import { CustomerStoreService } from './customer-store.service';

const STORAGE_KEY = 'quotes:v1';

@Injectable({ providedIn: 'root' })
export class QuoteStoreService {
  constructor(
    private agreements: AgreementStoreService,
    private customers: CustomerStoreService,
  ) {}

  private readonly _quotes = new BehaviorSubject<Quote[]>(this.load());
  quotes$ = this._quotes.asObservable();

  get snapshot(): Quote[] {
    return this._quotes.value;
  }

  getById(id: string): Quote | undefined {
    return this._quotes.value.find((q) => q.id === id);
  }

  upsert(quote: Quote): void {
    const exists = this._quotes.value.some((q) => q.id === quote.id);
    const next = exists
      ? this._quotes.value.map((q) => (q.id === quote.id ? quote : q))
      : [quote, ...this._quotes.value];

    this._quotes.next(next);
    this.persist(next);
  }

  /** Uppdatera valfria fält på en quote (patch) */
  update(id: string, patch: Partial<Quote>): void {
    const q = this.getById(id);
    if (!q) return;

    this.upsert({
      ...q,
      ...patch,
      updatedAtIso: new Date().toISOString(),
    } as Quote);
  }

  updateStatus(id: string, status: Quote['status']): void {
    this.update(id, { status });
  }

  /**
   * Godkänn offert:
   * - status = APPROVED
   * - skapa avtal PENDING_SETUP (om inget redan finns)
   * - sätt customer.currentAgreementId
   * - (valfritt) uppdatera customer.stage
   */
  approveQuote(quoteId: string): { agreementId: string } | null {
    const quote = this.getById(quoteId);
    if (!quote) return null;

    if (!quote.customerId) return null;

    // 1) sätt APPROVED (om inte redan)
    if (quote.status !== 'APPROVED') {
      this.update(quoteId, { status: 'APPROVED' });
    }

    // 2) om kunden redan har currentAgreementId -> skapa inte nytt
    const customer = this.customers.getById(quote.customerId) as any;
    const existingCurrent = customer?.currentAgreementId as string | undefined;

    if (existingCurrent) {
      // säkerställ stage om ni vill
      this.customers.updateStage(quote.customerId, 'AGREEMENT_DRAFT');
      return { agreementId: existingCurrent };
    }

    // 3) om det redan finns ett PENDING_SETUP-avtal -> återanvänd
    const existingPending = this.agreements
      .getByCustomer(quote.customerId)
      .find((a) => a.status === 'PENDING_SETUP');

    const agreement =
      existingPending ??
      this.agreements.createAgreement({
        customerId: quote.customerId,
        status: 'PENDING_SETUP',
        products: (quote as any).products ?? [],
        pdfUrl: (quote as any).pdfUrl,
      });

    // 4) skriv currentAgreementId på kunden
    this.customers.setCurrentAgreement(quote.customerId, agreement.id);

    // 5) stage (valfritt men bra)
    this.customers.updateStage(quote.customerId, 'AGREEMENT_DRAFT');

    return { agreementId: agreement.id };
  }

  convert(id: string): void {
    const q = this.getById(id);
    if (!q) return;

    if (q.status !== 'APPROVED' && q.status !== 'CONVERTED') return;

    const convertedAtIso = (q as any).convertedAtIso ?? new Date().toISOString();

    this.upsert({
      ...q,
      status: 'CONVERTED',
      convertedAtIso,
      updatedAtIso: new Date().toISOString(),
    } as any);
  }

  private persist(quotes: Quote[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch {}
  }

  private load(): Quote[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Quote[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
