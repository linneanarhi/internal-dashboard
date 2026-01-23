import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Customer } from '../../../../data/customers.data';

@Component({
  selector: 'app-customer-sources-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-sources-tab.html',
})
export class CustomerSourcesTabComponent {
  @Input({ required: true }) customer!: Customer;
  @Output() goTechnicalSetup = new EventEmitter<void>();
}
