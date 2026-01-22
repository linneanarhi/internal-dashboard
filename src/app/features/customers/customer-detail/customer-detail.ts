import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CUSTOMERS, Customer } from '../../../data/customers.data'; 

type TabId =
  | 'services'
  | 'agreement'
  | 'sources'
  | 'addons'
  | 'users'
  | 'comments';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-detail.html',
})
export class CustomerDetailComponent {
  id = '';
  customer: Customer | null = null;

  activeTab: TabId = 'services';

  tabs: { id: TabId; label: string }[] = [
    { id: 'services', label: 'Aktiva tjänster' },
    { id: 'agreement', label: 'Avtal och kontakt' },
    { id: 'sources', label: 'Datakällor' },
    { id: 'addons', label: 'Tilläggsavtal' },
    { id: 'users', label: 'Aktiva användare' },
    { id: 'comments', label: 'Om kunden' },
  ];

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.customer = CUSTOMERS.find((c) => c.id === this.id) ?? null;
  }

  goBack(): void {
    this.location.back();
  }
}
