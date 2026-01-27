export type Product = 'calls' | 'email' | 'chat' | 'cases' | 'other';

export type CustomerStatus = 'NEW' | 'ACTIVE';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED';
export type QuoteType = 'NEW' | 'ADDON';

export type AgreementStatus = 'PENDING_SETUP' | 'ACTIVE';

export type SetupStatus = 'INCOMPLETE' | 'COMPLETE';

export type Customer = {
  id: string;
  name: string;
  email: string;
  companyId: number;
  createdAt: string; // ISO för enkelhet i UI
  products: Product[];
  usersCount: number;

  status: CustomerStatus;

  // pekare (så vi vet “nuvarande”)
  currentQuoteId?: string;
  currentAgreementId?: string;
};

export type Quote = {
  id: string;
  customerId: string;
  companyId: number;
  customerName: string;
  status: QuoteStatus;
  type: QuoteType;
  createdAtIso: string;
  updatedAtIso: string;
  products: Product[];
  pdfUrl?: string; // mock
};

export type Agreement = {
  id: string;
  customerId: string;
  status: AgreementStatus;
  createdAtIso: string;
  products: Product[];
  pdfUrl?: string; // mock
};

export type TechnicalSetup = {
  customerId: string;
  status: SetupStatus;
  apiKeys: { name: string; masked: string }[];
  dataSources: { name: string; status: 'DISCONNECTED' | 'CONNECTED' }[];
};
