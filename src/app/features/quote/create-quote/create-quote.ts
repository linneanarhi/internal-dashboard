import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerStoreService } from '../../../Services/customer-store.service';
import { Product } from '../../../data/customers.data';

@Component({
  selector: 'app-quote-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-quote.html',
})
export class QuoteNewComponent {
  constructor(private store: CustomerStoreService, private location: Location, private router: Router) {}

  name = '';
  email = '';
  companyId: number | null = null;
  startDate = ''; // "YYYY-MM-DD"
  products: Product[] = [];

  toggleProduct(p: Product, checked: boolean) {
    this.products = checked
      ? [...this.products, p]
      : this.products.filter((x) => x !== p);
  }

    goBack(): void {
    this.location.back();
  }

  save(): void {
    if (!this.name || !this.email || !this.companyId || !this.startDate) return;

    const [y, m, d] = this.startDate.split('-').map(Number);
    const createdAt = new Date(y, m - 1, d);

    const newCustomer = this.store.addCustomerFromQuote({
      name: this.name,
      email: this.email,
      companyId: this.companyId,
      products: this.products,
      createdAt,
    });

    // tillbaka till listan (eller öppna kund)
    this.router.navigate(['/customers']);
    // alternativ: this.router.navigate(['/customers', newCustomer.id]);
  }
}

