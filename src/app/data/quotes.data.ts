import { Product } from './customers.data';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'CONVERTED';

export type ProductType = 'Customer service' | 'Survey' | 'X';
export type Industry = 'Bostad' | 'Kontaktcenter' | 'X';
export type ReportFrequency = 'Varje månad' | 'Varannan månad' | 'Kvartal';
export type PresentationFrequency =
  | 'Varje månad'
  | 'Varannan månad'
  | 'Kvartal'
  | 'Tertial'
  | 'Halvår'
  | 'Helår'
  | 'Annat';
export type BillingFrequency = 'Varje månad' | 'Kvartal' | 'År' | 'Annat';

export interface Quote {
  id: string;
  status: QuoteStatus;

  customerId: string;       
  customerName: string;
  companyId: number | null;

  // “Kundstart” och “nuvarande avtal”
  customerStartDate: string;        
  currentAgreementStart: string;    
  currentAgreementEnd: string;      

  // Visa i kundprofil
  monthsLeft: number;
  valueLeft: number;

  // pengar
  monthlyValue: number;

  // options
  optionNote: string;
  integration: boolean;

  pdfReport: boolean;
  pdfYearSummary: boolean;

  employeeAnalysis: boolean;
  employeeAnalysisCount: number;

  aiChat: boolean;

  // klassificering
  productType: ProductType | '';
  industry: Industry | '';
  reportFrequency: ReportFrequency | '';
  presentationFrequency: PresentationFrequency | '';
  billingFrequency: BillingFrequency | '';

  // ansvar
  salesRep: string;

  // kontakt
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // datakällor/produkter (du använder Product[] redan)
  products: Product[];

  
  createdAtIso: string;
  updatedAtIso: string;
  approvedAtIso?: string;
  convertedAtIso?: string;
}
