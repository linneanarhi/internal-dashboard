import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
export class ActivateAgreement implements OnInit {
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

  quoteId = '';
  quote: Quote | undefined;

  customerId = '';
  agreementId = '';

  // Gatekeeping
  setupStatus: 'INCOMPLETE' | 'COMPLETE' | 'UNKNOWN' = 'UNKNOWN';
  canActivate = false;

  error: string | null = null;

  // ✅ Viktigt: inga fb-anrop här
  form!: FormGroup;

  ngOnInit(): void {
    // ✅ skapa form här (fb finns nu)
    this.form = this.fb.group({
      agreementName: ['', [Validators.required, Validators.minLength(2)]],
      note: [''],
    });

    this.quoteId = this.route.snapshot.queryParamMap.get('quoteId') ?? '';

    if (!this.quoteId) {
      this.error = 'Saknar quoteId i URL.';
      return;
    }

    const q = this.quotes.getById(this.quoteId);
    if (!q) {
      this.error = 'Offerten hittades inte.';
      return;
    }

    this.quote = q;

    if (!q.customerId) {
      this.error = 'Offerten saknar customerId.';
      return;
    }

    this.customerId = q.customerId;

    // Hämta kundens currentAgreementId (skapades i 4A när offerten blev APPROVED)
    const customer = this.customers.getById(this.customerId);
    this.agreementId = (customer as any)?.currentAgreementId ?? '';

    // Setup gate
    const setup = this.setups.getByCustomer(this.customerId);
    this.setupStatus = setup?.status ?? 'INCOMPLETE';

    this.canActivate = this.quote.status === 'APPROVED' && this.setupStatus === 'COMPLETE';

    // Förifyll
    this.form.patchValue({
      agreementName: `Avtal – ${this.quote.customerName}`,
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToTechnicalSetup(): void {
    if (!this.customerId) return;
    this.router.navigate(['/technical-setup'], {
      queryParams: { customerId: this.customerId },
    });
  }

  activate(): void {
    this.error = null;

    if (!this.quote || !this.customerId) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.setupStatus !== 'COMPLETE') {
      this.error = 'Teknisk uppsättning är inte klar. Slutför setup innan aktivering.';
      return;
    }

    if (!this.agreementId) {
      this.error = 'Saknar currentAgreementId på kunden. Godkänn offerten igen eller skapa avtal.';
      return;
    }

    // 1) Sätt avtal ACTIVE
    if (typeof (this.agreements as any).update === 'function') {
      (this.agreements as any).update(this.agreementId, { status: 'ACTIVE' });
    }

    // 2) (valfritt) uppdatera kundens stage
    this.customers.updateStage(this.customerId, 'ACTIVE');

    // 3) Redirect tillbaka till kund
    this.router.navigate(['/customers', this.customerId]);
  }
}
