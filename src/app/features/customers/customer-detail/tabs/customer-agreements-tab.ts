import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Customer } from '../../../../data/customers.data';

@Component({
  selector: 'app-customer-agreements-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-agreements-tab.html',
})
export class CustomerAgreementsTabComponent {
  @Input({ required: true }) customer!: Customer;

  @Input() canApproveQuote = false;
  @Input() canActivateAgreement = false;

  @Input({ required: true }) statusLabel!: string;

  @Input({ required: true }) nextAction!: string;

  @Output() approveQuote = new EventEmitter<void>();
  @Output() activateAgreement = new EventEmitter<void>();

  // TODO senare: outputs för cancelQuote / createNewQuote / etc.
}
