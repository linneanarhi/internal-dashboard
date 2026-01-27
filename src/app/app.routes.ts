import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'customers' },

      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers/customers').then((m) => m.CustomersComponent),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customer-detail/customer-detail').then(
            (m) => m.CustomerDetailComponent,
          ),
      },
      {
        path: 'customers/:id/add-product',
        loadComponent: () =>
          import('./features/customers/add-product/add-product').then((m) => m.AddProduct),
      },

      {
        path: 'quote/new',
        loadComponent: () =>
          import('./features/quote/create-quote/create-quote').then((m) => m.QuoteNewComponent),
      },
      {
        path: 'quote/:id',
        loadComponent: () =>
          import('./features/quote/create-quote/create-quote').then((m) => m.QuoteNewComponent),
      },
      {
        path: 'agreements/activate',
        loadComponent: () =>
          import('./features/agreements/activate-agreement/activate-agreement').then(
            (m) => m.ActivateAgreement,
          ),
      },

      {
        path: 'technical-setup',
        loadComponent: () =>
          import('./features/technical/technical-setup/technical-setup').then(
            (m) => m.TechnicalSetupComponent,
          ),
      },

      {
        path: 'quotes',
        loadComponent: () =>
          import('./features/quote/quotes/quotes').then((m) => m.QuotesComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'customers' },
];
