import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Quote } from '../data/quotes.data';

const STORAGE_KEY = 'quotes:v1';

@Injectable({ providedIn: 'root' })
export class QuoteStoreService {
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

  updateStatus(id: string, status: Quote['status']): void {
    const q = this.getById(id);
    if (!q) return;
    this.upsert({ ...q, status, updatedAtIso: new Date().toISOString() });
  }

  convert(id: string): void {
    const q = this.getById(id);
    if (!q) return;

    // bara godkända offerter ska kunna konverteras
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
