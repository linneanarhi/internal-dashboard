import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CustomerStoreService } from '../../../Services/customer-store.service';
import { SetupStoreService } from '../../../Services/setup-store.service';

@Component({
  selector: 'app-technical-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './technical-setup.html',
})
export class TechnicalSetupComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private customers: CustomerStoreService,
    private setups: SetupStoreService,
  ) {}

  customerId = '';
  customerName = '';

  // Kommer vi från aktivera-sidan?
  returnQuoteId = '';

  // “setup-modell” (enkelt)
  status: 'INCOMPLETE' | 'COMPLETE' = 'INCOMPLETE';

  apiKeyName = 'Primary API key';
  apiKeyMasked = '••••••••••1234';

  dataSourceName = 'Telefoni';
  dataSourceStatus: 'DISCONNECTED' | 'CONNECTED' = 'DISCONNECTED';

  // ✅ Modal state
  showAfterCompleteModal = false;

  ngOnInit(): void {
    this.customerId = this.route.snapshot.queryParamMap.get('customerId') ?? '';
    this.returnQuoteId = this.route.snapshot.queryParamMap.get('quoteId') ?? '';

    const customer = this.customerId ? this.customers.getById(this.customerId) : undefined;
    this.customerName = customer?.name ?? '';

    const existing = this.customerId ? this.setups.getByCustomer(this.customerId) : undefined;

    if (existing) {
      this.status = existing.status;
      this.apiKeyName = existing.apiKeys?.[0]?.name ?? this.apiKeyName;
      this.apiKeyMasked = existing.apiKeys?.[0]?.masked ?? this.apiKeyMasked;

      this.dataSourceName = existing.dataSources?.[0]?.name ?? this.dataSourceName;
      this.dataSourceStatus = existing.dataSources?.[0]?.status ?? this.dataSourceStatus;
    } else if (this.customerId) {
      // skapa en stub så sidan alltid har något
      this.setups.upsert({
        customerId: this.customerId,
        status: 'INCOMPLETE',
        apiKeys: [{ name: this.apiKeyName, masked: this.apiKeyMasked }],
        dataSources: [{ name: this.dataSourceName, status: this.dataSourceStatus }],
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (!this.customerId) return;

    this.setups.upsert({
      customerId: this.customerId,
      status: this.status,
      apiKeys: [{ name: this.apiKeyName, masked: this.apiKeyMasked }],
      dataSources: [{ name: this.dataSourceName, status: this.dataSourceStatus }],
    });
  }

  /**
   * ✅ Markera COMPLETE men aktivera INTE avtalet här.
   * Efteråt: visa modal och låt användaren välja vart den vill.
   */
  markComplete(): void {
    if (!this.customerId) return;

    this.status = 'COMPLETE';
    this.save();

    // Visa fråga
    this.showAfterCompleteModal = true;
  }

  // ✅ Modal actions
  closeModal(): void {
    this.showAfterCompleteModal = false;
  }

  goHome() {
    this.router.navigate(['/customers']);
  }

  goToCustomer(): void {
    this.showAfterCompleteModal = false;
    this.router.navigate(['/customers', this.customerId]);
  }

  goToActivateAgreement(): void {
    this.showAfterCompleteModal = false;

    // Om vi kom hit från ActivateAgreement skickar vi tillbaka samma quoteId
    if (this.returnQuoteId) {
      this.router.navigate(['/agreements/activate'], {
        queryParams: { quoteId: this.returnQuoteId },
      });
      return;
    }

    // Annars kan man inte aktivera utan quoteId (activate-sidan kräver quoteId)
    // Så vi går tillbaka till kunden i så fall.
    this.router.navigate(['/customers', this.customerId]);
  }
}
