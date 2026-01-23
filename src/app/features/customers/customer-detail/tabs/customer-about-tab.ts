import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Customer } from '../../../../data/customers.data';

@Component({
  selector: 'app-customer-about-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-about-tab.html',
})
export class CustomerAboutTabComponent {
  @Input({ required: true }) customer!: Customer;
}
