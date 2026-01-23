import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Customer, Product } from '../../../../data/customers.data';

type ProductCard = {
  id: Product;
  label: string;
  description: string;
  active: boolean;
};

@Component({
  selector: 'app-customer-dashboard-tab',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-dashboard-tab.html',
})
export class CustomerDashboardTabComponent {
  @Input({ required: true }) customer!: Customer;
  @Input({ required: true }) customerId!: string;

  @Input() canApproveQuote = false;
  @Input() canActivateAgreement = false;

  // Precomputed labels from parent (keeps this tab dumb)
  @Input({ required: true }) statusLabel!: 'Klar' | 'Åtgärd';
  @Input({ required: true }) nextAction!: string;
  @Input() isActive = false;

  @Output() approveQuote = new EventEmitter<void>();
  @Output() activateAgreement = new EventEmitter<void>();
  @Output() addProduct = new EventEmitter<void>();
  @Output() goTechnicalSetup = new EventEmitter<void>();
  @Output() openService = new EventEmitter<Product>();

  private readonly allProducts: { id: Product; label: string; description: string }[] = [
    { id: 'calls', label: 'Samtal', description: 'Telefoni- och samtalsdata.' },
    { id: 'email', label: 'Mejl', description: 'E-postflöden och logik.' },
    { id: 'chat', label: 'Chatt', description: 'Chattkanaler och historik.' },
    { id: 'cases', label: 'Ärendeanteckningar', description: 'Anteckningar och uppföljning.' },
  ];

  productCards(products: Product[] | undefined | null): ProductCard[] {
    const set = new Set(products ?? []);
    return this.allProducts.map((p) => ({
      id: p.id,
      label: p.label,
      description: p.description,
      active: set.has(p.id),
    }));
  }
}
