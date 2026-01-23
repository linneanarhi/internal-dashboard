import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Customer } from '../../../data/customers.data';
import { CustomerStoreService } from '../../../Services/customer-store.service';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quotes.html',
})
export class QuotesComponent {
  customers: Customer[] = [];

  constructor(
    private store: CustomerStoreService,
    private location: Location,
  ) {
    this.store.customers$.subscribe((list) => {
      this.customers = list;
    });
  }

  get sentQuotes(): Customer[] {
    return this.customers.filter((c) => c.stage === 'QUOTE_SENT');
  }

  get approvedQuotes(): Customer[] {
    return this.customers.filter((c) => c.stage === 'QUOTE_APPROVED');
  }

  get agreementDrafts(): Customer[] {
    return this.customers.filter((c) => c.stage === 'AGREEMENT_DRAFT');
  }

  get completed(): Customer[] {
    return this.customers.filter((c) => c.stage === 'ACTIVE');
  }

  goBack(): void {
    this.location.back();
  }
}
