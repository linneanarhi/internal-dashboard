import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CustomerStoreService } from '../../../Services/customer-store.service';
import { QuoteStoreService } from '../../../Services/quote-store.service';
import { AgreementStoreService } from '../../../Services/agreement-store.service';
import { SetupStoreService } from '../../../Services/setup-store.service';

import { Quote } from '../../../data/quotes.data';
import { Product } from '../../../data/customers.data';

@Component({
  selector: 'app-quote-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-quote.html',
})
export class QuoteNewComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private customers: CustomerStoreService,
    private quotes: QuoteStoreService,
    private agreements: AgreementStoreService,
    private setups: SetupStoreService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  // Dropdowns
  industries = ['Bostad', 'Kontaktcenter', 'X'] as const;
  productTypes = ['Customer service', 'Survey', 'X'] as const;
  reportFrequencies = ['Varje månad', 'Varannan månad', 'Kvartal'] as const;
  presentationFrequencies = [
    'Varje månad',
    'Varannan månad',
    'Kvartal',
    'Tertial',
    'Halvår',
    'Helår',
    'Annat',
  ] as const;
  billingFrequencies = ['Varje månad', 'Kvartal', 'År', 'Annat'] as const;

  readonly productOptions: { key: Product; label: string }[] = [
    { key: 'calls' as Product, label: 'Samtal' },
    { key: 'email' as Product, label: 'Mejl' },
    { key: 'chat' as Product, label: 'Chatt' },
    { key: 'cases' as Product, label: 'Ärenden' },
  ];

  quoteId = '';
  form!: FormGroup;

  // ✅ för “på riktigt”: öppna /quote/new?customerId=...
  prefillCustomerId = '';

  ngOnInit(): void {
    // 1) quoteId från route eller nytt
    this.quoteId = this.route.snapshot.paramMap.get('id') ?? this.makeId();

    // 2) build form
    this.form = this.fb.group({
      customer: this.fb.group({
        customerName: ['', [Validators.required, Validators.minLength(2)]],
        companyId: [null as number | null, [Validators.required, Validators.min(1)]],
        industry: [''],
        productType: [''],
        salesRep: [''],
        contactName: [''],
        contactEmail: ['', [Validators.email]],
        contactPhone: [''],
      }),
      agreement: this.fb.group({
        customerStartDate: ['', Validators.required],
        currentAgreementStart: [''],
        currentAgreementEnd: [''],
        monthlyValue: [0, [Validators.min(0)]],
      }),
      options: this.fb.group({
        optionNote: [''],
        integration: [false],

        pdfReport: [false],
        pdfYearSummary: [false],

        employeeAnalysis: [false],
        employeeAnalysisCount: [0, [Validators.min(0)]],

        aiChat: [false],
      }),
      delivery: this.fb.group({
        reportFrequency: [''],
        presentationFrequency: [''],
        billingFrequency: [''],
      }),
      products: this.fb.control<Product[]>([]),
    });

    // 3) edit-läge: ladda offert och patcha
    const existing = this.quotes.getById(this.quoteId);
    if (existing) {
      this.patchFromQuote(existing);

      if (existing.status === 'APPROVED') {
        this.form.disable();
      }
      return; // edit-läge vinner över prefill
    }

    // 4) ✅ create-läge: prefill via query param customerId
    this.prefillCustomerId = this.route.snapshot.queryParamMap.get('customerId') ?? '';
    if (this.prefillCustomerId) {
      const c = this.customers.getById(this.prefillCustomerId);
      if (c) {
        this.form.patchValue({
          customer: {
            customerName: c.name ?? '',
            companyId: c.companyId ?? null,
            contactEmail: c.email ?? '',
          },
          products: c.products ?? [],
        });
      }
    }
  }

  get isValidToSave(): boolean {
    return this.form?.valid ?? false;
  }

  get monthsLeft(): number {
    const end = this.form?.value?.agreement?.currentAgreementEnd || '';
    return this.calcMonthsLeft(end);
  }

  get valueLeft(): number {
    const mv = Number(this.form?.value?.agreement?.monthlyValue || 0);
    return Math.max(0, this.monthsLeft * mv);
  }

  goBack(): void {
    this.location.back();
  }

  toggleProduct(p: Product, checked: boolean): void {
    const current: Product[] = this.form.value.products || [];
    const next = checked ? [...current, p] : current.filter((x) => x !== p);
    this.form.controls['products'].setValue(next);
  }

  /** Spara UTKAST */
  saveDraft(): void {
    if (!this.isValidToSave) {
      this.form.markAllAsTouched();
      return;
    }

    const quote = this.buildQuote('DRAFT');
    this.persistQuoteAndCustomer(quote);

    if (quote.customerId) {
      this.router.navigate(['/customers', quote.customerId]);
    }
  }

  /** Markera som SKICKAD */
  markAsSent(): void {
    if (!this.isValidToSave) {
      this.form.markAllAsTouched();
      return;
    }

    const quote = this.buildQuote('SENT');
    this.persistQuoteAndCustomer(quote);
  }

  /** GODKÄNN: lås offert och gå till avtal */
  approveQuote(): void {
    if (!this.isValidToSave) {
      this.form.markAllAsTouched();
      return;
    }

    const end = this.form.value.agreement?.currentAgreementEnd || '';
    if (!end) {
      const ctrl = this.form.get('agreement.currentAgreementEnd');
      ctrl?.setErrors({ required: true });
      ctrl?.markAsTouched();
      return;
    }

    const quote = this.buildQuote('APPROVED');
    this.persistQuoteAndCustomer(quote);

    this.form.disable();

    this.router.navigate(['/agreements/activate'], {
      queryParams: { quoteId: quote.id },
    });
  }

  /** PDF-export (stub) */
  exportPdf(): void {
    if (!this.isValidToSave) {
      this.form.markAllAsTouched();
      return;
    }
    window.print();
  }

  /**
   * ✅ “På riktigt”:
   * - Om vi öppnade med customerId: använd den kunden (uppdatera ev fält)
   * - Annars: addOrGetCustomerFromQuote (skapa om saknas)
   * - Sätt currentQuoteId på kunden
   * - Vid APPROVED: skapa avtal + setup-stub och sätt currentAgreementId
   */
  private persistQuoteAndCustomer(quote: Quote): void {
    const createdAt = this.parseYmd(quote.customerStartDate) ?? new Date();

    const companyId = quote.companyId ?? 0;
    if (!companyId || companyId < 1) {
      this.form.get('customer.companyId')?.setErrors({ required: true });
      this.form.get('customer.companyId')?.markAsTouched();
      return;
    }

    // 1) Hämta/Skapa kund
    const prefill = this.prefillCustomerId
      ? this.customers.getById(this.prefillCustomerId)
      : undefined;

    const customer = prefill
      ? (() => {
          // uppdatera kund med det som står i offerten (om man ändrat namn/email/products)
          this.customers.updateCustomer(prefill.id, {
            name: quote.customerName,
            email: quote.contactEmail || prefill.email,
            products: quote.products?.length ? quote.products : prefill.products,
          });
          return this.customers.getById(prefill.id)!;
        })()
      : this.customers.addOrGetCustomerFromQuote({
          name: quote.customerName,
          email: quote.contactEmail || '',
          companyId,
          products: quote.products,
          createdAt,
        });

    // 2) Sätt customerId och spara quote
    quote.customerId = customer.id;
    this.quotes.upsert(quote);

    // 3) Koppla kunden -> currentQuoteId (viktigt för flow-resolver)
    this.customers.updateCustomer(customer.id, {
      currentQuoteId: quote.id,
    });

    // 4) Spara metrics på kundprofil
    this.customers.updateCustomerQuoteMetrics(customer.id, quote.monthsLeft, quote.valueLeft);

    // 5) (tillfällig stage tills du är 100% flow)
    if (quote.status === 'DRAFT') this.customers.updateStage(customer.id, 'QUOTE_SENT');
    if (quote.status === 'SENT') this.customers.updateStage(customer.id, 'QUOTE_SENT');
    if (quote.status === 'APPROVED') this.customers.updateStage(customer.id, 'QUOTE_APPROVED');
    if (quote.status === 'CONVERTED') this.customers.updateStage(customer.id, 'ACTIVE');

    // 6) ✅ Vid APPROVED: skapa agreement + setup-stub (om saknas)
    if (quote.status === 'APPROVED') {
      const latestCustomer = this.customers.getById(customer.id);
      const currentAgreementId = (latestCustomer as any)?.currentAgreementId as string | undefined;

      // A) skapa avtal om det inte redan finns
      if (!currentAgreementId && typeof (this.agreements as any).createAgreement === 'function') {
        const agreement = (this.agreements as any).createAgreement({
          customerId: customer.id,
          products: quote.products,
          status: 'PENDING_SETUP',
          pdfUrl: '/mock/agreement.pdf',
        });

        this.customers.updateCustomer(customer.id, {
          currentAgreementId: agreement.id,
          currentQuoteId: quote.id,
        });
      }

      // B) setup-stub om saknas
      const existingSetup = this.setups.getByCustomer(customer.id);
      if (!existingSetup) {
        this.setups.upsert({
          customerId: customer.id,
          status: 'INCOMPLETE',
          apiKeys: [{ name: 'Primary API key', masked: '••••••••••1234' }],
          dataSources: [{ name: 'Telefoni', status: 'DISCONNECTED' }],
        });
      }
    }
  }

  /**
   * Build quote utifrån form.
   * customerId fylls “på riktigt” i persistQuoteAndCustomer().
   */
  private buildQuote(status: Quote['status']): Quote {
    const existing = this.quotes.getById(this.quoteId);

    const createdAtIso = existing?.createdAtIso ?? new Date().toISOString();
    const updatedAtIso = new Date().toISOString();
    const approvedAtIso =
      status === 'APPROVED'
        ? (existing?.approvedAtIso ?? new Date().toISOString())
        : existing?.approvedAtIso;

    const c = this.form.value.customer!;
    const a = this.form.value.agreement!;
    const o = this.form.value.options!;
    const d = this.form.value.delivery!;
    const products = (this.form.value.products || []) as Product[];

    const monthsLeft = this.calcMonthsLeft(String(a.currentAgreementEnd || ''));
    const monthlyValue = Number(a.monthlyValue || 0);
    const valueLeft = Math.max(0, monthsLeft * monthlyValue);

    return {
      id: this.quoteId,
      status,

      customerId: existing?.customerId ?? '',

      customerName: String(c.customerName || '').trim(),
      companyId: c.companyId ?? null,

      customerStartDate: String(a.customerStartDate || ''),
      currentAgreementStart: String(a.currentAgreementStart || ''),
      currentAgreementEnd: String(a.currentAgreementEnd || ''),

      monthsLeft,
      valueLeft,

      monthlyValue,

      optionNote: String(o.optionNote || ''),
      integration: !!o.integration,

      pdfReport: !!o.pdfReport,
      pdfYearSummary: !!o.pdfYearSummary,

      employeeAnalysis: !!o.employeeAnalysis,
      employeeAnalysisCount: Number(o.employeeAnalysisCount || 0),

      aiChat: !!o.aiChat,

      productType: (c.productType as any) || '',
      industry: (c.industry as any) || '',
      reportFrequency: (d.reportFrequency as any) || '',
      presentationFrequency: (d.presentationFrequency as any) || '',
      billingFrequency: (d.billingFrequency as any) || '',

      salesRep: String(c.salesRep || ''),
      contactName: String(c.contactName || ''),
      contactEmail: String(c.contactEmail || ''),
      contactPhone: String(c.contactPhone || ''),

      products,

      createdAtIso,
      updatedAtIso,
      approvedAtIso,
      convertedAtIso: existing?.convertedAtIso,
    };
  }

  private calcMonthsLeft(endYmd: string): number {
    const end = this.parseYmd(endYmd);
    if (!end) return 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    if (endDate <= today) return 0;

    const months =
      (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());

    const bump = endDate.getDate() >= today.getDate() ? 1 : 0;
    return Math.max(0, months + bump);
  }

  private parseYmd(ymd: string): Date | null {
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  private makeId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private patchFromQuote(q: Quote): void {
    this.form.patchValue({
      customer: {
        customerName: q.customerName,
        companyId: q.companyId,
        industry: q.industry,
        productType: q.productType,
        salesRep: q.salesRep,
        contactName: q.contactName,
        contactEmail: q.contactEmail,
        contactPhone: q.contactPhone,
      },
      agreement: {
        customerStartDate: q.customerStartDate,
        currentAgreementStart: q.currentAgreementStart,
        currentAgreementEnd: q.currentAgreementEnd,
        monthlyValue: q.monthlyValue,
      },
      options: {
        optionNote: q.optionNote,
        integration: q.integration,
        pdfReport: q.pdfReport,
        pdfYearSummary: q.pdfYearSummary,
        employeeAnalysis: q.employeeAnalysis,
        employeeAnalysisCount: q.employeeAnalysisCount,
        aiChat: q.aiChat,
      },
      delivery: {
        reportFrequency: q.reportFrequency,
        presentationFrequency: q.presentationFrequency,
        billingFrequency: q.billingFrequency,
      },
      products: q.products,
    });
  }

  goHome() {
    this.router.navigate(['/customers']);
  }
}
