import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Customer } from '../../../../data/customers.data';

@Component({
  selector: 'app-customer-users-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-users-tab.html',
})
export class CustomerUsersTabComponent {
  @Input({ required: true }) customer!: Customer;
}
