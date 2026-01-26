import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CustomerStoreService } from '../../../Services/customer-store.service';
import { SetupStoreService } from '../../../Services/setup-store.service';
import { AgreementStoreService } from '../../../Services/agreement-store.service';

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
    private agreements: AgreementStoreService,
  ) {}

  customerId = '';
  customerName = '';

  // “setup-modell” (enkelt)
  status: 'INCOMPLETE' | 'COMPLETE' = 'INCOMPLETE';

  apiKeyName = 'Primary API key';
  apiKeyMasked = '••••••••••1234';

  dataSourceName = 'Telefoni';
  dataSourceStatus: 'DISCONNECTED' | 'CONNECTED' = 'DISCONNECTED';

  ngOnInit(): void {
    this.customerId = this.route.snapshot.queryParamMap.get('customerId') ?? '';

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

  markComplete(): void {
    if (!this.customerId) return;

    // 1) setup COMPLETE
    this.status = 'COMPLETE';
    this.save();

    // 2) om kunden har avtal → sätt ACTIVE
    const customer = this.customers.getById(this.customerId);
    const agreementId = (customer as any)?.currentAgreementId as string | undefined;

    if (agreementId && typeof (this.agreements as any).update === 'function') {
      (this.agreements as any).update(agreementId, { status: 'ACTIVE' });
    }

    // 3) tillbaka till kund
    this.router.navigate(['/customers', this.customerId]);
  }
}
