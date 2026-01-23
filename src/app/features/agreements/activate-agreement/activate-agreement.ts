import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { QuoteStoreService } from '../../../Services/quote-store.service';
import { CustomerStoreService } from '../../../Services/customer-store.service';
import { Quote } from '../../../data/quotes.data';
import { Product } from '../../../data/customers.data';

@Component({
  selector: 'app-activate-agreement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './activate-agreement.html',
})
export class ActivateAgreement implements OnInit {
  quoteId = '';
  quote: Quote | null = null;
  error: string | null = null;

  // ✅ Viktigt: INTE this.fb.group här uppe
  // Vi deklarerar bara och initierar i constructor
  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private quotes: QuoteStoreService,
    private customers: CustomerStoreService,
  ) {
    // ✅ Nu är fb initierad, så här får du skapa form
    this.form = this.fb.group({
      // Kund (read-only)
      customerName: [{ value: '', disabled: true }],
      companyId: [{ value: null as number | null, disabled: true }],

      // Kontakt (kan ändras)
      contactName: [''],
      contactEmail: [''],
      contactPhone: [''],

      // Avtal
      agreementStart: ['', Validators.required],
      agreementEnd: ['', Validators.required],
      billingFrequency: [''],
      monthlyValue: [0, [Validators.min(0)]],

      // Produkter (visning / read-only)
      products: this.fb.control<Product[]>([]),

      // Intern notering (framtid)
      internalNote: [''],
    });
  }

  ngOnInit(): void {
    this.quoteId = this.route.snapshot.queryParamMap.get('quoteId') ?? '';

    if (!this.quoteId) {
      this.error = 'Ingen quoteId hittades i URL:en.';
      return;
    }

    const q = this.quotes.getById(this.quoteId);
    if (!q) {
      this.error = 'Offerten hittades inte. Är den sparad?';
      return;
    }

    // måste vara godkänd innan aktivering
    if (q.status !== 'APPROVED' && q.status !== 'CONVERTED') {
      this.error = 'Offerten måste vara GODKÄND innan du kan aktivera avtal.';
      return;
    }

    this.quote = q;

    // Proffsigt: när man är i avtalssteget men inte aktiverat ännu
    if (q.customerId && q.status === 'APPROVED') {
      this.customers.updateStage(q.customerId, 'AGREEMENT_DRAFT');
    }

    this.form.patchValue({
      customerName: q.customerName,
      companyId: q.companyId ?? null,

      contactName: q.contactName,
      contactEmail: q.contactEmail,
      contactPhone: q.contactPhone,

      agreementStart: q.currentAgreementStart || q.customerStartDate,
      agreementEnd: q.currentAgreementEnd,
      billingFrequency: q.billingFrequency,
      monthlyValue: q.monthlyValue,

      products: q.products,
    });

    // säkerställ att read-only verkligen är read-only
    this.form.controls['customerName']?.disable();
    this.form.controls['companyId']?.disable();

    // om redan konverterad kan du låsa hela vyn
    if (q.status === 'CONVERTED') {
      this.form.disable();
    }
  }

  goBack(): void {
    this.location.back();
  }

  get monthsLeft(): number {
    const end = (this.form.value as any).agreementEnd || '';
    return this.calcMonthsLeft(end);
  }

  get valueLeft(): number {
    const mv = Number((this.form.value as any).monthlyValue || 0);
    return Math.max(0, this.monthsLeft * mv);
  }

  activate(): void {
    if (!this.quote) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 1) uppdatera months/value på kundprofil
    if (this.quote.customerId) {
      this.customers.updateCustomerQuoteMetrics(
        this.quote.customerId,
        this.monthsLeft,
        this.valueLeft,
      );
      this.customers.updateStage(this.quote.customerId, 'ACTIVE');
    }

    // 3) markera offerten som konverterad
    this.quotes.convert(this.quote.id);

    // 4) navigera till kunden
    if (this.quote.customerId) {
      this.router.navigate(['/customers', this.quote.customerId]);
    } else {
      this.router.navigate(['/quotes']);
    }
  }

  private calcMonthsLeft(endYmd: string): number {
    const end = this.parseYmd(endYmd);
    if (!end) return 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    if (endDate <= today) return 0;

    const months =
      (endDate.getFullYear() - today.getFullYear()) * 12 +
      (endDate.getMonth() - today.getMonth());

    const bump = endDate.getDate() >= today.getDate() ? 1 : 0;
    return Math.max(0, months + bump);
  }

  private parseYmd(ymd: string): Date | null {
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
}
