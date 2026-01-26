import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CustomerStoreService } from '../../../Services/customer-store.service';
import { QuoteStoreService } from '../../../Services/quote-store.service';
import { AgreementStoreService } from '../../../Services/agreement-store.service';
import { SetupStoreService } from '../../../Services/setup-store.service';

import { Customer } from '../../../data/customers.data';
import { Quote } from '../../../data/quotes.data';

// Tabs (dina standalone-komponenter)
import { CustomerDashboardTabComponent } from './tabs/customer-dashboard-tab';
import { CustomerAgreementsTabComponent } from './tabs/customer-agreements-tab';
import { CustomerSourcesTabComponent } from './tabs/customer-sources-tab';
import { CustomerUsersTabComponent } from './tabs/customer-users-tab';
import { CustomerAboutTabComponent } from './tabs/customer-about-tab';

type TabId = 'dashboard' | 'agreements' | 'sources' | 'users' | 'about';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CustomerDashboardTabComponent,
    CustomerAgreementsTabComponent,
    CustomerSourcesTabComponent,
    CustomerUsersTabComponent,
    CustomerAboutTabComponent,
  ],
  templateUrl: './customer-detail.html',
})
export class CustomerDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private customers: CustomerStoreService,
    private quotes: QuoteStoreService,
    private agreements: AgreementStoreService,
    private setups: SetupStoreService,
  ) {}

  id = '';

  customer: Customer | undefined;

  currentQuote: Quote | undefined;
  currentAgreement: any | undefined;
  currentSetup: any | undefined;

  activeTab: TabId = 'dashboard';
  tabs = [
    { id: 'dashboard' as const, label: 'Dashboard' },
    { id: 'agreements' as const, label: 'Avtal & Offerter' },
    { id: 'sources' as const, label: 'Datakällor' },
    { id: 'users' as const, label: 'Aktiva användare' },
    { id: 'about' as const, label: 'Om kunden' },
  ];

  statusLabel = '—';
  nextAction = '—';
  isActive = false;

  canApproveQuote = false;
  canActivateAgreement = false;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.hydrate();
  }

  goBack(): void {
    this.location.back();
  }

  approveQuote(): void {
    if (!this.currentQuote) return;

    this.quotes.updateStatus(this.currentQuote.id, 'APPROVED');
    this.hydrate(); // uppdatera UI direkt
    this.goToActivateAgreement();
  }

  goToActivateAgreement(): void {
    const quoteId = this.currentQuote?.id;
    if (!quoteId) return;

    this.router.navigate(['/agreements/activate'], {
      queryParams: { quoteId },
    });
  }

  goToTechnicalSetup(): void {
    if (!this.customer) return;

    this.router.navigate(['/technical-setup'], {
      queryParams: { customerId: this.customer.id },
    });
  }

  goToCreateQuote(): void {
    this.router.navigate(['/quote/new'], {
      queryParams: { customerId: this.id },
    });
  }

  goToAddProduct(): void {
    this.router.navigate(['/customers', this.id, 'add-product']);
  }

  editQuote(): void {
  const quoteId = this.currentQuote?.id;
  if (!quoteId) return;
  this.router.navigate(['/quote', quoteId]);
}


  openService(): void {}

  private hydrate(): void {
    if (!this.id) return;

    this.customer = this.customers.getById(this.id);
    if (!this.customer) {
      this.resetUi();
      return;
    }

    const qid = (this.customer as any).currentQuoteId as string | undefined;
    const aid = (this.customer as any).currentAgreementId as string | undefined;

    this.currentQuote = qid ? this.quotes.getById(qid) : undefined;

    // AgreementStore: om getById finns, använd den, annars undefined
    this.currentAgreement =
      aid && typeof (this.agreements as any).getById === 'function'
        ? (this.agreements as any).getById(aid)
        : undefined;

    // SetupStore: du har getByCustomer
    this.currentSetup = this.setups.getByCustomer(this.customer.id);

    const quoteStatus = this.currentQuote?.status;
    const agreementStatus = this.currentAgreement?.status as string | undefined;
    const setupStatus = this.currentSetup?.status as string | undefined;

    const agreementActive = agreementStatus === 'ACTIVE';
    const setupComplete = setupStatus === 'COMPLETE';

    this.isActive = agreementActive && setupComplete;

    this.canApproveQuote =
      !!this.currentQuote && (quoteStatus === 'DRAFT' || quoteStatus === 'SENT');
    this.canActivateAgreement = quoteStatus === 'APPROVED' && !this.isActive;

    if (this.isActive) {
      this.statusLabel = 'Klar';
      this.nextAction = 'Inget – kunden är aktiv';
      return;
    }

    if (!this.currentQuote) {
      this.statusLabel = 'Ny kund';
      this.nextAction = 'Skapa offert';
      return;
    }

    if (quoteStatus === 'DRAFT') {
      this.statusLabel = 'Offert: Utkast';
      this.nextAction = 'Skicka offert';
      return;
    }

    if (quoteStatus === 'SENT') {
      this.statusLabel = 'Offert: Skickad';
      this.nextAction = 'Vänta på godkännande / Godkänn manuellt';
      return;
    }

    if (quoteStatus === 'APPROVED') {
      this.statusLabel = 'Offert: Godkänd';
      if (!this.currentAgreement) {
        this.nextAction = 'Aktivera avtal';
      } else if (!setupComplete) {
        this.nextAction = 'Teknisk uppsättning';
      } else {
        this.nextAction = 'Aktivera avtal';
      }
      return;
    }

    if (quoteStatus === 'REJECTED') {
      this.statusLabel = 'Offert: Avslagen';
      this.nextAction = 'Skapa ny offert';
      return;
    }

    if (quoteStatus === 'CONVERTED') {
      this.statusLabel = 'Konverterad';
      this.nextAction = setupComplete ? 'Aktivera avtal' : 'Teknisk uppsättning';
      return;
    }

    this.statusLabel = 'Pågående';
    this.nextAction = 'Fortsätt i flödet';
  }

  private resetUi(): void {
    this.customer = undefined;
    this.currentQuote = undefined;
    this.currentAgreement = undefined;
    this.currentSetup = undefined;

    this.statusLabel = '—';
    this.nextAction = '—';
    this.isActive = false;

    this.canApproveQuote = false;
    this.canActivateAgreement = false;
  }
}
