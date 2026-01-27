import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';

import { QuoteStoreService } from '../../../Services/quote-store.service';
import { CustomerStoreService } from '../../../Services/customer-store.service';
import { AgreementStoreService } from '../../../Services/agreement-store.service';
import { SetupStoreService } from '../../../Services/setup-store.service';

import { Quote } from '../../../data/quotes.data';

@Component({
  selector: 'app-activate-agreement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './activate-agreement.html',
})
export class ActivateAgreement implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private quotes: QuoteStoreService,
    private customers: CustomerStoreService,
    private agreements: AgreementStoreService,
    private setups: SetupStoreService,
  ) {}

  private sub = new Subscription();

  quoteId = '';
  quote: Quote | undefined;

  customerId = '';
  agreementId = '';

  setupStatus: 'INCOMPLETE' | 'COMPLETE' | 'UNKNOWN' = 'UNKNOWN';
  canActivate = false;

  error: string | null = null;

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      agreementName: ['', [Validators.required, Validators.minLength(2)]],
      note: [''],
    });

    this.quoteId = this.route.snapshot.queryParamMap.get('quoteId') ?? '';
    if (!this.quoteId) {
      this.error = 'Saknar quoteId i URL.';
      return;
    }

    this.sub.add(
      combineLatest([
        this.quotes.quotes$,
        (this.agreements as any).agreements$ ?? this.quotes.quotes$,
        (this.setups as any).setups$ ?? this.quotes.quotes$,
      ] as any).subscribe(() => this.hydrate()),
    );

    this.hydrate();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private hydrate(): void {
    this.error = null;

    const q = this.quotes.getById(this.quoteId);
    if (!q) {
      this.quote = undefined;
      this.canActivate = false;
      this.error = 'Offerten hittades inte.';
      return;
    }

    this.quote = q;

    if (!q.customerId) {
      this.canActivate = false;
      this.error = 'Offerten saknar customerId.';
      return;
    }

    this.customerId = q.customerId;

    const customer = this.customers.getById(this.customerId);
    this.agreementId = (customer as any)?.currentAgreementId ?? '';

    const setup = this.setups.getByCustomer(this.customerId);
    this.setupStatus = setup?.status ?? 'UNKNOWN';

    this.canActivate = this.quote.status === 'APPROVED' && this.setupStatus === 'COMPLETE';

    const currentName = this.form.get('agreementName')?.value;
    if (!currentName) {
      this.form.patchValue({
        agreementName: `Avtal – ${this.quote.customerName}`,
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  goToTechnicalSetup(): void {
    if (!this.customerId) return;
    this.router.navigate(['/technical-setup'], {
      queryParams: { customerId: this.customerId, quoteId: this.quoteId },
    });
  }

  activate(): void {
    this.error = null;

    if (!this.quote || !this.customerId) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.quote.status !== 'APPROVED') {
      this.error = 'Offerten måste vara godkänd innan aktivering.';
      return;
    }

    if (this.setupStatus !== 'COMPLETE') {
      this.error = 'Teknisk uppsättning är inte klar. Slutför setup innan aktivering.';
      return;
    }

    // Om avtal inte finns än: skapa det nu
    if (!this.agreementId) {
      const created = this.agreements.createAgreement({
        customerId: this.customerId,
        status: 'PENDING_SETUP',
        products: (this.quote as any)?.products ?? [],
        pdfUrl: (this.quote as any)?.pdfUrl,
      });

      this.agreementId = created.id;
      this.customers.setCurrentAgreement(this.customerId, created.id);

      this.customers.updateStage(this.customerId, 'AGREEMENT_DRAFT');
    }

    // 1) sätt avtal ACTIVE
    if (typeof (this.agreements as any).update === 'function') {
      (this.agreements as any).update(this.agreementId, { status: 'ACTIVE' });
    } else {
      this.error = 'AgreementStoreService saknar update().';
      return;
    }

    // 2) stage (bakåtkomp)
    this.customers.updateStage(this.customerId, 'ACTIVE');

    // 3) tillbaka till kund
    this.router.navigate(['/customers', this.customerId]);
  }
}
